const { ChallengeService } = require('../services/challenge.service');

const ChallengeController = {
    create: async (req, res) => {
        try {
            const challenge = await ChallengeService.create(req.body);
            res.status(201).json(challenge);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    list: async (req, res) => {
        try {
            const result = await ChallengeService.list(req.query);
            res.json(result);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const challenge = await ChallengeService.getById(req.params.id);
            if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
            res.json(challenge);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const updated = await ChallengeService.update(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await ChallengeService.delete(req.params.id);
            res.json({ message: 'Deleted' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
};

module.exports = { ChallengeController };
