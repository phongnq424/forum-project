const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CommentRateService = {
    rateComment: async (userId, commentId, rating) => {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { is_deleted: true }
        })

        if (!comment || comment.is_deleted) {
            throw new Error('Comment not found or deleted')
        }

        const existing = await prisma.comment_Rate.findUnique({
            where: {
                user_id_comment_id: {
                    user_id: userId,
                    comment_id: commentId
                }
            }
        })

        if (existing) {
            return prisma.comment_Rate.update({
                where: { id: existing.id },
                data: { rating }
            })
        }

        return prisma.comment_Rate.create({
            data: { user_id: userId, comment_id: commentId, rating }
        })
    },

    // Lấy rating của một comment theo user
    getUserRating: async (userId, commentId) => {
        return prisma.comment_Rate.findFirst({
            where: {
                user_id: userId,
                comment_id: commentId,
                Comment: {
                    is_deleted: false
                }
            }
        })
    },

    // Lấy tổng, trung bình rating của comment
    getCommentStats: async (commentId) => {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { is_deleted: true }
        })

        if (!comment || comment.is_deleted) {
            return { total: 0, count: 0, average: 0 }
        }
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
            where: {
                user_id: userId,
                Comment: {
                    is_deleted: false
                }
            },
            include: {
                Comment: true
            }
        })
    }
}

module.exports = { CommentRateService }
