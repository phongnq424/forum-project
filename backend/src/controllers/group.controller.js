const { ConversationService } = require("../services/conversation.service");

const GroupController = {
    createGroup: async (req, res) => {
        try {
            const {
                name,
                avatar,
                userIds = [],
                scope = "GENERAL",
                topic_id = null,
                challenge_id = null
            } = req.body;

            if (!name || String(name).trim() === "") {
                return res.status(400).json({ error: "Group name is required" });
            }

            const memberIds = Array.isArray(userIds) ? [...userIds] : [];

            if (!memberIds.includes(req.user.id)) {
                memberIds.push(req.user.id);
            }

            const group = await ConversationService.createGroup({
                name,
                avatar,
                userIds: memberIds,
                ownerId: req.user.id,
                scope,
                topic_id,
                challenge_id
            });

            return res.status(201).json(group);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    listGroups: async (req, res) => {
        try {
            const conversations = await ConversationService.listUserConversations(
                req.user.id,
                {
                    scope: req.query.scope,
                    topic_id: req.query.topic_id,
                    challenge_id: req.query.challenge_id
                }
            );

            const groups = conversations.filter((c) => c.type === "GROUP");
            return res.json(groups);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    getMessages: async (req, res) => {
        try {
            const { conversationId } = req.params;

            const messages = await ConversationService.getMessagesByConversation(
                conversationId,
                req.user.id
            );

            return res.json(messages);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { content } = req.body;
            const files = req.files || [];

            if ((!content || String(content).trim() === "") && files.length === 0) {
                return res.status(400).json({ error: "Message content or file is required" });
            }

            const message = await ConversationService.sendMessage(
                conversationId,
                req.user.id,
                content || "",
                {
                    files
                }
            );

            return res.status(201).json(message);
        } catch (error) {
            const msg = error.message?.toLowerCase();

            if (msg?.includes("forbidden")) {
                return res.status(403).json({ error: error.message });
            }

            if (msg?.includes("unsupported file type")) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: error.message });
        }
    },

    leaveGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;

            await ConversationService.leaveConversation(conversationId, req.user.id);

            return res.json({ message: "Left group successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = { GroupController };