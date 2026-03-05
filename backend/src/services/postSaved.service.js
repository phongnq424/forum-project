const { PrismaClient } = require('@prisma/client')
const { PostService } = require('./post.service')
const prisma = new PrismaClient()

// Copy các const này từ post.service sang (hoặc export từ bên kia import vào)
const USER_SELECT = { id: true, username: true, avatar: true, fullname: true };
const TOPIC_SELECT = { id: true, name: true };
const IMAGE_SELECT = { id: true, url: true };

const PostSavedService = {
    toggleSave: async (userId, postId) => {
        const existing = await prisma.postSaved.findUnique({
            where: { user_id_post_id: { user_id: userId, post_id: postId } }
        })

        if (existing) {
            await prisma.postSaved.delete({
                where: { user_id_post_id: { user_id: userId, post_id: postId } }
            })
            return { saved: false }
        } else {
            const saved = await prisma.postSaved.create({
                data: { user_id: userId, post_id: postId }
            })
            return { saved: true, postSaved: saved }
        }
    },

    // Thêm blockContext vào tham số để check chặn (giống hàm list)
    getSavedPosts: async (userId, query, { blockContext } = {}) => {
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit
        const search = query.q || ''

        let postWhere = { is_deleted: false }; // Bắt buộc lọc bài chưa xóa
        if (search) {
            postWhere.OR = [
                { content: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { Topic: { name: { contains: search, mode: 'insensitive' } } },
                { User: { username: { contains: search, mode: 'insensitive' } } }
            ]
        }

        if (blockContext) {
            postWhere = PostService._applyBlockLogic(postWhere, blockContext);
        }

        const where = {
            user_id: userId,
            Post: postWhere
        }

        const [savedRecords, total] = await Promise.all([
            prisma.postSaved.findMany({
                where,
                skip,
                take: limit,
                orderBy: { saved_at: 'desc' },
                include: {
                    Post: {
                        include: {
                            User: { select: USER_SELECT }, // Đồng bộ cấu trúc User
                            Topic: { select: TOPIC_SELECT },
                            Image: { select: IMAGE_SELECT, take: 1 } // Lấy 1 ảnh giống bên list
                        }
                    }
                }
            }),
            prisma.postSaved.count({ where })
        ])

        const rawPosts = savedRecords.map(p => p.Post).filter(Boolean);

        const enrichedPosts = await PostService._enrichPosts(rawPosts, userId);

        return {
            data: enrichedPosts,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }
    }
}

module.exports = { PostSavedService }