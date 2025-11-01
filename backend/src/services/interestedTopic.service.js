const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const InterestedTopicService = {
    follow: async (userId, topicId) => {
        return await prisma.interestedTopic.create({
            data: { user_id: userId, topic_id: topicId }
        })
    },

    unfollow: async (userId, topicId) => {
        return await prisma.interestedTopic.delete({
            where: { user_id_topic_id: { user_id: userId, topic_id: topicId } }
        })
    },

    getMyTopics: async (userId) => {
        return await prisma.interestedTopic.findMany({
            where: { user_id: userId },
            include: {
                Topic: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        Category: { select: { id: true, name: true } }
                    }
                }
            }
        })
    }
}

module.exports = { InterestedTopicService }
