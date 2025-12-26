const { SubmissionService } = require('../services/submission.service');

const SubmissionController = {
    submit: async (req, res) => {
        try {
            const { challenge_id, code, language_id } = req.body;
            const user_id = req.user.id;
            if (!challenge_id || !user_id || !code || !language_id) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const submission = await SubmissionService.submit({ challenge_id, user_id, code, language_id });
            res.status(201).json({ submission });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    receiveResult: async (req, res) => {
        try {
            const { submissionId, score, status } = req.body;

            if (!submissionId || score === undefined || !status) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            await SubmissionService.updateResult({ submissionId, score, status });

            res.status(200).json({ message: 'Result saved' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    listByChallenge: async (req, res) => {
        try {
            const subs = await SubmissionService.listByChallenge(req.params.challenge_id);
            res.json(subs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const sub = await SubmissionService.getById(req.params.id);
            if (!sub) return res.status(404).json({ message: 'Submission not found' });
            res.json(sub);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    listByUser: async (req, res) => {
        try {
            const user_id = req.user.id;
            const subs = await SubmissionService.listByUser(user_id);
            res.json(subs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    listByUserAndChallenge: async (req, res) => {
        try {
            const user_id = req.user.id;
            const challenge_id = req.params.challenge_id;
            const subs = await SubmissionService.listByUserAndChallenge(user_id, challenge_id);
            res.json(subs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = { SubmissionController };
