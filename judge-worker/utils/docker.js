import Docker from "dockerode";
import tar from "tar-stream";
import { Writable } from "stream";

const docker = new Docker();

const DEFAULT_MEMORY_MB = Number(process.env.SANDBOX_MEMORY_MB || 256);
const DEFAULT_CPU_NANO = Number(process.env.SANDBOX_CPU_NANO || 1000000000);
const DEFAULT_PIDS_LIMIT = Number(process.env.SANDBOX_PIDS_LIMIT || 64);
const DEFAULT_MAX_OUTPUT = Number(process.env.SANDBOX_MAX_OUTPUT || 1024 * 1024);

export async function runInSandbox(
  langConfig,
  code,
  testcases,
  timeoutMs = 2000,
  options = {}
) {
  const memoryMb = Number(options.memory_limit || DEFAULT_MEMORY_MB);
  let container = null;

  try {
    container = await docker.createContainer({
      Image: langConfig.image,
      WorkingDir: "/sandbox",
      User: "judgeuser",
      Cmd: ["sh", "-c", "sleep 300"],
      Env: [
        "PORT=3000",
        "NODE_ENV=test",
      ],
      HostConfig: {
        NetworkMode: "none",
        Memory: memoryMb * 1024 * 1024,
        MemorySwap: memoryMb * 1024 * 1024,
        NanoCpus: DEFAULT_CPU_NANO,
        PidsLimit: DEFAULT_PIDS_LIMIT,
        CapDrop: ["ALL"],
        SecurityOpt: ["no-new-privileges:true"],
      },
    });

    await container.start();

    if (langConfig.type === "node_api") {
      return await runNodeApiSandbox(container, langConfig, code, testcases, timeoutMs);
    }

    return await runStdioOrSqlSandbox(container, langConfig, code, testcases, timeoutMs);
  } finally {
    if (container) {
      await container.remove({ force: true }).catch(() => { });
    }
  }
}

async function runStdioOrSqlSandbox(container, langConfig, code, testcases, timeoutMs) {
  const results = [];

  const pack = tar.pack();

  pack.entry(
    {
      name: langConfig.filename,
      mode: 0o644,
    },
    code || ""
  );

  if (langConfig.type === "sql") {
    const t0 = testcases[0];
    pack.entry({ name: "schema.sql", mode: 0o644 }, t0.schema || "");
  }

  pack.finalize();

  await container.putArchive(pack, { path: "/sandbox" });

  if (langConfig.compileCmd) {
    const cRes = await execInside(container, langConfig.compileCmd, null, 10000);

    if (cRes.exitCode !== 0) {
      return testcases.map(() => ({
        stdout: "",
        stderr: cRes.stderr,
        error: "CE",
      }));
    }
  }

  for (const t of testcases) {
    if (langConfig.type === "sql") {
      const dataPack = tar.pack();
      dataPack.entry({ name: "data.sql", mode: 0o644 }, t.input || "");
      dataPack.finalize();

      await container.putArchive(dataPack, { path: "/sandbox" });
    }

    let stdinForRun = "";

    if (langConfig.type === "sql") {
      stdinForRun = [
        "--EXPECTED_SQL_START--",
        t.expected_output || "",
        "--EXPECTED_SQL_END--",
      ].join("\n");
    } else {
      stdinForRun = t.input || "";
    }

    const res = await execInside(
      container,
      langConfig.runCmd,
      stdinForRun,
      timeoutMs
    );

    results.push({
      stdout: res.stdout,
      stderr: res.stderr,
      error: mapExecError(res),
      exitCode: res.exitCode,
    });
  }

  return results;
}

