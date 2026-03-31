const path = require('path');

const parseTestcases = (files) => {

    const baseToFull = {};
    for (const f of files)
        baseToFull[path.basename(f).toLowerCase()] = f;

    const testcases = [];

    const schema = baseToFull['schema.sql'] || null;

    const inputRegex = /^input(\d+)\.(txt|in|out|dat|sql)$/i;

    for (const f of files) {

        const base = path.basename(f).toLowerCase();
        const m = base.match(inputRegex);

        if (!m) continue;

        const idx = m[1];
        const ext = m[2];

        let expected;


        const candidates = [
            `output${idx}`,
            `output${idx}.txt`,
            `output${idx}.out`,
            `output${idx}.in`,
            `output${idx}.dat`,
            `output${idx}.sql`
        ].map(s => s.toLowerCase());

        expected = candidates
            .map(c => baseToFull[c])
            .find(Boolean);

        if (!expected) continue;

        testcases.push({
            input_path: f,
            expected_output_path: expected,
            schema_path: schema
        });
    }

    return testcases;
};

module.exports = { parseTestcases };