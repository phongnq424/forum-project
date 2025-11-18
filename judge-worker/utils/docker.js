// utils/docker.js
import Docker from 'dockerode';
import tar from 'tar-stream';

const docker = new Docker();

export async function runInSandbox(langConfig, code, input, timeoutSec = 5) {
    let container;
    try {
        container = await docker.createContainer({
            Image: langConfig.image,
            Tty: false,
            WorkingDir: '/sandbox',
            User: 'judgeuser',
            HostConfig: {
                AutoRemove: true,
                NetworkMode: 'none',
                Memory: 256 * 1024 * 1024,
                MemorySwap: 256 * 1024 * 1024,
                NanoCpus: 500_000_000, // 0.5 CPU
                PidsLimit: 64,
            },
        });

        await container.start();

        // Copy code + input
        const pack = tar.pack();
        pack.entry({ name: langConfig.filename }, code);
        pack.entry({ name: 'input.txt' }, input || '');
        pack.finalize();
        await container.putArchive(pack, { path: '/sandbox' });

        // Compile
        if (langConfig.compileCmd) {
            const compileRes = await runExec(container, langConfig.compileCmd, timeoutSec);
            if (compileRes.exitCode !== 0) {
                return { stdout: '', stderr: compileRes.stderr, error: 'CE', timeout: false };
            }
        }

        // Run with timeout
        const runCmd = ['timeout', `${timeoutSec}`, ...langConfig.runCmd];
        const result = await runExec(container, runCmd, timeoutSec + 1);

        return {
            stdout: result.stdout,
            stderr: result.stderr,
            error: result.timeout ? 'TLE' : (result.exitCode === 137 ? 'MLE' : ''),
            timeout: result.timeout,
        };

    } catch (err) {
        return { stdout: '', stderr: 'Internal Error', error: 'IE', timeout: false };
    } finally {
        if (container) await container.stop().catch(() => { });
    }
}

// Helper: chạy exec + demux stdout/stderr
async function runExec(container, Cmd, timeoutSec) {
    const exec = await container.exec({
        Cmd,
        AttachStdout: true,
        AttachStderr: true,
    });

    const stream = await exec.start();
    let stdout = '', stderr = '';

    docker.modem.demuxStream(stream,
        chunk => stdout += chunk.toString(),
        chunk => stderr += chunk.toString()
    );

    const { ExitCode } = await exec.inspect();
    const timedOut = ExitCode === null;

    return { stdout, stderr, exitCode: timedOut ? -1 : ExitCode, timeout: timedOut };
}