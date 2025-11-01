const { TopicService } = require('../services/topic.service')

const TopicController = {
    create: async (req, res) => {
        const data = await TopicService.create(req.body)
        res.json(data)
    },
    list: async (req, res) => {
        const data = await TopicService.list(req.query)
        res.json(data)
    },
    getById: async (req, res) => {
        const data = await TopicService.getById(req.params.id)
        res.json(data)
    },
    update: async (req, res) => {
        const data = await TopicService.update(req.params.id, req.body)
        res.json(data)
    },
    delete: async (req, res) => {
        const data = await TopicService.delete(req.params.id)
        res.json(data)
    }
}

module.exports = { TopicController }
