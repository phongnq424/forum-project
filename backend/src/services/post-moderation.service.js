const { PrismaClient } = require("@prisma/client");
const { AIService } = require("./ai.service");

const prisma = new PrismaClient();

const PostModerationService = {
    moderatePostInBackground: (postId) => {
        setImmediate(async () => {
            try {
                const post = await prisma.post.findUnique({
                    where: { id: postId },
                    include: {
                        Image: {
                            select: {
                                url: true,
                            },
                        },
                    },
                });

                if (!post || post.is_deleted) return;

                await AIService.assertTextSafe(`${post.title || ""}\n${post.content || ""}`);

                if (AIService.assertImageUrlsSafe) {
                    await AIService.assertImageUrlsSafe(post.Image.map((img) => img.url));
                }

                await prisma.post.update({
                    where: { id: postId },
                    data: {
                        moderation_status: "APPROVED",
                        moderation_reason: null,
                        moderated_at: new Date(),
                    },
                });
            } catch (error) {
                const isViolation =
                    error.message === "CONTENT_VIOLATES_POLICY" ||
                    error.message === "IMAGE_VIOLATES_POLICY";

                await prisma.post.update({
                    where: { id: postId },
                    data: {
                        moderation_status: isViolation ? "REJECTED" : "FAILED",
                        moderation_reason: error.message || "MODERATION_FAILED",
                        moderated_at: new Date(),
                        is_deleted: isViolation ? true : false,
                        deleted_at: isViolation ? new Date() : null,
                    },
                }).catch(() => { });
            }
        });
    },
};

module.exports = { PostModerationService };