const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const unzipper = require('unzipper');
const { TestcaseService } = require('../services/testcase.service');

const walkFiles = async (dir) => {
    let results = [];
    const list = await fsp.readdir(dir, { withFileTypes: true });
    for (const file of list) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(await walkFiles(fullPath));
        } else {
            results.push(fullPath);
        }
    }
    return results;
};

const norm = (p) => path.basename(p).toLowerCase();

const TestcaseController = {
    createFromZip: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ message: 'No zip file uploaded' });
            if (!req.params.challenge_id) return res.status(400).json({ message: 'Missing challenge_id' });

            const zipPath = req.file.path; // multer lưu file zip vào uploads/:challenge_id
            const challengeDir = path.dirname(zipPath); // -> uploads/:challenge_id

            await fsp.mkdir(challengeDir, { recursive: true });

            // Giải nén zip
            await new Promise((resolve, reject) => {
                fs.createReadStream(zipPath)
                    .pipe(unzipper.Extract({ path: challengeDir }))
                    .on('close', resolve)
                    .on('error', reject);
            });

            // Xoá zip sau khi giải nén
            fsp.unlink(zipPath).catch(() => { });

            const files = await walkFiles(challengeDir);
            if (!files.length) return res.status(400).json({ message: 'Zip extracted but no files found' });

            const inputRegex = /^input(\d+)(?:\.(txt|in|out|dat))?$/i;
            const testcasesToCreate = [];

            // map basename(lower-case) -> fullPath
            const baseToFull = Object.create(null);
            for (const p of files) baseToFull[norm(p)] = p;

            for (const p of files) {
                const base = path.basename(p);
                const m = base.match(inputRegex);
                if (!m) continue;
                const idx = m[1];

                const candidates = [
                    `output${idx}`,
                    `output${idx}.txt`,
                    `output${idx}.out`,
                    `output${idx}.in`,
                    `output${idx}.dat`
                ].map(s => s.toLowerCase());

                const found = candidates.map(c => baseToFull[c]).find(Boolean);
                if (!found) continue;

                const relInput = path.relative(process.cwd(), p);
                const relOutput = path.relative(process.cwd(), found);

                testcasesToCreate.push({
                    input_path: relInput,
                    expected_output_path: relOutput
                });
            }

            if (!testcasesToCreate.length) {
                return res.status(400).json({ message: 'No input/output pairs found in zip (checked recursively)' });
            }

            // Chia score tự động: tổng 100 chia đều
            const n = testcasesToCreate.length;
            const baseScore = Math.floor(100 / n);
            testcasesToCreate.forEach(tc => tc.score = baseScore);

            const created = [];
            for (const tc of testcasesToCreate) {
                try {
                    const c = await TestcaseService.create(
                        req.params.challenge_id,
                        tc.input_path,
                        tc.expected_output_path,
                        tc.score
                    );
                    created.push(c);
                } catch (err) {
                    console.error('Failed to create testcase for', tc, err);
                }
            }

            return res.status(201).json(created);
        } catch (err) {
            console.error('createFromZip error:', err);
            return res.status(500).json({ message: err.message || 'Internal error' });
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
