const { TestcaseService } = require('../services/testcase.service');

const TestcaseController = {
    createMany: async (req, res) => {
        try {
            const created = await TestcaseService.createMany(req.params.challenge_id, req.body.testcases);
            res.status(201).json(created);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    listByChallenge: async (req, res) => {
        try {
            const testcases = await TestcaseService.listByChallenge(req.params.challenge_id);
            res.json(testcases);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const updated = await TestcaseService.update(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await TestcaseService.delete(req.params.id);
            res.json({ message: 'Deleted' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
};

module.exports = { TestcaseController };
