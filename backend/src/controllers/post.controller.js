const fs = require("fs").promises;
const { PostService } = require("../services/post.service");
const { AIService } = require("../services/ai.service");
const { upload } = require("../middlewares/upload.middleware");
const { validateFiles } = require("../validations/file.validation");
const { buildBlockContext } = require("../contexts/block.context");

async function cleanupLocalFiles(files = []) {
    await Promise.all(
        files.map((file) =>
            fs.unlink(file.path).catch(() => { })
        )
    );
}

function mapModerationError(error) {
    if (error.message === "CONTENT_VIOLATES_POLICY") {
        return {
            status: 422,
            body: {
                code: "CONTENT_VIOLATES_POLICY",
                message: "Nội dung bài đăng không phù hợp. Vui lòng chỉnh sửa trước khi đăng.",
            },
        };
    }

    if (error.message === "IMAGE_VIOLATES_POLICY") {
        return {
            status: 422,
            body: {
                code: "IMAGE_VIOLATES_POLICY",
                message: "Hình ảnh bài đăng không phù hợp. Vui lòng chọn hình khác.",
            },
        };
    }

    if (error.message === "AI moderation unavailable") {
        return {
            status: 503,
            body: {
                code: "AI_MODERATION_UNAVAILABLE",
                message: "Hệ thống kiểm duyệt AI tạm thời không khả dụng. Vui lòng thử lại sau.",
            },
        };
    }

    return null;
}

const PostController = {
    createPost: [
        upload.fields([{ name: "images", maxCount: 5 }]),
        async (req, res) => {
            const files = req.files?.images || [];

            try {
                if (!req.user?.id) {
                    await cleanupLocalFiles(files);
                    return res.status(401).json({ error: "Unauthorized" });
                }

                validateFiles(req.files, ["images"]);

                const { content, topic_id, topicId, topic_ids, topicIds, title } = req.body;

                await AIService.assertTextSafe(`${title || ""}\n${content || ""}`);
                await AIService.assertImagesSafe(files);

                const newPost = await PostService.createPost(req.user.id, {
                    content,
                    topic_id: topic_id || topicId,
                    topic_ids: topic_ids || topicIds,
                    title,
                    files,
                });

                return res.status(201).json(newPost);
            } catch (error) {
                const mapped = mapModerationError(error);
                if (mapped) {
                    await cleanupLocalFiles(files);
                    return res.status(mapped.status).json(mapped.body);
                }

                const status =
                    error.message && error.message.toLowerCase().includes("invalid")
                        ? 400
                        : 500;

                await cleanupLocalFiles(files);
                return res.status(status).json({ error: error.message });
            }
        },
    ],

    getPost: async (req, res) => {
        try {
            const viewerId = req.user?.id || null;
            const blockContext = await buildBlockContext(viewerId);
            const post = await PostService.getPostById(req.params.id, {
                viewerId,
                blockContext,
            });

            if (!post) return res.status(404).json({ message: "Post not found" });

            return res.status(200).json(post);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },

    updatePost: [
        upload.fields([{ name: "images", maxCount: 5 }]),
        async (req, res) => {
            const files = req.files?.images || [];

            try {
                if (!req.user?.id) {
                    await cleanupLocalFiles(files);
                    return res.status(401).json({ error: "Unauthorized" });
                }

                validateFiles(req.files, ["images"]);

                const postId = req.params.id;
                const userId = req.user.id;
                const { content, topic_id, topicId, topic_ids, topicIds, title, delete_images } = req.body;

                await AIService.assertTextSafe(`${title || ""}\n${content || ""}`);
                await AIService.assertImagesSafe(files);

                let removeIds = [];

                if (delete_images) {
                    try {
                        removeIds = JSON.parse(delete_images);
                    } catch (e) {
                        removeIds = String(delete_images)
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                    }
                }

                const updated = await PostService.updatePost(userId, postId, {
                    content,
                    topic_id: topic_id || topicId,
                    topic_ids: topic_ids || topicIds,
                    title,
                    files,
                    removeImageIds: removeIds,
                });

                return res.status(200).json(updated);
            } catch (e) {
                const mapped = mapModerationError(e);
                if (mapped) {
                    await cleanupLocalFiles(files);
                    return res.status(mapped.status).json(mapped.body);
                }

                if (e.message?.toLowerCase().includes("not found")) {
                    await cleanupLocalFiles(files);
                    return res.status(404).json({ message: e.message });
                }

                if (e.message?.toLowerCase().includes("unauthorized")) {
                    await cleanupLocalFiles(files);
                    return res.status(403).json({ message: e.message });
                }

                const status =
                    e.message && e.message.toLowerCase().includes("invalid")
                        ? 400
                        : 500;

                await cleanupLocalFiles(files);
                return res.status(status).json({ message: e.message });
            }
        },
    ],

    deletePost: async (req, res) => {
        try {
            const userId = req.user.id;
            const postId = req.params.id;

            await PostService.deletePost(userId, postId);

            return res.status(200).json({ message: "Deleted" });
        } catch (e) {
            if (e.message?.toLowerCase().includes("not found")) {
                return res.status(404).json({ message: e.message });
            }

            if (e.message?.toLowerCase().includes("unauthorized")) {
                return res.status(403).json({ message: e.message });
            }

            return res.status(500).json({ message: e.message });
        }
    },

    list: async (req, res) => {
        try {
            const viewerId = req.user?.id || null;
            const blockContext = await buildBlockContext(viewerId);

            const result = await PostService.list(req.query, {
                viewerId,
                blockContext,
            });

            return res.status(200).json(result);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },

    getByUser: async (req, res) => {
        try {
            const ownerId = req.params.userId;
            const viewerId = req.user?.id || null;
            const blockContext = await buildBlockContext(viewerId);

            const result = await PostService.getByUser(ownerId, req.query, {
                viewerId,
                blockContext,
            });

            return res.status(200).json(result);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },
};

module.exports = { PostController };