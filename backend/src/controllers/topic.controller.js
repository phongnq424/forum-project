const { TopicService } = require('../services/topic.service')

const TopicController = {
    createMany: async (req, res) => {
        try {
            const topics = req.body
            const result = await TopicService.createMany(topics)
            return res.status(201).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
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
        try {
            const { ids } = req.body
            if (!Array.isArray(ids) || ids.length === 0)
                return res.status(400).json({ message: 'ids must be a non-empty array' })
            const result = await TopicService.delete(ids)
            return res.status(200).json({ deletedCount: result.count })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { TopicController }
