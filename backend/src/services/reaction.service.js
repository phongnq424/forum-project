const { PrismaClient, REACTION_TYPE } = require('@prisma/client')
const prisma = new PrismaClient()

const ReactionService = {
    toggleReaction: async (userId, postId, type) => {
        if (!Object.values(REACTION_TYPE).includes(type)) throw new Error('Invalid reaction type')

        const existing = await prisma.reaction.findUnique({
            where: { user_id_post_id_type: { user_id: userId, post_id: postId, type } }
        })

        if (existing) {
            await prisma.reaction.delete({ where: { id: existing.id } })
            return { removed: true }
        } else {
            const reaction = await prisma.reaction.create({
                data: { user_id: userId, post_id: postId, type }
            })
            return { removed: false, reaction }
        }
    },

    getReactionsByPost: async (postId) => {
        return await prisma.reaction.findMany({
            where: { post_id: postId },
            select: { id: true, type: true, user_id: true }
        })
    }
}

module.exports = { ReactionService }
