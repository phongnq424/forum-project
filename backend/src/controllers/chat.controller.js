const { ConversationService } = require('../services/conversation.service')

const ChatController = {
    createChat: async (req, res) => {
        try {
            const userIds = [req.user.id, req.body.userId]
            const chat = await ConversationService.createChat(userIds)
            res.status(201).json(chat)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    listChats: async (req, res) => {
        try {
            const conversations = await ConversationService.listUserConversations(req.user.id)
            const chats = conversations.filter(c => c.type === 'CHAT')
            res.json(chats)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    getMessages: async (req, res) => {
        try {
            const { conversationId } = req.params
            const messages = await ConversationService.getMessagesByConversation(conversationId, req.user.id)
            res.json(messages)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { conversationId } = req.params
            const { content } = req.body
            const message = await ConversationService.sendMessage(conversationId, req.user.id, content)
            res.status(201).json(message)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = { ChatController }
