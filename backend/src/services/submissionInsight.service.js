const { PrismaClient } = require("@prisma/client");
const { AIService } = require("./ai.service");
const { UserTopicMasteryService } = require("./userTopicMastery.service");
const { LearningRecommendationService } = require("./learningRecommendation.service");

const prisma = new PrismaClient();

function safeText(value, maxLength = 3000) {
    if (!value) return null;
    return String(value).slice(0, maxLength);
}

function summarizeTestcaseResults(results = []) {
    return results.map((item) => ({
        testcaseId: item.testcase_id,
        status: item.status,
        score: item.score,
        maxScore: item.max_score,
        runtime_ms: item.runtime_ms,
        memory_kb: item.memory_kb,
        message: safeText(item.message, 500),
        stdout: safeText(item.stdout, 500),
        stderr: safeText(item.stderr, 500),
        testcase: item.Testcase
            ? {
                id: item.Testcase.id,
                name: item.Testcase.name,
                visibility: item.Testcase.visibility,
                order_index: item.Testcase.order_index,
            }
            : null,
    }));
}

function buildAnalysisPayload(submission) {
    const challengeTopics = submission.Challenge.challengeTopics || [];

    return {
        submissionId: submission.id,
        judgeStatus: submission.status,
        score: submission.score,
        runtime_ms: submission.runtime_ms,
        memory_kb: submission.memory_kb,
        error_message: safeText(submission.error_message, 1000),

        language: submission.Language
            ? {
                id: submission.Language.id,
                name: submission.Language.name,
                code: submission.Language.code,
            }
            : null,

        code: submission.kind === "CODE" ? safeText(submission.code, 8000) : null,
        kind: submission.kind,

        challenge: {
            id: submission.Challenge.id,
            title: submission.Challenge.title,
            description: safeText(submission.Challenge.description, 3000),
            input: safeText(submission.Challenge.input, 1000),
            output: safeText(submission.Challenge.output, 1000),
            constraints: safeText(submission.Challenge.constraints, 1000),
            difficulty: submission.Challenge.difficulty,
            type: submission.Challenge.type,
            topics: challengeTopics.map((item) => ({
                id: item.Topic.id,
                name: item.Topic.name,
                slug: item.Topic.slug,
                weight: item.weight,
            })),
        },

        testcaseResults: summarizeTestcaseResults(submission.testcase_results),
    };
}

const SubmissionInsightService = {
    analyzeAfterJudging: async (submissionId) => {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                Language: true,
                Challenge: {
                    include: {
                        challengeTopics: {
                            include: {
                                Topic: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                    },
                },
                testcase_results: {
                    orderBy: { created_at: "asc" },
                    include: {
                        Testcase: {
                            select: {
                                id: true,
                                name: true,
                                visibility: true,
                                order_index: true,
                            },
                        },
                    },
                },
            },
        });

        if (!submission) {
            throw new Error("Submission not found");
        }

        const payload = buildAnalysisPayload(submission);

        let aiResult;
        try {
            aiResult = await AIService.analyzeSubmissionMistake(payload);
        } catch (error) {
            aiResult = {
                summary: "AI analysis failed",
                mistake_type: "UNKNOWN",
                mistake_level: "LOW",
                explanation: null,
                suggestion: null,
                confidence: null,
                topics: [],
                raw: {
                    error: error.message,
                },
            };
        }

        const topicIdsFromAI = Array.isArray(aiResult.topics)
            ? aiResult.topics
                .map((item) => item.topic_id || item.id)
                .filter(Boolean)
            : [];

        const challengeTopicIds = submission.Challenge.challengeTopics.map(
            (item) => item.topic_id
        );

        const finalTopicIds = [...new Set([...topicIdsFromAI, ...challengeTopicIds])];

        const insight = await prisma.$transaction(async (tx) => {
            const created = await tx.submissionAIInsight.upsert({
                where: { submission_id: submissionId },
                update: {
                    summary: aiResult.summary,
                    mistake_type: aiResult.mistake_type,
                    mistake_level: aiResult.mistake_level,
                    explanation: aiResult.explanation,
                    suggestion: aiResult.suggestion,
                    confidence: aiResult.confidence,
                    model_name: aiResult.raw?.model_name || aiResult.raw?.model || null,
                    prompt_version: aiResult.raw?.prompt_version || null,
                },
                create: {
                    submission_id: submissionId,
                    summary: aiResult.summary,
                    mistake_type: aiResult.mistake_type,
                    mistake_level: aiResult.mistake_level,
                    explanation: aiResult.explanation,
                    suggestion: aiResult.suggestion,
                    confidence: aiResult.confidence,
                    model_name: aiResult.raw?.model_name || aiResult.raw?.model || null,
                    prompt_version: aiResult.raw?.prompt_version || null,
                },
            });

            await tx.submissionAITopic.deleteMany({
                where: { insight_id: created.id },
            });

            if (finalTopicIds.length > 0) {
                await tx.submissionAITopic.createMany({
                    data: finalTopicIds.map((topicId) => ({
                        insight_id: created.id,
                        topic_id: topicId,
                        confidence: null,
                    })),
                    skipDuplicates: true,
                });
            }

            return created;
        });

        await UserTopicMasteryService.updateFromSubmission(submissionId).catch(
            console.error
        );

        await LearningRecommendationService.createForSubmission(submissionId).catch(
            console.error
        );

        return insight;
    },
};

module.exports = { SubmissionInsightService };