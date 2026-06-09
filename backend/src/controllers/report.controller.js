const { ReportService } = require("../services/report.service");

const ReportController = {
    create: async (req, res) => {
        try {
            const reporterId = req.user.id;

            const meta = {
                ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
                userAgent: req.headers["user-agent"] || null
            };

            const result = await ReportService.create(reporterId, req.body, meta);

            return res.status(201).json({
                message: "Report submitted successfully",
                data: result
            });
        } catch (e) {
            return res.status(400).json({
                message: e.message
            });
        }
    },

    listMine: async (req, res) => {
        try {
            const result = await ReportService.listMine(req.user.id, req.query);

            return res.status(200).json({
                message: "Reports fetched successfully",
                ...result
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    }
};

module.exports = { ReportController };