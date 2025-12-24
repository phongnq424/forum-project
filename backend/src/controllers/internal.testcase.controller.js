const fs = require('fs').promises;
const path = require('path');
const { TestcaseService } = require('../services/testcase.service');

const InternalTestcaseController = {
    getByIds: async (req, res) => {
        try {
            // UUID string → không parseInt
            const ids = (req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean);
            if (!ids.length) return res.json({ testcases: [] });

            const dbCases = await TestcaseService.listByIds(ids);

            const testcases = await Promise.all(dbCases.map(async t => {
                const input = await fs.readFile(path.resolve(t.input_path), 'utf8').catch(err => {
                    console.error(`[TestcaseController] Failed reading input for testcase ${t.id}:`, err.message);
                    return '';
                });
                const expected_output = await fs.readFile(path.resolve(t.expected_output_path), 'utf8').catch(err => {
                    console.error(`[TestcaseController] Failed reading expected_output for testcase ${t.id}:`, err.message);
                    return '';
                });
                if (!input && !expected_output) return null; // skip testcase rỗng
                return { testcaseId: t.id, input, expected_output, score: t.score };
            }));

            res.json({ testcases: testcases.filter(Boolean) });
        } catch (err) {
            console.error('[InternalTestcaseController] getByIds error:', err);
            res.status(500).json({ testcases: [], message: err.message });
        }
    },

    getByChallenge: async (req, res) => {
        try {
            const challengeId = req.params.challengeId; // giữ nguyên string nếu UUID
            const dbCases = await TestcaseService.listByChallenge(challengeId);

            const testcases = await Promise.all(dbCases.map(async t => {
                const input = await fs.readFile(path.resolve(t.input_path), 'utf8').catch(err => {
                    console.error(`[TestcaseController] Failed reading input for testcase ${t.id}:`, err.message);
                    return '';
                });
                const expected_output = await fs.readFile(path.resolve(t.expected_output_path), 'utf8').catch(err => {
                    console.error(`[TestcaseController] Failed reading expected_output for testcase ${t.id}:`, err.message);
                    return '';
                });
                if (!input && !expected_output) return null;
                return { testcaseId: t.id, input, expected_output, score: t.score };
            }));

            res.json({ testcases: testcases.filter(Boolean) });
        } catch (err) {
            console.error('[InternalTestcaseController] getByChallenge error:', err);
            res.status(500).json({ testcases: [], message: err.message });
        }
    }
};

module.exports = { InternalTestcaseController };
