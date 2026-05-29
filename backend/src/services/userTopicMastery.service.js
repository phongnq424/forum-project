const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}

const UserTopicMasteryService = {
    updateFromSubmission: async (submissionId) => {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                Challenge: {
                    include: {
                        challengeTopics: true,
                    },
                },
                submissionAIInsight: {
                    include: {
                        topics: true,
                    },
                },
            },
        });

        if (!submission) {
            throw new Error("Submission not found");
        }

        const challengeTopicIds = submission.Challenge.challengeTopics.map(
            (item) => item.topic_id
        );

        const insightTopicIds = submission.submissionAIInsight
            ? submission.submissionAIInsight.topics.map((item) => item.topic_id)
            : [];

        const topicIds = [...new Set([...challengeTopicIds, ...insightTopicIds])];

        if (topicIds.length === 0) {
            return [];
        }

        const isAccepted = submission.status === "ACCEPTED";

        const results = [];

        for (const topicId of topicIds) {
            const existing = await prisma.userTopicMastery.findUnique({
                where: {
                    user_id_topic_id: {
                        user_id: submission.user_id,
                        topic_id: topicId,
                    },
                },
            });

            const oldMastery = existing?.mastery_score || 0;
            const oldWeakness = existing?.weakness_score || 0;

            const masteryDelta = isAccepted ? 0.08 : -0.04;
            const weaknessDelta = isAccepted ? -0.05 : 0.08;

            const updated = await prisma.userTopicMastery.upsert({
                where: {
                    user_id_topic_id: {
                        user_id: submission.user_id,
                        topic_id: topicId,
                    },
                },
                update: {
                    mastery_score: clamp(oldMastery + masteryDelta),
                    weakness_score: clamp(oldWeakness + weaknessDelta),
                    solved_count: {
                        increment: isAccepted ? 1 : 0,
                    },
                    failed_count: {
                        increment: isAccepted ? 0 : 1,
                    },
                    last_practiced_at: new Date(),
                },
                create: {
                    user_id: submission.user_id,
                    topic_id: topicId,
                    mastery_score: clamp(isAccepted ? 0.15 : 0.02),
                    weakness_score: clamp(isAccepted ? 0.05 : 0.15),
                    solved_count: isAccepted ? 1 : 0,
                    failed_count: isAccepted ? 0 : 1,
                    last_practiced_at: new Date(),
                },
            });

            results.push(updated);
        }

        return results;
    },
};

module.exports = { UserTopicMasteryService };