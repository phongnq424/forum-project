const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { emitToPost } = require('../socket/emitter')
const { NotificationService } = require('./notification.service')


const userSelect = {
    id: true,
    username: true,
    Profile: { select: { avatar: true } }
}

const CommentService = {
    createComment: async (userId, postId, commentDetail, parentCommentId = null) => {
        if (!commentDetail?.trim()) {
            throw new Error('EMPTY_COMMENT')
        }

        const post = await prisma.post.findFirst({
            where: { id: postId, is_deleted: false },
            select: { id: true, user_id: true }
        })

        if (!post) throw new Error('POST_NOT_FOUND')

        // validate parent comment (nếu có)
        if (parentCommentId) {
            const parent = await prisma.comment.findFirst({
                where: { id: parentCommentId, is_deleted: false },
                select: { id: true, post_id: true, user_id: true }
            })


            if (!parent) throw new Error('PARENT_COMMENT_NOT_FOUND')
            if (parent.post_id !== postId) throw new Error('INVALID_PARENT_COMMENT')
        }

        const comment = await prisma.comment.create({
            data: {
                user_id: userId,
                post_id: postId,
                comment_detail: commentDetail,
                parentComment_id: parentCommentId
            },
            include: {
                User: { select: userSelect }
            }
        })

        // Case 1: comment vào post
        if (!parentCommentId && post.user_id !== userId) {
            await NotificationService.create({
                user_id: post.user_id,
                actor_id: userId,
                type: 'POST_COMMENT',
                title: 'Bình luận mới',
                message: 'đã bình luận bài viết của bạn',
                ref_id: postId,
                ref_sub_id: comment.id
            })
        }

        // Case 2: reply comment
        if (parentCommentId && parentComment.user_id !== userId) {
            await NotificationService.create({
                user_id: parentComment.user_id,
                actor_id: userId,
                type: 'COMMENT_REPLY',
                title: 'Phản hồi bình luận',
                message: 'đã trả lời bình luận của bạn',
                ref_id: postId,
                ref_sub_id: comment.id
            })
        }

        // emit realtime
        emitToPost(postId, 'comment:new', {
            postId,
            comment
        })

        return comment
    },

    getCommentsByPost: async (postId) => {
        return prisma.comment.findMany({
            where: {
                post_id: postId,
                parentComment_id: null,
                is_deleted: false
            },
            include: {
                User: { select: userSelect },
                childComments: {
                    where: { is_deleted: false },
                    orderBy: { created_at: 'asc' },
                    include: {
                        User: { select: userSelect }
                    }
                }
            },
            orderBy: { created_at: 'asc' }
        })
    },

    updateComment: async (userId, commentId, commentDetail) => {
        if (!commentDetail?.trim()) {
            throw new Error('EMPTY_COMMENT')
        }

        const existing = await prisma.comment.findFirst({
            where: { id: commentId, is_deleted: false },
            select: { id: true, user_id: true, post_id: true }
        })

        if (!existing) throw new Error('COMMENT_NOT_FOUND')
        if (existing.user_id !== userId) throw new Error('UNAUTHORIZED')

        const comment = await prisma.comment.update({
            where: { id: commentId, is_deleted: false },
            data: { comment_detail: commentDetail }
        })

        emitToPost(existing.post_id, 'comment:update', {
            postId: existing.post_id,
            comment
        })

        return comment
    },

    deleteComment: async (userId, commentId) => {
        const existing = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true, user_id: true, post_id: true }
        })

        if (!existing) throw new Error('COMMENT_NOT_FOUND')
        if (existing.user_id !== userId) throw new Error('UNAUTHORIZED')

        await prisma.$transaction([
            prisma.comment.update({
                where: { id: commentId },
                data: {
                    is_deleted: true,
                    comment_detail: '[deleted]'
                }
            }),
            prisma.comment_Rate.deleteMany({
                where: { comment_id: commentId }
            })
        ])


        emitToPost(existing.post_id, 'comment:delete', {
            postId: existing.post_id,
            commentId
        })

        return { deleted: true }
    }
}

module.exports = { CommentService }
