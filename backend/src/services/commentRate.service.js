const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CommentRateService = {
    // Thêm hoặc cập nhật rating
    rateComment: async (userId, commentId, rating) => {
        const existing = await prisma.comment_Rate.findUnique({
            where: { user_id_comment_id: { user_id: userId, comment_id: commentId } }
        })

        if (existing) {
            return prisma.comment_Rate.update({
                where: { id: existing.id },
                data: { rating, created_at: new Date() }
            })
        }

        return prisma.comment_Rate.create({
            data: { user_id: userId, comment_id: commentId, rating }
        })
    },

    // Lấy rating của một comment theo user
    getUserRating: async (userId, commentId) => {
        return prisma.comment_Rate.findUnique({
            where: { user_id_comment_id: { user_id: userId, comment_id: commentId } }
        })
    },

    // Lấy tổng, trung bình rating của comment
    getCommentStats: async (commentId) => {
        const rates = await prisma.comment_Rate.findMany({
            where: { comment_id: commentId },
            select: { rating: true }
        })

        const total = rates.reduce((acc, r) => acc + r.rating, 0)
        const count = rates.length
        const avg = count ? total / count : 0

        return { total, count, average: avg }
    },

    // Lấy tất cả rating của user
    getUserRatings: async (userId) => {
        return prisma.comment_Rate.findMany({
            where: { user_id: userId },
            include: { Comment: true }
        })
    }
}

module.exports = { CommentRateService }
