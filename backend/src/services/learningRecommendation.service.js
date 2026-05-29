const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const LearningRecommendationService = {
    createForSubmission: async (submissionId) => {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
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

        if (!submission.submissionAIInsight) {
            return null;
        }

        const topicIds = submission.submissionAIInsight.topics.map(
            (item) => item.topic_id
        );

        if (topicIds.length === 0) {
            return null;
        }

        const primaryTopicId = topicIds[0];

        const [posts, challenges, conversations] = await Promise.all([
            prisma.post.findMany({
                where: {
                    is_deleted: false,
                    OR: [
                        { topicId: { in: topicIds } },
                        {
                            PostTopics: {
                                some: {
                                    topic_id: { in: topicIds },
                                },
                            },
                        },
                    ],
                },
                take: 5,
                orderBy: { created_at: "desc" },
                select: {
                    id: true,
                    title: true,
                },
            }),

            prisma.challenge.findMany({
                where: {
                    id: { not: submission.challenge_id },
                    challengeTopics: {
                        some: {
                            topic_id: { in: topicIds },
                        },
                    },
                },
                take: 5,
                orderBy: { created_at: "desc" },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                },
            }),

            prisma.conversation.findMany({
                where: {
                    type: "GROUP",
                    OR: [
                        { topic_id: { in: topicIds } },
                        { challenge_id: submission.challenge_id },
                    ],
                },
                take: 3,
                orderBy: { created_at: "desc" },
                select: {
                    id: true,
                    name: true,
                    scope: true,
                },
            }),
        ]);

        const items = [];

        posts.forEach((post, index) => {
            items.push({
                target_type: "POST",
                target_id: post.id,
                rank: index + 1,
                reason: "Bài viết liên quan đến lỗi hoặc topic bạn đang gặp.",
            });
        });

        challenges.forEach((challenge, index) => {
            items.push({
                target_type: "CHALLENGE",
                target_id: challenge.id,
                rank: posts.length + index + 1,
                reason: "Bài luyện tập liên quan đến topic còn yếu.",
            });
        });

        conversations.forEach((conversation, index) => {
            items.push({
                target_type: "CONVERSATION",
                target_id: conversation.id,
                rank: posts.length + challenges.length + index + 1,
                reason: "Nhóm thảo luận liên quan đến chủ đề này.",
            });
        });

        if (items.length === 0) {
            return null;
        }

        return await prisma.learningRecommendation.create({
            data: {
                user_id: submission.user_id,
                submission_id: submission.id,
                topic_id: primaryTopicId,
                reason: "Gợi ý được tạo dựa trên kết quả phân tích lỗi bài nộp.",
                priority: submission.status === "ACCEPTED" ? 1 : 5,
                status: "ACTIVE",
                learningRecommendationItems: {
                    create: items,
                },
            },
            include: {
                Topic: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                learningRecommendationItems: true,
            },
        });
    },
};

module.exports = { LearningRecommendationService };