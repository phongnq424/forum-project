// worker.js
import 'dotenv/config'
import Redis from 'ioredis'
import axios from 'axios'
import { languages } from './utils/languages.js'
import { compareOutputs } from './utils/compares.js'
import { runInSandbox } from './utils/docker.js'

const redis = new Redis(process.env.REDIS_URL)
const TIMEOUT = parseInt(process.env.SANDBOX_TIMEOUT) || 5
const BACKEND_URL = `${process.env.BACKEND_API_URL}/submissions/result`

console.log('Judge worker started...')

// Xử lý 1 job
async function processJob(jobData) {
    let job
    try {
        job = JSON.parse(jobData)
    } catch (e) {
        console.error('Invalid job JSON:', jobData)
        return
    }

    const langConfig = languages[job.language]
    if (!langConfig) {
        await sendResult(job, 'IE', 'Unsupported language', '')
        return
    }

    // Chạy code
    const sandboxResult = await runInSandbox(langConfig, job.code, job.input, TIMEOUT)

    // Xác định kết quả
    let result = 'IE'
    let output = sandboxResult.stdout || ''

    if (sandboxResult.error === 'CE') {
        result = 'CE'
        output = sandboxResult.stderr
    } else if (sandboxResult.error === 'TLE') {
        result = 'TLE'
    } else if (sandboxResult.error === 'MLE') {
        result = 'MLE'
    } else if (compareOutputs(sandboxResult.stdout, job.expectedOutput)) {
        result = 'AC'
    } else {
        result = 'WA'
    }

    // Gửi kết quả (có retry)
    await sendResult(job, result, output, sandboxResult.stderr)
}

// Gửi kết quả về backend (retry 3 lần)
async function sendResult(job, verdict, output, stderr = '') {
    const payload = {
        submissionId: job.submissionId,
        testcaseId: job.testcaseId,
        result: verdict,
        output,
        stderr,
    }

    for (let i = 0; i < 3; i++) {
        try {
            await axios.post(BACKEND_URL, payload, { timeout: 5000 })
            console.log(`Submission ${job.submissionId}, Test ${job.testcaseId}: ${verdict}`)
            return
        } catch (e) {
            console.warn(`Retry ${i + 1}/3 gửi kết quả...`, e.message)
            if (i === 2) {
                console.error('Gửi kết quả thất bại sau 3 lần:', payload)
                // TODO: lưu vào dead-letter queue
            } else {
                await new Promise(res => setTimeout(res, 1000 * (i + 1)))
            }
        }
    }
}

// Main loop: dùng BRPOP (blocking)
async function main() {
    console.log('Waiting for jobs in judge_queue...')

    while (true) {
        try {
            // BRPOP: block đến khi có job
            const result = await redis.brpop('judge_queue', 0)
            const jobData = result[1] // [queue_name, data]

            // Xử lý async, không block queue
            processJob(jobData).catch(err => {
                console.error('Unhandled error in processJob:', err)
            })

        } catch (err) {
            console.error('Redis error:', err)
            await new Promise(res => setTimeout(res, 5000)) // reconnect
        }
    }
}

main().catch(err => {
    console.error('Worker crashed:', err)
    process.exit(1)
})