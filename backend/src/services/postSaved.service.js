const { PrismaClient } = require("@prisma/client");
const { PostService } = require("./post.service");
const prisma = new PrismaClient();

const USER_SELECT = { id: true, username: true, avatar: true, fullname: true };
const TOPIC_SELECT = { id: true, name: true, slug: true };
const IMAGE_SELECT = { id: true, url: true };

const POST_INCLUDE = {
    User: { select: USER_SELECT },
    topic: { select: TOPIC_SELECT },
    PostTopics: {
        include: {
            Topic: { select: TOPIC_SELECT },
        },
    },
    Image: { select: IMAGE_SELECT, take: 1 },
};

const PostSavedService = {
    toggleSave: async (userId, postId) => {
        const existing = await prisma.postSaved.findUnique({
            where: { user_id_post_id: { user_id: userId, post_id: postId } },
        });

        if (existing) {
            await prisma.postSaved.delete({
                where: { user_id_post_id: { user_id: userId, post_id: postId } },
            });

            return { saved: false };
        }

        const saved = await prisma.postSaved.create({
            data: { user_id: userId, post_id: postId },
        });

        return { saved: true, postSaved: saved };
    },

    getSavedPosts: async (userId, query, { blockContext } = {}) => {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = query.q || "";

        let postWhere = { is_deleted: false };

        if (search) {
            postWhere.OR = [
                { content: { contains: search, mode: "insensitive" } },
                { title: { contains: search, mode: "insensitive" } },
                { topic: { name: { contains: search, mode: "insensitive" } } },
                {
                    PostTopics: {
                        some: {
                            Topic: {
                                name: { contains: search, mode: "insensitive" },
                            },
                        },
                    },
                },
                { User: { username: { contains: search, mode: "insensitive" } } },
            ];
        }

        if (blockContext) {
            postWhere = PostService._applyBlockLogic(postWhere, blockContext);
        }

        const where = {
            user_id: userId,
            Post: postWhere,
        };

        const [savedRecords, total] = await Promise.all([
            prisma.postSaved.findMany({
                where,
                skip,
                take: limit,
                orderBy: { saved_at: "desc" },
                include: {
                    Post: {
                        include: POST_INCLUDE,
                    },
                },
            }),
            prisma.postSaved.count({ where }),
        ]);

        const rawPosts = savedRecords.map((p) => p.Post).filter(Boolean);
        const enrichedPosts = await PostService._enrichPosts(rawPosts, userId);

        return {
            data: enrichedPosts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
};

module.exports = { PostSavedService };