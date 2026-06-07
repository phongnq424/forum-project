const { ConversationService } = require("../services/conversation/conversation.service");

function mapControllerError(error, res) {
    const msg = error.message?.toLowerCase() || "";

    if (msg.includes("forbidden")) {
        return res.status(403).json({ error: error.message });
    }

    if (msg.includes("blocked")) {
        return res.status(403).json({ error: error.message });
    }

    if (msg.includes("not found")) {
        return res.status(404).json({ error: error.message });
    }

    if (msg.includes("not available")) {
        return res.status(403).json({ error: error.message });
    }

    if (msg.includes("unsupported file type")) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
}

const GroupController = {
    createGroup: async (req, res) => {
        try {
            const {
                name,
                avatar,
                userIds = [],
                scope,
                topic_id,
                challenge_id
            } = req.body;

            const memberIds = [...userIds];

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
            return mapControllerError(error, res);
        }
    },

    adminCreateGroup: async (req, res) => {
        try {
            const {
                name,
                avatar,
                scope,
                topic_id,
                challenge_id
            } = req.body;

            const group = await ConversationService.createGroup({
                name,
                avatar,
                userIds: [req.user.id],
                ownerId: req.user.id,
                scope,
                topic_id,
                challenge_id
            });

            return res.status(201).json(group);
        } catch (error) {
            return mapControllerError(error, res);
        }
    },

    adminListGroups: async (req, res) => {
        try {
            const groups = await ConversationService.adminListGroups({
                q: req.query.q,
                scope: req.query.scope,
                topic_id: req.query.topic_id,
                challenge_id: req.query.challenge_id
            });

            return res.json(groups);
        } catch (error) {
            return mapControllerError(error, res);
        }
    },

    listPublicGroups: async (req, res) => {
        try {
            const groups = await ConversationService.listPublicGroups(
                req.user.id,
                {
                    q: req.query.q,
                    scope: req.query.scope,
                    topic_id: req.query.topic_id,
                    challenge_id: req.query.challenge_id
                }
            );

            return res.json(groups);
        } catch (error) {
            return mapControllerError(error, res);
        }
    },

    joinGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;

            const result = await ConversationService.joinGroup(
                conversationId,
                req.user.id
            );

            return res.json(result);
        } catch (error) {
            return mapControllerError(error, res);
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
            return mapControllerError(error, res);
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
            return mapControllerError(error, res);
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { content = "" } = req.body;
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
            return mapControllerError(error, res);
        }
    },

    leaveGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;

            await ConversationService.leaveConversation(conversationId, req.user.id);

            return res.json({ message: "Left group successfully" });
        } catch (error) {
            return mapControllerError(error, res);
        }
    },
    adminUpdateGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;

            const {
                name,
                avatar,
                scope,
                topic_id,
                challenge_id
            } = req.body;

            const group = await ConversationService.updateGroupByAdmin(
                conversationId,
                {
                    name,
                    avatar,
                    scope,
                    topic_id,
                    challenge_id
                }
            );

            return res.json(group);
        } catch (error) {
            return mapControllerError(error, res);
        }
    },

    adminDeleteGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;

            await ConversationService.deleteGroupByAdmin(conversationId);

            return res.json({
                message: "Group deleted successfully"
            });
        } catch (error) {
            return mapControllerError(error, res);
        }
    },
};

module.exports = { GroupController };