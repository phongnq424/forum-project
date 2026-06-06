const fs = require("fs");
require("dotenv").config();

const AI_BASE_URL = process.env.AI_SERVICE_URL;
const AI_SERVER_SECRET_KEY = process.env.INTERNAL_TOKEN;

const INPUT_PATH = "tests/ai/moderation-testcases.json";
const OUTPUT_PATH = "tests/ai/moderation-results.json";

async function main() {
    if (!AI_SERVER_SECRET_KEY) {
        throw new Error("Missing AI_SERVER_SECRET_KEY environment variable");
    }

    const testcases = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));

    const response = await fetch(`${AI_BASE_URL}moderate/text/batch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_SERVER_SECRET_KEY}`
        },
        body: JSON.stringify({
            items: testcases.map((item) => ({
                id: String(item.id),
                content: item.content
            }))
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Server returned ${response.status}: ${errorText}`);
    }

    const payload = await response.json();

    if (!payload.success) {
        throw new Error(`AI moderation failed: ${payload.error || "Unknown error"}`);
    }

    const predictions = payload.results || [];
    const predictionMap = new Map();

    for (const item of predictions) {
        predictionMap.set(String(item.id), item);
    }

    let correct = 0;

    const results = testcases.map((item) => {
        const id = String(item.id);
        const prediction = predictionMap.get(id);

        const actual = prediction ? prediction.is_safe === true : null;
        const expected = item.expected_is_safe === true;
        const passed = actual === expected;

        if (passed) {
            correct++;
        }

        return {
            id,
            content: item.content,
            expected_is_safe: expected,
            actual_is_safe: actual,
            passed,
            source: prediction ? prediction.source : null,
            category: prediction ? prediction.category : null,
            reason: prediction ? prediction.reason : null
        };
    });

    const accuracy = (correct / testcases.length) * 100;

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf8");

    console.log(`Total: ${testcases.length}`);
    console.log(`Correct: ${correct}`);
    console.log(`Wrong: ${testcases.length - correct}`);
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
    console.log(`Saved: ${OUTPUT_PATH}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});