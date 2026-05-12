const fs = require('fs').promises;
const path = require('path');
const { TestcaseService } = require('../services/testcase.service');

async function readFileSafe(filePath, label, testcaseId) {
    if (!filePath) return "";

    return await fs.readFile(path.resolve(filePath), 'utf8').catch(err => {
        console.error(`[TestcaseController] Failed reading ${label} for testcase ${testcaseId}:`, err.message);
        return '';
    });
}

async function normalizeInternalTestcase(t) {
    const inputFromPath = await readFileSafe(t.input_path, "input", t.id);
    const expectedFromPath = await readFileSafe(t.expected_output_path, "expected_output", t.id);
    const schema = await readFileSafe(t.schema_path, "schema", t.id);

    return {
        testcaseId: t.id,
        name: t.name,
        score: t.score,
        visibility: t.visibility,
        order_index: t.order_index,

        input: inputFromPath,
        expected_output: expectedFromPath,
        schema,

        input_json: t.input_json || null,
        expected_json: t.expected_json || null,

        steps: (t.steps || []).map(step => ({
            stepId: step.id,
            name: step.name,
            order_index: step.order_index,
            method: step.method,
            path: step.path,
            headers_json: step.headers_json,
            body_json: step.body_json,
            expected_status: step.expected_status,
            expected_json: step.expected_json,
            expected_headers_json: step.expected_headers_json,
            assert_json: step.assert_json,
            save_variables: step.save_variables,
            score: step.score
        }))
    };
}

const InternalTestcaseController = {
    getByIds: async (req, res) => {
        try {
            const ids = (req.query.ids || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            if (!ids.length) return res.json({ testcases: [] });

            const dbCases = await TestcaseService.listByIds(ids);

            const testcases = await Promise.all(
                dbCases.map(normalizeInternalTestcase)
            );

            res.json({ testcases });
        } catch (err) {
            console.error('[InternalTestcaseController] getByIds error:', err);
            res.status(500).json({ testcases: [], message: err.message });
        }
    },

    getByChallenge: async (req, res) => {
        try {
            const challengeId = req.params.challengeId;
            const dbCases = await TestcaseService.listByChallenge(challengeId);

            const testcases = await Promise.all(
                dbCases.map(normalizeInternalTestcase)
            );

            res.json({ testcases });
        } catch (err) {
            console.error('[InternalTestcaseController] getByChallenge error:', err);
            res.status(500).json({ testcases: [], message: err.message });
        }
    }
};

module.exports = { InternalTestcaseController };