const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { PrismaClient } = require("@prisma/client");
const { PostService } = require("./post.service");
const { ChallengeService } = require("./challenge.service");
const { buildBlockContext } = require("../contexts/block.context");

const prisma = new PrismaClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;

function buildAiUrl(path) {
    const base = String(AI_SERVICE_URL || "").replace(/\/+$/, "");
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return `${base}/${cleanPath}`;
}

function getAuthHeaders(extra = {}) {
    return {
        Authorization: `Bearer ${INTERNAL_TOKEN}`,
        ...extra,
    };
}

function truncateText(value, maxLength = 140) {
    const text = String(value || "").replace(/\s+/g, " ").trim();

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength)}...`;
}

function mapPostToCard(post) {
    const topic =
        post.primaryTopic?.name ||
        post.topic?.name ||
        post.Topic?.name ||
        post.topics?.[0]?.name ||
        post.PostTopics?.[0]?.Topic?.name ||
        null;

    const author =
        post.User?.fullname ||
        post.User?.username ||
        post.user?.fullname ||
        post.user?.username ||
        "Unknown";

    return {
        id: String(post.id),
        type: "POST",
        title: post.title || "Untitled post",
        description: truncateText(post.content || "No description"),
        meta: topic ? `#${topic} • ${author}` : author,
        url: `/discuss/${post.id}`,
    };
}

function mapChallengeToCard(challenge) {
    const topics = Array.isArray(challenge.topics)
        ? challenge.topics
            .map((topic) => topic?.name)
            .filter(Boolean)
            .slice(0, 2)
        : [];

    const metaParts = [
        challenge.type,
        challenge.difficulty,
        topics.length ? topics.map((topic) => `#${topic}`).join(" ") : "",
    ].filter(Boolean);

    return {
        id: String(challenge.id),
        type: "CHALLENGE",
        title: challenge.title || "Untitled challenge",
        description: truncateText(
            challenge.description ||
            challenge.input ||
            "Practice this challenge to improve your programming skills."
        ),
        meta: metaParts.join(" • "),
        url: `/challenges/${challenge.id}`,
    };
}

function normalizeCards(cards = []) {
    if (!Array.isArray(cards)) {
        return [];
    }

    return cards
        .filter((card) => card && card.id && card.type && card.title)
        .map((card) => ({
            id: String(card.id),
            type: card.type,
            title: String(card.title || ""),
            description: String(card.description || ""),
            meta: String(card.meta || ""),
            url: String(card.url || ""),
        }));
}

async function classifyIntent(userQuestion, formattedHistory) {
    try {
        const resp = await axios.post(
            buildAiUrl("/chat/intent"),
            {
                message: userQuestion,
                messages: formattedHistory,
            },
            {
                timeout: 30000,
                headers: getAuthHeaders(),
            }
        );

        if (!resp.data.success) {
            console.error("[AIService] Intent classification failed:", resp.data.error);

            return {
                intent: "GENERAL_CHAT",
                target_types: [],
                query: "",
                filters: {
                    challenge_type: null,
                    difficulty: null,
                    topic: null,
                },
                language: "en",
                needs_cards: false,
            };
        }

        return resp.data.intent;
    } catch (error) {
        console.error("[AIService] Intent classification error:", error.message);

        return {
            intent: "GENERAL_CHAT",
            target_types: [],
            query: "",
            filters: {
                challenge_type: null,
                difficulty: null,
                topic: null,
            },
            language: "en",
            needs_cards: false,
        };
    }
}

function inferTargetTypesFromLastCards(lastCards = []) {
    const normalized = normalizeCards(lastCards);
    const types = [];

    if (normalized.some((card) => card.type === "POST")) {
        types.push("POST");
    }

    if (normalized.some((card) => card.type === "CHALLENGE")) {
        types.push("CHALLENGE");
    }

    return types;
}

