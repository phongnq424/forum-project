const { SubmissionService } = require("../services/submission.service");

const SubmissionController = {
    submit: async (req, res) => {
        try {
            const {
                challenge_id,
                code,
                language_id,
                kind = "CODE",
                file_path
            } = req.body;

            const user_id = req.user.id;

            if (!challenge_id || !user_id || !language_id) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            if (kind === "CODE" && !code) {
                return res.status(400).json({ message: "Code is required for CODE submission" });
            }

            if (kind === "ZIP" && !file_path) {
                return res.status(400).json({ message: "file_path is required for ZIP submission" });
            }

            const submission = await SubmissionService.submit({
                challenge_id,
                user_id,
                code,
                file_path,
                kind,
                language_id
            });

            return res.status(201).json({
                id: submission.id,
                status: submission.status
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: err.message || "Internal server error"
            });
        }
    },

    receiveResult: async (req, res) => {
        try {
            const {
                submissionId,
                score,
                status,
                testcases = [],
                runtime_ms,
                memory_kb,
                error_message
            } = req.body;

            if (!submissionId || score === undefined || !status) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const result = await SubmissionService.updateResult({
                submissionId,
                score,
                status,
                testcases,
                runtime_ms,
                memory_kb,
                error_message
            });

            return res.status(200).json({
                message: "Result saved",
                result
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: err.message || "Internal server error"
            });
        }
    },

    listByChallenge: async (req, res) => {
        try {
            const subs = await SubmissionService.listByChallenge(req.params.challenge_id);
            return res.json(subs);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const sub = await SubmissionService.getById(req.params.id);

            if (!sub) {
                return res.status(404).json({ message: "Submission not found" });
            }

            const isOwner = sub.user_id === req.user.id;
            const isAdmin = req.user.role === "ADMIN";

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ message: "Forbidden" });
            }

            return res.json(sub);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    listByUser: async (req, res) => {
        try {
            const user_id = req.user.id;
            const subs = await SubmissionService.listByUser(user_id);
            return res.json(subs);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    listByUserAndChallenge: async (req, res) => {
        try {
            const user_id = req.user.id;
            const challenge_id = req.params.challenge_id;

            const subs = await SubmissionService.listByUserAndChallenge(
                user_id,
                challenge_id
            );

            return res.json(subs);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    getInsight: async (req, res) => {
        try {
            const submissionId = req.params.id;
            const userId = req.user.id;
            const isAdmin = req.user.role === "ADMIN";

            const insight = await SubmissionService.getInsight(
                submissionId,
                userId,
                isAdmin
            );

            if (!insight) {
                return res.status(404).json({ message: "Insight not found" });
            }

            return res.json(insight);
        } catch (err) {
            if (err.message === "Forbidden") {
                return res.status(403).json({ message: err.message });
            }

            return res.status(500).json({ message: err.message });
        }
    },

    getRecommendations: async (req, res) => {
        try {
            const submissionId = req.params.id;
            const userId = req.user.id;

            const recommendations = await SubmissionService.getRecommendations(
                submissionId,
                userId
            );

            return res.json(recommendations);
        } catch (err) {
            if (err.message === "Forbidden") {
                return res.status(403).json({ message: err.message });
            }

            return res.status(500).json({ message: err.message });
        }
    }
};

module.exports = { SubmissionController };