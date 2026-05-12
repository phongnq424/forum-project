const { TestcaseService } = require('../services/testcase.service');

const TestcaseController = {
    createFromZip: async (req, res) => {
        try {
            if (!req.file)
                return res.status(400).json({ message: 'No zip uploaded' });

            if (!req.params.challenge_id)
                return res.status(400).json({ message: 'Missing challenge_id' });

            const result = await TestcaseService.createFromZip(
                req.params.challenge_id,
                req.file.path
            );

            res.status(201).json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    createApiTestcase: async (req, res) => {
        try {
            if (!req.params.challenge_id) {
                return res.status(400).json({ message: 'Missing challenge_id' });
            }

            const result = await TestcaseService.createApiTestcase(
                req.params.challenge_id,
                req.body
            );

            res.status(201).json(result);
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message });
        }
    },

    listByChallenge: async (req, res) => {
        try {
            const testcases = await TestcaseService.listByChallenge(req.params.challenge_id);
            res.json(testcases);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const updated = await TestcaseService.update(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await TestcaseService.delete(req.params.id);
            res.json({ message: 'Deleted' });
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message });
        }
    }
};

module.exports = { TestcaseController };