function normalizeIntentForCandidates(intentResult, lastCards = []) {
    const normalizedLastTypes = inferTargetTypesFromLastCards(lastCards);

    const rawTargetTypes = Array.isArray(intentResult?.target_types)
        ? intentResult.target_types.filter((type) =>
            ["POST", "CHALLENGE"].includes(type)
        )
        : [];

    const intent = intentResult?.intent || "GENERAL_CHAT";

    if (intent === "REFINE_RESULTS") {
        return {
            intent: "REFINE_RESULTS",
            target_types: normalizedLastTypes.length
                ? normalizedLastTypes
                : rawTargetTypes.length
                    ? rawTargetTypes
                    : ["POST", "CHALLENGE"],
            query: "",
            filters: intentResult.filters || {},
            language: "en",
            needs_cards: true,
        };
    }

    if (intentResult?.needs_cards) {
        return {
            intent,
            target_types: rawTargetTypes.length
                ? rawTargetTypes
                : normalizedLastTypes.length
                    ? normalizedLastTypes
                    : ["POST", "CHALLENGE"],
            query: String(intentResult.query || "").trim(),
            filters: intentResult.filters || {},
            language: "en",
            needs_cards: true,
        };
    }

    if (normalizedLastTypes.length) {
        return {
            intent: "REFINE_RESULTS",
            target_types: normalizedLastTypes,
            query: "",
            filters: {},
            language: "en",
            needs_cards: true,
        };
    }

    return {
        intent,
        target_types: [],
        query: "",
        filters: intentResult.filters || {},
        language: "en",
        needs_cards: false,
    };
}

async function buildCandidateCardsFromIntent(userId, intentResult) {
    if (!intentResult?.needs_cards) {
        return [];
    }

    const targetTypes = Array.isArray(intentResult.target_types)
        ? intentResult.target_types
        : [];

    const filters = intentResult.filters || {};
    const query = String(intentResult.query || "").trim();

    const cards = [];
    const blockContext = await buildBlockContext(userId);

    if (targetTypes.includes("POST")) {
        const postQuery = {
            q: query || filters.topic || "",
            page: 1,
            limit: targetTypes.length === 1 ? 20 : 10,
            sortBy: "Newest",
        };

        console.log("[AIService] Post query:", postQuery);

        const postResult = await PostService.list(
            postQuery,
            {
                viewerId: userId,
                blockContext,
            }
        );

        const posts = Array.isArray(postResult?.data) ? postResult.data : [];
        cards.push(...posts.map(mapPostToCard));
    }

    if (targetTypes.includes("CHALLENGE")) {
        const challengeQuery = {
            page: 1,
            limit: targetTypes.length === 1 ? 20 : 10,
            sortBy: "newest",
        };

        if (filters.challenge_type) {
            challengeQuery.type = filters.challenge_type;
        }

        if (filters.difficulty) {
            challengeQuery.difficulty = filters.difficulty;
        }

        const typeAsText = String(filters.challenge_type || "").toLowerCase();
        const cleanQuery = query.trim();

        if (cleanQuery && cleanQuery.toLowerCase() !== typeAsText) {
            challengeQuery.q = cleanQuery;
        }

        console.log("[AIService] Challenge query:", challengeQuery);

        const challengeResult = await ChallengeService.list(
            challengeQuery,
            userId
        );

        const challenges = Array.isArray(challengeResult?.data)
            ? challengeResult.data
            : [];

        cards.push(...challenges.map(mapChallengeToCard));
    }

    return cards;
}

async function selectCardsWithAI(userQuestion, formattedHistory, candidates, lastCards) {
    try {
        const resp = await axios.post(
            buildAiUrl("/chat/select-cards"),
            {
                message: userQuestion,
                messages: formattedHistory,
                candidates,
                last_cards: normalizeCards(lastCards),
            },
            {
                timeout: 30000,
                headers: getAuthHeaders(),
            }
        );

        if (!resp.data.success) {
            console.error("[AIService] Card selection failed:", resp.data.error);

            return {
                reply: "",
                selected_card_ids: [],
                reason: "",
            };
        }

        return {
            reply: resp.data.reply || "",
            selected_card_ids: Array.isArray(resp.data.selected_card_ids)
                ? resp.data.selected_card_ids.map(String)
                : [],
            reason: resp.data.reason || "",
        };
    } catch (error) {
        console.error("[AIService] Card selection error:", error.message);

        return {
            reply: "",
            selected_card_ids: [],
            reason: "",
        };
    }
}

