import "dotenv/config";
import { Worker } from "bullmq";
import axios from "axios";
import { languages } from "./utils/language.js";
import { compareOutputs } from "./utils/compare.js";
import { runInSandbox } from "./utils/docker.js";

const connection = {
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: null,
};

const DEFAULT_TIMEOUT_MS = Number(process.env.SANDBOX_TIMEOUT_MS || 5000);
const BACKEND_API = process.env.BACKEND_API_URL;
const BACKEND_RESULT_URL = `${BACKEND_API}/submissions/result`;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;

console.log("Judge worker started...");

async function fetchAllTestcases(job) {
    const ids = job.testcases.map((t) => t.testcaseId).join(",");

    const res = await axios.get(`${BACKEND_API}/internal/testcases`, {
        params: { ids },
        headers: { Authorization: `Bearer ${INTERNAL_TOKEN}` },
        timeout: 10000,
    });

    return res.data.testcases.map(normalizeCase);
}

function normalizeCase(t) {
    return {
        testcaseId: t.testcaseId,
        name: t.name || null,
        input: (t.input ?? "").toString().replace(/\r/g, ""),
        expected_output: (t.expected_output ?? "").toString().replace(/\r/g, ""),
        score: typeof t.score === "number" ? t.score : 1,
        schema: (t.schema ?? "").toString().replace(/\r/g, ""),

        input_json: t.input_json || null,
        expected_json: t.expected_json || null,
        steps: Array.isArray(t.steps) ? t.steps : [],
    };
}

function parseSqlAnalyst(stdout) {
    const userStatsPart =
        stdout.split("__USER_STATS__")[1]?.split("__EXPECTED_STATS__")[0] || "";
    const userSteps = parseInt(
        userStatsPart.match(/Virtual Machine Steps:\s+(\d+)/)?.[1] || "0"
    );

    const expectedStatsPart = stdout.split("__EXPECTED_STATS__")[1] || "";
    const expectedSteps = parseInt(
        expectedStatsPart.match(/Virtual Machine Steps:\s+(\d+)/)?.[1] || "0"
    );

    const parts = stdout.split("__EXPECTED_RESULT_START__");
    const userResult = parts[0].trim();
    const expectedResult = (parts[1] || "")
        .split("__EXPECTED_RESULT_END__")[0]
        .trim();

    return {
        userResult,
        expectedResult,
        userSteps,
        expectedSteps,
    };
}

function calculateSqlEfficiency(userSteps, expectedSteps, maxPerfScore) {
    if (userSteps <= expectedSteps || expectedSteps === 0) return maxPerfScore;

    const ratio = userSteps / expectedSteps;

    if (ratio >= 5.0) return 0;

    const factor = (5.0 - ratio) / (5.0 - 1.0);
    return Math.floor(maxPerfScore * factor);
}

function normalizeTimeoutMs(job) {
    const raw = Number(job.time_limit);

    if (!raw || raw <= 0) return DEFAULT_TIMEOUT_MS;

    return raw;
}

function getFinalStatus(testcaseResults) {
    if (testcaseResults.every((t) => t.result === "AC")) return "ACCEPTED";

    const totalScore = testcaseResults.reduce(
        (sum, t) => sum + Number(t.score || 0),
        0
    );

    if (totalScore > 0) return "PARTIAL";

    if (testcaseResults.some((t) => t.result === "CE")) return "CE";
    if (testcaseResults.some((t) => t.result === "TLE")) return "TLE";
    if (testcaseResults.some((t) => t.result === "MLE")) return "MLE";
    if (testcaseResults.some((t) => t.result === "RE")) return "RE";
    if (testcaseResults.every((t) => t.result === "IE")) return "IE";

    return "WA";
}

