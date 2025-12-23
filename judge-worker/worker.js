import 'dotenv/config'
import Redis from 'ioredis'
import axios from 'axios'
import { languages } from './utils/language.js'
import { compareOutputs } from './utils/compare.js'
import { runInSandbox } from './utils/docker.js'

const redis = new Redis(process.env.REDIS_URL)
const TIMEOUT = parseInt(process.env.SANDBOX_TIMEOUT) || 5
const BACKEND_API = process.env.BACKEND_API_URL
const BACKEND_RESULT_URL = `${BACKEND_API}/submissions/result`
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN

console.log('Judge worker started...')

async function fetchTestcaseById(id) {
    try {
        const url = `${BACKEND_API}/internal/testcases`
        const resp = await axios.get(url, {
            params: { ids: id },
            headers: { Authorization: `Bearer ${INTERNAL_TOKEN}` },
            timeout: 5000
        })
        const testcases = resp.data.testcases || []
        if (!testcases.length) console.warn(`[Worker] No testcase returned for id ${id}`)
        return testcases[0] || null
    } catch (err) {
        console.error(`[Worker] Error fetching testcase ${id}:`, err && (err.message || err.toString()))
        return null
    }
}

function normalizeCase(t) {
    return {
        testcaseId: t.testcaseId,
        input: (t.input ?? '').toString().replace(/\r/g, ''),
        expected_output: (t.expected_output ?? '').toString().replace(/\r/g, ''),
        score: typeof t.score === 'number' ? t.score : 1
    }
}

async function processJob(jobData) {
    let job
    try { job = JSON.parse(jobData) } catch { return console.error('[Worker] Invalid job JSON') }

    console.log(`[Worker] Processing submissionId=${job.submissionId}, language=${job.language}`)

    const langConfig = languages[job.language]
    if (!langConfig) { await sendResult(job.submissionId, 0, 'IE', []); return }

    const testcases = []
    for (const t of job.testcases) {
        const fetched = await fetchTestcaseById(t.testcaseId)
        if (fetched) testcases.push(normalizeCase(fetched))
    }
    if (!testcases.length) { await sendResult(job.submissionId, 0, 'IE', []); return }

    console.log(`[Worker] Running ${testcases.length} testcases for submission ${job.submissionId}`)

    const timeoutPerTestcase = job.time_limit ?? (TIMEOUT * 1000)
    const testcaseResults = []
    let totalScore = 0

    const sandboxResults = await runInSandbox(langConfig, job.code, testcases, timeoutPerTestcase)

    for (let i = 0; i < testcases.length; i++) {
        const t = testcases[i]
        const r = sandboxResults[i] || { stdout: '', error: 'IE' }

        const stdoutStr = (r.stdout ?? '').toString().replace(/\r/g, '')
        let result = 'IE', score = 0

        if (!t.input && !t.expected_output) result = 'IE'
        else if (r.error === 'CE') result = 'CE'
        else if (r.error === 'TLE') result = 'TLE'
        else if (r.error === 'MLE') result = 'MLE'
        else if (compareOutputs(stdoutStr.trim(), t.expected_output.trim())) {
            result = 'AC'
            score = t.score
            totalScore += score
        } else result = 'WA'

        testcaseResults.push({ testcaseId: t.testcaseId, result, score })
    }

    let finalStatus = 'ACCEPTED'
    if (testcaseResults.some(t => t.result === 'CE')) finalStatus = 'CE'
    else if (testcaseResults.some(t => t.result === 'TLE')) finalStatus = 'TLE'
    else if (testcaseResults.some(t => t.result === 'MLE')) finalStatus = 'MLE'
    else if (testcaseResults.every(t => t.result === 'IE')) finalStatus = 'IE'
    else if (testcaseResults.some(t => t.result !== 'AC')) finalStatus = 'WA'

    await sendResult(job.submissionId, totalScore, finalStatus, testcaseResults)
}

async function sendResult(submissionId, totalScore, finalStatus, testcaseResults) {
    const payload = { submissionId, score: totalScore, status: finalStatus, testcases: testcaseResults }
    for (let i = 0; i < 3; i++) {
        try { await axios.post(BACKEND_RESULT_URL, payload, { timeout: 5000 }); return }
        catch { if (i < 2) await new Promise(r => setTimeout(r, 1000 * (i + 1))) }
    }
}

async function main() {
    while (true) {
        try {
            const result = await redis.brpop('judge_queue', 0)
            processJob(result[1]).catch(err => console.error('[Worker] Error:', err))
        } catch {
            await new Promise(r => setTimeout(r, 5000))
        }
    }
}

main().catch(err => { console.error('[Worker] Crashed:', err); process.exit(1) })
