import Docker from 'dockerode'
import tar from 'tar-stream'
import { Writable } from 'stream'

const docker = new Docker()
const MAX_CONCURRENCY = 4  // số container chạy đồng thời, bạn có thể tăng/giảm

export async function runInSandbox(langConfig, code, testcases, timeoutMs = 5000) {
    const results = new Array(testcases.length)

    const tasks = testcases.map((t, idx) => async () => {
        let container
        try {
            container = await docker.createContainer({
                Image: langConfig.image,
                WorkingDir: '/sandbox',
                User: 'judgeuser',
                Cmd: ['sh', '-c', 'sleep 300'],
                Tty: false,
                HostConfig: {
                    NetworkMode: 'none',
                    Memory: 512 * 1024 * 1024,
                    MemorySwap: 512 * 1024 * 1024,
                    NanoCpus: 500_000_000,
                    PidsLimit: 64
                }
            })

            await container.start()

            const pack = tar.pack()
            pack.entry({ name: langConfig.filename }, code)
            pack.finalize()
            await container.putArchive(pack, { path: '/sandbox' })

            if (langConfig.compileCmd) {
                const compileRes = await exec(container, langConfig.compileCmd, null, 30000)
                if (compileRes.exitCode !== 0) {
                    results[idx] = { stdout: '', stderr: compileRes.stderr, error: 'CE' }
                    await container.remove({ force: true })
                    return
                }
            }

            const runCmd = langConfig.runCmd
            const res = await exec(container, ['sh', '-c', `timeout ${Math.ceil(timeoutMs / 1000)}s ${runCmd.join(' ')}`], t.input ?? '', timeoutMs)

            if (res.timeout) results[idx] = { stdout: '', stderr: '', error: 'TLE' }
            else if (res.exitCode !== 0) results[idx] = { stdout: res.stdout, stderr: res.stderr, error: 'RE' }
            else results[idx] = { stdout: res.stdout, stderr: res.stderr, error: null }

        } catch (e) {
            results[idx] = { stdout: '', stderr: e.message, error: 'IE' }
        } finally {
            if (container) try { await container.remove({ force: true }) } catch { }
        }
    })

    // Chạy song song với concurrency limit
    const pool = []
    for (const task of tasks) {
        const p = task()
        pool.push(p)
        if (pool.length >= MAX_CONCURRENCY) {
            await Promise.race(pool)
            // loại những promise đã hoàn thành khỏi pool
            for (let i = pool.length - 1; i >= 0; i--) {
                if (pool[i].isFulfilled || pool[i].isRejected) pool.splice(i, 1)
            }
        }
    }
    await Promise.all(pool)
    return results
}

async function exec(container, cmd, stdin, timeoutMs) {
    const execObj = await container.exec({
        Cmd: cmd,
        AttachStdin: stdin !== null,
        AttachStdout: true,
        AttachStderr: true,
        Tty: false
    })

    const stream = await execObj.start({ hijack: true, stdin: stdin !== null })
    let stdout = '', stderr = ''

    const out = new Writable({ write(chunk, _, cb) { stdout += chunk.toString(); cb() } })
    const err = new Writable({ write(chunk, _, cb) { stderr += chunk.toString(); cb() } })

    docker.modem.demuxStream(stream, out, err)

    if (stdin !== null) { stream.write(stdin); stream.end() }

    let timeout = false
    let timer
    if (timeoutMs) {
        timer = setTimeout(async () => {
            timeout = true
            try { await container.kill('SIGKILL') } catch { }
        }, timeoutMs)
    }

    await new Promise(res => stream.on('end', res))
    if (timer) clearTimeout(timer)

    const inspect = await execObj.inspect()
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: inspect.ExitCode ?? -1, timeout }
}