async function processSubmission(job) {
    console.log(
        `[Worker] Processing submissionId=${job.submissionId}, language=${job.language}, type=${job.type}`
    );

    const langConfig = languages[job.language];

    if (!langConfig) {
        await sendResult(job.submissionId, 0, "IE", []);
        return;
    }

    const testcases = await fetchAllTestcases(job);

    if (!testcases.length) {
        await sendResult(job.submissionId, 0, "IE", []);
        return;
    }

    console.log(
        `[Worker] Running ${testcases.length} testcases for submission ${job.submissionId}`
    );

    const timeoutMs = normalizeTimeoutMs(job);
    const testcaseResults = [];
    let totalScore = 0;

    const sandboxResults = await runInSandbox(
        langConfig,
        job.code,
        testcases,
        timeoutMs,
        {
            memory_limit: job.memory_limit,
            config: job.config,
        }
    );

    for (let i = 0; i < testcases.length; i++) {
        const t = testcases[i];
        const r = sandboxResults[i] || {
            stdout: "",
            stderr: "",
            error: "IE",
        };

        if (langConfig.type === "node_api") {
            const apiResult = r.apiResult || {
                testcaseId: t.testcaseId,
                result: r.error || "IE",
                score: 0,
                maxScore: t.score || 0,
                message: "Missing API result",
            };

            const result = apiResult.result || "IE";
            const score = Number(apiResult.score || 0);

            totalScore += score;

            testcaseResults.push({
                testcaseId: t.testcaseId,
                result,
                score,
                maxScore: apiResult.maxScore || t.score || 0,
                message: apiResult.message || "",
                stdout: r.stdout || "",
                stderr: r.stderr || "",
            });

            continue;
        }

        const stdoutStr = (r.stdout ?? "").toString().replace(/\r/g, "");

        console.log(
            `[Worker] Testcase ${t.testcaseId}: stdout="${stdoutStr}", stderr="${r.stderr}", error=${r.error}`
        );

        let result = "WA";
        let currentTcScore = 0;
        const maxScore = t.score || 0;

        let finalStdoutForCompare = "";
        let expectedForCompare = "";
        let userSteps = 0;
        let expectedSteps = 0;

        if (langConfig.type === "sql") {
            const parsed = parseSqlAnalyst(stdoutStr);

            finalStdoutForCompare = parsed.userResult;
            expectedForCompare = parsed.expectedResult;
            userSteps = parsed.userSteps;
            expectedSteps = parsed.expectedSteps;
        } else {
            finalStdoutForCompare = stdoutStr.trim();
            expectedForCompare = t.expected_output.trim();
        }

        if (!t.input && !t.expected_output) {
            result = "IE";
        } else if (r.error === "CE") {
            result = "CE";
        } else if (r.error === "RE") {
            result = "RE";
        } else if (r.error === "TLE") {
            result = "TLE";
        } else if (r.error === "MLE") {
            result = "MLE";
        } else if (compareOutputs(finalStdoutForCompare, expectedForCompare)) {
            result = "AC";

            if (langConfig.type === "sql") {
                const correctnessScore = maxScore / 2;
                const perfBonus = calculateSqlEfficiency(
                    userSteps,
                    expectedSteps,
                    maxScore / 2
                );

                currentTcScore = correctnessScore + perfBonus;
            } else {
                currentTcScore = maxScore;
            }

            totalScore += currentTcScore;
        } else {
            result = "WA";
        }

        testcaseResults.push({
            testcaseId: t.testcaseId,
            result,
            score: currentTcScore,
            maxScore,
            stdout: stdoutStr,
            stderr: r.stderr || "",
        });
    }

    const finalStatus = getFinalStatus(testcaseResults);

    await sendResult(job.submissionId, totalScore, finalStatus, testcaseResults);
}

async function sendResult(submissionId, totalScore, finalStatus, testcaseResults) {
    const payload = {
        submissionId,
        score: totalScore,
        status: finalStatus,
        testcases: testcaseResults,
    };

    for (let i = 0; i < 3; i++) {
        try {
            const res = await axios.post(BACKEND_RESULT_URL, payload, {
                timeout: 5000,
                headers: {
                    Authorization: `Bearer ${INTERNAL_TOKEN}`,
                },
            });

            console.log("SEND RESULT OK", res.status);
            return true;
        } catch (err) {
            console.error(
                "SEND RESULT FAIL",
                i + 1,
                err.response?.status || err.code
            );

            if (i < 2) {
                await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
            }
        }
    }

    return false;
}

async function main() {
    const worker = new Worker(
        "judge_queue",
        async (job) => {
            await processSubmission(job.data);
        },
        {
            connection,
            concurrency: Number(process.env.JUDGE_CONCURRENCY || 4),
        }
    );

    worker.on("completed", (job) => {
        console.log(
            `✅ [BullMQ] Job ${job.id} (Submission ${job.data.submissionId}) completed successfully.`
        );
    });

    worker.on("failed", (job, err) => {
        console.error(
            `❌ [BullMQ] Job ${job?.id} (Submission ${job?.data?.submissionId}) failed:`,
            err
        );
    });

    worker.on("error", (err) => {
        console.error(`⚠️ [BullMQ] Internal Worker Error:`, err);
    });
}

main().catch((err) => {
    console.error("[Worker] Crashed:", err);
    process.exit(1);
});