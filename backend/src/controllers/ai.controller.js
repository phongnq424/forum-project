const { AIService } = require("../services/ai.service");

const AIController = {
    chat: async (req, res) => {
        try {
            const { message, lastCards = [] } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Message is required" });
            }

            const userId = req.user.id;
            const result = await AIService.generateReply(userId, message, lastCards);

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    getChatHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const history = await AIService.getChatHistory(userId);

            return res.json(history);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    analyzeSubmissionMistake: async (req, res) => {
        try {
            const result = await AIService.analyzeSubmissionMistake(req.body);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = { AIController };