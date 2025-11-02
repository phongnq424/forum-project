const { InterestedTopicService } = require('../services/interestedTopic.service')

const InterestedTopicController = {
    follow: async (req, res) => {
        const data = await InterestedTopicService.follow(req.user.id, req.body.topic_id)
        res.json(data)
    },
    unfollow: async (req, res) => {
        const data = await InterestedTopicService.unfollow(req.user.id, req.params.topicId)
        res.json(data)
    },
    getMyTopics: async (req, res) => {
        const data = await InterestedTopicService.getMyTopics(req.user.id)
        res.json(data)
    }
}

module.exports = { InterestedTopicController }
