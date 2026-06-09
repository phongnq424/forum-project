const { ModerationService } = require("../services/moderation.service");

const ModerationController = {
    listCases: async (req, res) => {
        try {
            const result = await ModerationService.listCases(req.query);

            return res.status(200).json({
                message: "Report cases fetched successfully",
                ...result
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    },

    getCaseById: async (req, res) => {
        try {
            const result = await ModerationService.getCaseById(req.params.id);

            if (!result) {
                return res.status(404).json({
                    message: "Report case not found"
                });
            }

            return res.status(200).json({
                message: "Report case fetched successfully",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    },

    assignCase: async (req, res) => {
        try {
            const result = await ModerationService.assignCase(req.params.id, req.user.id);

            return res.status(200).json({
                message: "Report case assigned successfully",
                data: result
            });
        } catch (e) {
            return res.status(400).json({
                message: e.message
            });
        }
    },

    applyAction: async (req, res) => {
        try {
            const result = await ModerationService.applyAction(
                req.params.id,
                req.user.id,
                req.body
            );

            return res.status(200).json({
                message: "Moderation action applied successfully",
                data: result
            });
        } catch (e) {
            return res.status(400).json({
                message: e.message
            });
        }
    },

    resolveCase: async (req, res) => {
        try {
            const result = await ModerationService.resolveCase(
                req.params.id,
                req.user.id,
                req.body
            );

            return res.status(200).json({
                message: "Report case resolved successfully",
                data: result
            });
        } catch (e) {
            return res.status(400).json({
                message: e.message
            });
        }
    },

    closeCase: async (req, res) => {
        try {
            const result = await ModerationService.closeCase(
                req.params.id,
                req.user.id,
                req.body
            );

            return res.status(200).json({
                message: "Report case closed successfully",
                data: result
            });
        } catch (e) {
            return res.status(400).json({
                message: e.message
            });
        }
    }
};

module.exports = { ModerationController };