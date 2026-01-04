import Docker from "dockerode";
import tar from "tar-stream";
import { Writable } from "stream";

const docker = new Docker();

export async function runInSandbox(
  langConfig,
  code,
  testcases,
  timeoutMs = 2000
) {
  const results = [];
  let container = null;

  try {
    container = await docker.createContainer({
      Image: langConfig.image,
      WorkingDir: "/sandbox",
      User: "judgeuser",
      Cmd: ["sh", "-c", "sleep 300"],
      HostConfig: {
        NetworkMode: "none",
        Memory: 256 * 1024 * 1024,
        MemorySwap: 256 * 1024 * 1024,
        NanoCpus: 1000000000,
        PidsLimit: 64,
      },
    });
    await container.start();

    const pack = tar.pack();
    pack.entry({ name: langConfig.filename, mode: 0o777 }, code);
    pack.finalize();
    await container.putArchive(pack, { path: "/sandbox" });

    if (langConfig.compileCmd) {
      const cRes = await execInside(
        container,
        langConfig.compileCmd,
        null,
        10000
      );
      if (cRes.exitCode !== 0) {
        return testcases.map(() => ({
          stdout: "",
          stderr: cRes.stderr,
          error: "CE",
        }));
      }
    }

    for (const t of testcases) {
      const res = await execInside(
        container,
        langConfig.runCmd,
        t.input,
        timeoutMs
      );

      let error = null;
      if (res.timeout) error = "TLE";
      // Docker Exit Code 137 thường là OOM Killer (MLE)
      else if (res.exitCode === 137) error = "MLE";
      else if (res.exitCode !== 0) error = "RE";

      results.push({ stdout: res.stdout, stderr: res.stderr, error });
    }
  } catch (e) {
    throw e;
  } finally {
    if (container) await container.remove({ force: true }).catch(() => {});
  }
  return results;
}

async function execInside(container, cmd, stdin, timeoutMs) {
  const execObj = await container.exec({
    Cmd: cmd,
    AttachStdin: !!stdin,
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await execObj.start({ hijack: true, stdin: !!stdin });

  let stdout = "",
    stderr = "";
  const outStream = new Writable({
    write(chunk, _, cb) {
      stdout += chunk.toString();
      cb();
    },
  });
  const errStream = new Writable({
    write(chunk, _, cb) {
      stderr += chunk.toString();
      cb();
    },
  });

  container.modem.demuxStream(stream, outStream, errStream);

  if (stdin) {
    stream.write(stdin + "\n");
    stream.end();
  }

  let isTimeout = false;
  const result = await Promise.race([
    // Promise 1: Đợi lệnh chạy xong
    new Promise((resolve) => {
      stream.on("end", async () => {
        const inspect = await execObj.inspect();
        resolve({ exitCode: inspect.ExitCode });
      });
    }),
    // Promise 2: Đứt đuôi khi quá giờ
    new Promise((resolve) => {
      setTimeout(() => {
        isTimeout = true;
        stream.destroy();
        resolve({ exitCode: 124 }); // Mã lỗi timeout chuẩn Linux
      }, timeoutMs);
    }),
  ]);

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    exitCode: result.exitCode,
    timeout: isTimeout,
  };
}