function pickSelectedCards(candidates, selectedIds) {
    const ids = new Set((selectedIds || []).map(String));

    if (!ids.size) {
        return [];
    }

    return candidates.filter((card) => ids.has(String(card.id))).slice(0, 8);
}

function fallbackCardReply(cards) {
    const postCount = cards.filter((item) => item.type === "POST").length;
    const challengeCount = cards.filter((item) => item.type === "CHALLENGE").length;

    if (!cards.length) {
        return "I couldn't find matching content in WindFlow for that request.";
    }

    if (postCount && challengeCount) {
        return `I found **${postCount} posts** and **${challengeCount} challenges** from WindFlow. Browse the cards below and click one to open it directly.`;
    }

    if (postCount) {
        return `I found **${postCount} posts** from WindFlow. Browse the cards below and click one to read it.`;
    }

    return `I found **${challengeCount} challenges** from WindFlow. Browse the cards below and click one to start practicing.`;
}

const AIService = {
    generateReply: async (userId, userQuestion, lastCards = []) => {
        try {
            const historyData = await prisma.alMessage.findMany({
                where: { user_id: userId },
                orderBy: { sent_at: "desc" },
                take: 3,
            });

            const formattedHistory = historyData
                .reverse()
                .map((msg) => ({
                    role: msg.role || (msg.is_from_ai ? "assistant" : "user"),
                    content: msg.content,
                }));

            formattedHistory.push({ role: "user", content: userQuestion });

            const rawIntentResult = await classifyIntent(userQuestion, formattedHistory);
            const intentResult = normalizeIntentForCandidates(rawIntentResult, lastCards);

            console.log("[AIService] Raw Intent:", rawIntentResult);
            console.log("[AIService] Normalized Intent:", intentResult);

            let cards = [];
            let aiAnswer = "";

            if (intentResult.needs_cards) {
                const candidates = await buildCandidateCardsFromIntent(userId, intentResult);

                const selectedResult = await selectCardsWithAI(
                    userQuestion,
                    formattedHistory,
                    candidates,
                    lastCards
                );

                cards = pickSelectedCards(candidates, selectedResult.selected_card_ids);

                if (
                    !cards.length &&
                    candidates.length &&
                    rawIntentResult.needs_cards &&
                    intentResult.intent !== "REFINE_RESULTS"
                ) {
                    cards = candidates.slice(0, 8);
                }

                aiAnswer = fallbackCardReply(cards);
            } else {
                const resp = await axios.post(
                    buildAiUrl("/chat"),
                    {
                        message: userQuestion,
                        messages: formattedHistory,
                    },
                    {
                        timeout: 60000,
                        headers: getAuthHeaders(),
                    }
                );

                if (!resp.data.success) {
                    console.error("[AIService] AI Server returned error:", resp.data.error);
                    throw new Error(resp.data.error || "AI Server failed processing");
                }

                aiAnswer = resp.data.reply;
            }

            await prisma.$transaction([
                prisma.alMessage.create({
                    data: {
                        user_id: userId,
                        content: userQuestion,
                        role: "user",
                    },
                }),
                prisma.alMessage.create({
                    data: {
                        user_id: userId,
                        content: aiAnswer,
                        role: "assistant",
                    },
                }),
            ]);

            return {
                reply: aiAnswer,
                cards,
            };
        } catch (err) {
            console.error("[AIService] Error:", err.message);
            throw new Error("AI service unavailable");
        }
    },

    getChatHistory: async (userId) => {
        try {
            const historyData = await prisma.alMessage.findMany({
                where: { user_id: userId },
                orderBy: { sent_at: "asc" },
                take: 50,
            });

            return historyData.map((msg) => ({
                role: msg.role || (msg.is_from_ai ? "assistant" : "user"),
                content: msg.content,
                timestamp: msg.sent_at,
            }));
        } catch (err) {
            console.error("[AIService] Error fetching history:", err.message);
            throw new Error("Failed to fetch chat history");
        }
    },

    moderateText: async (text) => {
        const normalized = String(text || "").trim();

        if (!normalized) {
            return { isSafe: true };
        }

        try {
            const resp = await axios.post(
                buildAiUrl("/moderate/text"),
                { text: normalized },
                {
                    timeout: 20000,
                    headers: getAuthHeaders(),
                }
            );

            if (!resp.data.success) {
                console.error("[AIService] Text moderation failed:", resp.data.error);
                throw new Error(resp.data.error || "AI moderation failed");
            }

            return {
                isSafe: Boolean(resp.data.is_safe),
            };
        } catch (err) {
            console.error("[AIService] Text moderation error:", err.message);
            throw new Error("AI moderation unavailable");
        }
    },

    assertTextSafe: async (text) => {
        const result = await AIService.moderateText(text);

        if (!result.isSafe) {
            const error = new Error("CONTENT_VIOLATES_POLICY");
            error.statusCode = 422;
            throw error;
        }

        return true;
    },

    moderateImage: async (filePath, mimetype = "image/jpeg", filename = "image") => {
        if (!filePath) {
            return { isSafe: true };
        }

        try {
            const form = new FormData();

            form.append("file", fs.createReadStream(filePath), {
                filename,
                contentType: mimetype,
            });

            const resp = await axios.post(buildAiUrl("/moderate/image"), form, {
                timeout: 30000,
                headers: getAuthHeaders(form.getHeaders()),
            });

            if (!resp.data.success) {
                console.error("[AIService] Image moderation failed:", resp.data.error);
                throw new Error(resp.data.error || "AI image moderation failed");
            }

            return {
                isSafe: Boolean(resp.data.is_safe),
            };
        } catch (err) {
            console.error("[AIService] Image moderation error:", err.message);
            throw new Error("AI image moderation unavailable");
        }
    },

    assertImagesSafe: async (files = []) => {
        if (!Array.isArray(files) || files.length === 0) {
            return true;
        }

        for (const file of files) {
            const result = await AIService.moderateImage(
                file.path,
                file.mimetype,
                file.originalname
            );

            if (!result.isSafe) {
                const error = new Error("IMAGE_VIOLATES_POLICY");
                error.statusCode = 422;
                throw error;
            }
        }

        return true;
    },

    analyzeSubmissionMistake: async (payload) => {
        try {
            console.log("[SubmissionInsightService] start:", payload.submissionId);

            const resp = await axios.post(
                buildAiUrl("/submission/analyze"),
                payload,
                {
                    timeout: 60000,
                    headers: getAuthHeaders(),
                }
            );

            if (!resp.data.success) {
                console.error("[AIService] Submission analysis failed:", resp.data.error);
                throw new Error(resp.data.error || "AI submission analysis failed");
            }

            return {
                summary: resp.data.summary || null,
                mistake_type: resp.data.mistake_type || "UNKNOWN",
                mistake_level: resp.data.mistake_level || "LOW",
                explanation: resp.data.explanation || null,
                suggestion: resp.data.suggestion || null,
                confidence: typeof resp.data.confidence === "number" ? resp.data.confidence : null,
                topics: Array.isArray(resp.data.topics) ? resp.data.topics : [],
                raw: resp.data,
            };
        } catch (err) {
            console.error("[AIService] Submission analysis error:", err.message);
            throw new Error("AI submission analysis unavailable");
        }
    },
};

module.exports = { AIService };