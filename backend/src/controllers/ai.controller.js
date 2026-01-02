const { AIService } = require('../services/ai.service')

const AIController = {
    chat: async (req, res) => {
        try {
            const { message } = req.body
            if (!message) return res.status(400).json({ error: "Message is required" })
            const userId = req.user.id
            const reply = await AIService.generateReply(userId, message)
            res.json({ reply })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = { AIController }
