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
        CapDrop: ["ALL"],
      },
    });
    await container.start();

    const pack = tar.pack();
    pack.entry({ name: langConfig.filename, mode: 0o777 }, code);
    if (langConfig.filename === "query.sql") {
      const t0 = testcases[0];
      pack.entry({ name: "schema.sql" }, t0.schema || "");
    }

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

      if (langConfig.filename === "query.sql") {
        const dataPack = tar.pack();
        dataPack.entry({ name: "data.sql" }, t.input ?? "");
        dataPack.finalize();

        await container.putArchive(dataPack, { path: "/sandbox" });
      }

      let stdinForRun = "";

      if (langConfig.filename === "query.sql") {
        stdinForRun = [
          "--EXPECTED_SQL_START--",
          t.expected_output ?? "",
          "--EXPECTED_SQL_END--"
        ].join("\n");
      }

      const res = await execInside(
        container,
        langConfig.runCmd,
        stdinForRun,
        timeoutMs
      );

      let error = null;
      if (res.timeout) error = "TLE";
      else if (res.exitCode === 137) error = "MLE";
      else if (res.exitCode !== 0) error = "RE";

      results.push({ stdout: res.stdout, stderr: res.stderr, error });
    }
  } catch (e) {
    throw e;
  } finally {
    if (container) await container.remove({ force: true }).catch(() => { });
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
  const MAX_OUTPUT = 1024 * 1024;

  const outStream = new Writable({
    write(chunk, _, cb) {
      if (stdout.length < MAX_OUTPUT) {
        const remaining = MAX_OUTPUT - stdout.length;
        stdout += chunk.toString().slice(0, remaining);
      }
      cb();
    },
  });
  const errStream = new Writable({
    write(chunk, _, cb) {
      if (stderr.length < MAX_OUTPUT) {
        const remaining = MAX_OUTPUT - stderr.length;
        stderr += chunk.toString().slice(0, remaining);
      }
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
        resolve({ exitCode: 124 });
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
