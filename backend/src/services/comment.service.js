const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CommentService = {
    createComment: async (userId, postId, commentDetail, parentCommentId = null) => {
        return await prisma.comment.create({
            data: {
                user_id: userId,
                post_id: postId,
                comment_detail: commentDetail,
                parentComment_id: parentCommentId
            },
            include: {
                User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                childComments: {
                    include: { User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } } }
                }
            }
        })
    },

    getCommentsByPost: async (postId) => {
        return await prisma.comment.findMany({
            where: { post_id: postId, parentComment_id: null },
            include: {
                User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                childComments: {
                    include: { User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } } }
                }
            },
            orderBy: { created_at: 'asc' }
        })
    },

    updateComment: async (userId, commentId, commentDetail) => {
        const existing = await prisma.comment.findUnique({ where: { id: commentId } })
        if (!existing) throw new Error('Comment not found')
        if (existing.user_id !== userId) throw new Error('Unauthorized')

        return await prisma.comment.update({
            where: { id: commentId },
            data: { comment_detail: commentDetail }
        })
    },

    deleteComment: async (userId, commentId) => {
        const existing = await prisma.comment.findUnique({ where: { id: commentId } })
        if (!existing) throw new Error('Comment not found')
        if (existing.user_id !== userId) throw new Error('Unauthorized')

        return await prisma.comment.delete({ where: { id: commentId } })
    }
}

module.exports = { CommentService }