async function runNodeApiSandbox(container, langConfig, code, testcases, timeoutMs) {
  const pack = tar.pack();

  pack.entry(
    {
      name: "app.js",
      mode: 0o644,
    },
    code || ""
  );

  pack.entry(
    {
      name: "testcases.json",
      mode: 0o644,
    },
    JSON.stringify(testcases)
  );

  pack.finalize();

  await container.putArchive(pack, { path: "/sandbox" });

  const res = await execInside(
    container,
    langConfig.runCmd,
    null,
    timeoutMs
  );

  if (res.timeout) {
    return testcases.map((t) => ({
      stdout: "",
      stderr: res.stderr,
      error: "TLE",
      apiResult: {
        testcaseId: t.testcaseId,
        result: "TLE",
        score: 0,
        maxScore: t.score || 0,
        message: "Backend API judging timeout",
      },
    }));
  }

  if (res.exitCode === 137) {
    return testcases.map((t) => ({
      stdout: res.stdout,
      stderr: res.stderr,
      error: "MLE",
      apiResult: {
        testcaseId: t.testcaseId,
        result: "MLE",
        score: 0,
        maxScore: t.score || 0,
        message: "Memory limit exceeded",
      },
    }));
  }

  if (res.exitCode !== 0) {
    return testcases.map((t) => ({
      stdout: res.stdout,
      stderr: res.stderr,
      error: "RE",
      apiResult: {
        testcaseId: t.testcaseId,
        result: "RE",
        score: 0,
        maxScore: t.score || 0,
        message: extractShortError(res.stdout, res.stderr),
      },
    }));
  }

  const json = res.stdout
    .split("__API_TEST_RESULT_START__")[1]
    ?.split("__API_TEST_RESULT_END__")[0]
    ?.trim();

  if (!json) {
    return testcases.map((t) => ({
      stdout: res.stdout,
      stderr: res.stderr,
      error: "IE",
      apiResult: {
        testcaseId: t.testcaseId,
        result: "IE",
        score: 0,
        maxScore: t.score || 0,
        message: "Cannot parse API test result",
      },
    }));
  }

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    return testcases.map((t) => ({
      stdout: res.stdout,
      stderr: res.stderr,
      error: "IE",
      apiResult: {
        testcaseId: t.testcaseId,
        result: "IE",
        score: 0,
        maxScore: t.score || 0,
        message: "Invalid API test result JSON",
      },
    }));
  }

  return testcases.map((t) => {
    const item = parsed.find((x) => x.testcaseId === t.testcaseId) || {
      testcaseId: t.testcaseId,
      result: "IE",
      score: 0,
      maxScore: t.score || 0,
      message: "Missing testcase result",
    };

    return {
      stdout: JSON.stringify(item),
      stderr: "",
      error: item.result === "AC" ? null : item.result,
      apiResult: item,
    };
  });
}

function mapExecError(res) {
  if (res.timeout) return "TLE";
  if (res.exitCode === 137) return "MLE";
  if (res.exitCode !== 0) return "RE";
  return null;
}

function extractShortError(stdout, stderr) {
  const msg = `${stderr || ""}\n${stdout || ""}`.trim();
  if (!msg) return "Runtime error";
  return msg.slice(0, 1000);
}

async function execInside(container, cmd, stdin, timeoutMs) {
  const execObj = await container.exec({
    Cmd: cmd,
    AttachStdin: !!stdin,
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await execObj.start({
    hijack: true,
    stdin: !!stdin,
  });

  let stdout = "";
  let stderr = "";

  const outStream = new Writable({
    write(chunk, _, cb) {
      if (stdout.length < DEFAULT_MAX_OUTPUT) {
        const remaining = DEFAULT_MAX_OUTPUT - stdout.length;
        stdout += chunk.toString().slice(0, remaining);
      }
      cb();
    },
  });

  const errStream = new Writable({
    write(chunk, _, cb) {
      if (stderr.length < DEFAULT_MAX_OUTPUT) {
        const remaining = DEFAULT_MAX_OUTPUT - stderr.length;
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
    new Promise((resolve) => {
      stream.on("end", async () => {
        const inspect = await execObj.inspect();
        resolve({ exitCode: inspect.ExitCode });
      });

      stream.on("error", async () => {
        resolve({ exitCode: 1 });
      });
    }),

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