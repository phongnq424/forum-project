const path = require('path');

const parseTestcases = (files) => {

    const inputRegex = /^input(\d+)(?:\.(txt|in|out|dat))?$/i;

    const baseToFull = {};

    for (const f of files)
        baseToFull[path.basename(f).toLowerCase()] = f;

    const testcases = [];

    for (const f of files) {

        const base = path.basename(f);
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

        const found = candidates
            .map(c => baseToFull[c])
            .find(Boolean);

        if (!found) continue;

        testcases.push({
            input_path: f,
            expected_output_path: found
        });
    }

    return testcases;
};

module.exports = { parseTestcases };