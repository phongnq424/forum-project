const { CallService } = require("../services/conversation/call.service");
const { buildBlockContext } = require("../contexts/block.context");

function getStatusCode(error) {
    const msg = error.message?.toLowerCase() || "";

    if (
        msg.includes("missing") ||
        msg.includes("invalid") ||
        msg.includes("already completed")
    ) {
        return 400;
    }

    if (
        msg.includes("forbidden") ||
        msg.includes("not a participant") ||
        msg.includes("blocked")
    ) {
        return 403;
    }

    if (
        msg.includes("not found") ||
        msg.includes("conversation not found") ||
        msg.includes("call not found")
    ) {
        return 404;
    }

    if (
        msg.includes("busy") ||
        msg.includes("not ringing") ||
        msg.includes("not ongoing") ||
        msg.includes("not allowed")
    ) {
        return 409;
    }

    return 500;
}

const CallController = {
    startCall: async (req, res) => {
        try {
            const callerId = req.user.id;
            const { conversationId, type = "AUDIO" } = req.body;

            if (!conversationId) {
                return res.status(400).json({ error: "Missing conversationId" });
            }

            const normalizedType = String(type).toUpperCase();

            const blockContext = await buildBlockContext(callerId);

            const result = await CallService.startCall(
                conversationId,
                callerId,
                normalizedType,
                { blockContext }
            );

            return res.status(201).json(result);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    },

    listCalls: async (req, res) => {
        try {
            const viewerId = req.user.id;
            const { conversationId } = req.query;

            if (!conversationId) {
                return res.status(400).json({ error: "Missing conversationId" });
            }

            const calls = await CallService.listCalls(
                String(conversationId),
                viewerId
            );

            return res.json(calls);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    },

    getCall: async (req, res) => {
        try {
            const viewerId = req.user.id;
            const { callId } = req.params;

            const call = await CallService.getCall(callId, viewerId);

            return res.json(call);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    },

    answerCall: async (req, res) => {
        try {
            const viewerId = req.user.id;
            const { callId } = req.params;

            const result = await CallService.acceptCall(callId, viewerId);

            return res.json(result);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    },

    rejectCall: async (req, res) => {
        try {
            const viewerId = req.user.id;
            const { callId } = req.params;

            const result = await CallService.rejectCall(callId, viewerId);

            return res.json(result);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    },

    cancelCall: async (req, res) => {
        try {
            const viewerId = req.user.id;
            const { callId } = req.params;

            const result = await CallService.cancelCall(callId, viewerId);

            return res.json(result);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    },

    endCall: async (req, res) => {
        try {
            const viewerId = req.user.id;
            const { callId } = req.params;

            const result = await CallService.endCall(callId, viewerId);

            return res.json(result);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    },

    markMissedCall: async (req, res) => {
        try {
            const viewerId = req.user.id;
            const { callId } = req.params;

            const result = await CallService.markMissedCall(callId, viewerId);

            return res.json(result);
        } catch (error) {
            return res.status(getStatusCode(error)).json({ error: error.message });
        }
    }
};

module.exports = { CallController };