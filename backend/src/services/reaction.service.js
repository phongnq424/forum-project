const { PrismaClient, REACTION_TYPE } = require('@prisma/client')
const prisma = new PrismaClient()
const { emitToPost } = require('../socket/emitter')
const { NotificationService } = require("./notification.service");

const ReactionService = {
    toggleReaction: async (userId, postId, type) => {
        if (!Object.values(REACTION_TYPE).includes(type)) {
            throw new Error('Invalid reaction type')
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true, user_id: true }
        })
        if (!post) throw new Error('POST_NOT_FOUND')

        const existing = await prisma.reaction.findUnique({
            where: {
                user_id_post_id: {
                    user_id: userId,
                    post_id: postId
                }
            }
        })

        let action
        let reaction = null

        if (!existing) {
            reaction = await prisma.reaction.create({
                data: { user_id: userId, post_id: postId, type }
            })
            action = 'added'

            if (post.user_id !== userId) {
                await NotificationService.create({
                    user_id: post.user_id,
                    actor_id: userId,
                    type: 'POST_REACTION',
                    title: 'Bài viết có reaction mới',
                    message: 'đã reaction bài viết của bạn',
                    ref_id: postId
                })
            }
        }

        else if (existing.type === type) {
            await prisma.reaction.delete({
                where: { id: existing.id }
            })
            action = 'removed'
        }

        else {
            reaction = await prisma.reaction.update({
                where: { id: existing.id },
                data: { type }
            })
            action = 'updated'
        }

        const stats = await prisma.reaction.groupBy({
            by: ['type'],
            where: { post_id: postId },
            _count: true
        })

        emitToPost(postId, 'reaction:update', {
            postId,
            userId,
            action,
            reaction,
            stats
        })

        return { action, reaction, stats }
    },

    getReactionsByPost: async (postId) => {
        return prisma.reaction.findMany({
            where: { post_id: postId },
            select: { id: true, type: true, user_id: true }
        })
    }
}

module.exports = { ReactionService }
