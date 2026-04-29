const { ReportService } = require("../services/report.service");

const ReportController = {
    create: async (req, res) => {
        try {
            const reporterId = req.user.id;
            const report = await ReportService.create(reporterId, req.body);
            return res.status(201).json(report);
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
    },

    list: async (req, res) => {
        try {
            const result = await ReportService.list(req.query);
            return res.status(200).json(result);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },

    getById: async (req, res) => {
        try {
            const report = await ReportService.getById(req.params.id);
            if (!report) {
                return res.status(404).json({ message: "Report not found" });
            }

            return res.status(200).json(report);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ message: "Status is required" });
            }

            const updated = await ReportService.updateStatus(
                req.params.id,
                status
            );

            return res.status(200).json(updated);
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
    },

    reply: async (req, res) => {
        try {
            const { message } = req.body;
            const reply = await ReportService.reply(req.params.id, message);
            return res.status(201).json(reply);
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
    },

    delete: async (req, res) => {
        try {
            await ReportService.delete(req.params.id);
            return res.status(200).json({ message: "Deleted" });
        } catch (e) {
            return res.status(400).json({ message: e.message });
        }
    }
};

module.exports = { ReportController };