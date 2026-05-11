const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { PrismaClient } = require("@prisma/client");

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

const AIService = {
    generateReply: async (userId, userQuestion) => {
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

            const aiAnswer = resp.data.reply;

            await prisma.$transaction([
                prisma.alMessage.create({
                    data: { user_id: userId, content: userQuestion, role: "user" },
                }),
                prisma.alMessage.create({
                    data: { user_id: userId, content: aiAnswer, role: "assistant" },
                }),
            ]);

            return aiAnswer;
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
};

module.exports = { AIService };