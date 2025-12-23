const { ConversationService } = require('../services/conversation.service')
const { buildBlockContext } = require('../contexts/block.context')

const ChatController = {
    createChat: async (req, res) => {
        try {
            const viewerId = req.user.id
            const targetId = req.body.userId

            const blockContext = await buildBlockContext(viewerId)

            const chat = await ConversationService.createChat(
                [viewerId, targetId],
                { viewerId, blockContext }
            )

            return res.status(201).json(chat)
        } catch (error) {
            const msg = error.message?.toLowerCase()
            if (msg?.includes('blocked'))
                return res.status(403).json({ error: error.message })

            return res.status(500).json({ error: error.message })
        }
    },

    listChats: async (req, res) => {
        try {
            const viewerId = req.user.id
            const blockContext = await buildBlockContext(viewerId)

            const conversations = await ConversationService.listUserConversations(
                viewerId,
                { viewerId, blockContext }
            )

            const chats = conversations.filter(c => c.type === 'CHAT')
            return res.json(chats)
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    },

    getMessages: async (req, res) => {
        try {
            const viewerId = req.user.id
            const { conversationId } = req.params
            const blockContext = await buildBlockContext(viewerId)

            const messages = await ConversationService.getMessagesByConversation(
                conversationId,
                viewerId,
                { viewerId, blockContext }
            )

            return res.json(messages)
        } catch (error) {
            const msg = error.message?.toLowerCase()
            if (msg?.includes('blocked') || msg?.includes('forbidden'))
                return res.status(403).json({ error: error.message })

            return res.status(500).json({ error: error.message })
        }
    },

    sendMessage: async (req, res) => {
        try {
            const fromId = req.user.id
            const { toUserId, content } = req.body

            if (!toUserId || !content) {
                return res.status(400).json({ error: 'Missing fields' })
            }

            const blockContext = await buildBlockContext(fromId)

            const result = await ConversationService.sendDirectMessage(
                fromId,
                toUserId,
                content,
                { blockContext }
            )

            return res.status(201).json(result)
        } catch (error) {
            const msg = error.message?.toLowerCase()
            if (msg?.includes('blocked')) {
                return res.status(403).json({ error: error.message })
            }
            return res.status(500).json({ error: error.message })
        }
    }


}

module.exports = { ChatController }
