const { ConversationService } = require('../services/conversation.service')

const GroupController = {
    createGroup: async (req, res) => {
        try {
            const { name, avatar, userIds } = req.body
            if (!userIds.includes(req.user.id)) userIds.push(req.user.id)
            const group = await ConversationService.createGroup(name, avatar, userIds)
            res.status(201).json(group)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    listGroups: async (req, res) => {
        try {
            const conversations = await ConversationService.listUserConversations(req.user.id)
            const groups = conversations.filter(c => c.type === 'GROUP')
            res.json(groups)
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
    },

    leaveGroup: async (req, res) => {
        try {
            const { conversationId } = req.params
            await ConversationService.leaveConversation(conversationId, req.user.id)
            res.json({ message: 'Left group successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = { GroupController }
