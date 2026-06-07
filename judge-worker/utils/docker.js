import Docker from "dockerode";
import tar from "tar-stream";
import { Writable } from "stream";

const docker = new Docker();

const DEFAULT_MEMORY_MB = Number(process.env.SANDBOX_MEMORY_MB || 1024);
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
  if (langConfig.type === "node_api") {
    return await runNodeApiSandbox(null, langConfig, code, testcases, timeoutMs);
  }

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

async function runNodeApiSandbox(containerIgnored, langConfig, code, testcases, timeoutMs) {
  const networkName = `judge-node-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  let network = null;
  let submissionContainer = null;
  let runnerContainer = null;

  try {
    network = await docker.createNetwork({
      Name: networkName,
      Driver: "bridge",
      Internal: true,
      CheckDuplicate: true,
    });

    // 1. Container chạy server của thí sinh, chỉ có app.js
    submissionContainer = await docker.createContainer({
      Image: langConfig.image,
      WorkingDir: "/sandbox",
      User: "judgeuser",
      Cmd: langConfig.runCmd,
      Env: [
        "PORT=3000",
        "NODE_ENV=test",
      ],
      HostConfig: {
        NetworkMode: networkName,
        Memory: DEFAULT_MEMORY_MB * 1024 * 1024,
        MemorySwap: DEFAULT_MEMORY_MB * 1024 * 1024,
        NanoCpus: DEFAULT_CPU_NANO,
        PidsLimit: DEFAULT_PIDS_LIMIT,
        CapDrop: ["ALL"],
        SecurityOpt: ["no-new-privileges:true"],
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [networkName]: {
            Aliases: ["submission"],
          },
        },
      },
    });

    const appPack = tar.pack();

    appPack.entry(
      {
        name: "app.js",
        mode: 0o644,
      },
      code || ""
    );

    appPack.finalize();

    await submissionContainer.putArchive(appPack, { path: "/sandbox" });
    await submissionContainer.start();

    // 2. Container runner giữ testcase và gọi HTTP sang submission
    runnerContainer = await docker.createContainer({
      Image: langConfig.image,
      WorkingDir: "/sandbox",
      User: "judgeuser",
      Cmd: ["sh", "-c", "sleep 300"],
      Env: [
        "TARGET_URL=http://submission:3000",
        "NODE_ENV=test",
      ],
      HostConfig: {
        NetworkMode: networkName,
        Memory: 128 * 1024 * 1024,
        MemorySwap: 128 * 1024 * 1024,
        NanoCpus: DEFAULT_CPU_NANO,
        PidsLimit: DEFAULT_PIDS_LIMIT,
        CapDrop: ["ALL"],
        SecurityOpt: ["no-new-privileges:true"],
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [networkName]: {
            Aliases: ["runner"],
          },
        },
      },
    });

    const runnerPack = tar.pack();

    runnerPack.entry(
      {
        name: "testcases.json",
        mode: 0o644,
      },
      JSON.stringify(testcases)
    );

    runnerPack.finalize();

    await runnerContainer.putArchive(runnerPack, { path: "/sandbox" });
    await runnerContainer.start();

    // 3. Check /health từ runner container
    const health = await execInside(
      runnerContainer,
      [
        "sh",
        "-c",
        `
i=0
while [ "$i" -lt 10 ]; do
  if curl -s http://submission:3000/health >/dev/null 2>&1; then
    echo "__HEALTH_OK__"
    exit 0
  fi
  i=$((i + 1))
  sleep 0.5
done
echo "__HEALTH_FAILED__"
exit 1
`.trim(),
      ],
      null,
      6000
    );

    if (health.exitCode !== 0) {
      return testcases.map((t) => ({
        stdout: health.stdout,
        stderr: health.stderr,
        error: "RE",
        apiResult: {
          testcaseId: t.testcaseId,
          result: "RE",
          score: 0,
          maxScore: t.score || 0,
          message: "Server did not start or /health failed",
        },
      }));
    }

    // 4. Chạy test runner bằng exec, không waitContainer sleep container
    const runnerRes = await execInside(
      runnerContainer,
      ["node", "/runner/api-test-runner.cjs"],
      null,
      timeoutMs
    );

    if (runnerRes.timeout) {
      return testcases.map((t) => ({
        stdout: runnerRes.stdout,
        stderr: runnerRes.stderr,
        error: "TLE",
        apiResult: {
          testcaseId: t.testcaseId,
          result: "TLE",
          score: 0,
          maxScore: t.score || 0,
          message: "API runner timeout",
        },
      }));
    }

    if (runnerRes.exitCode === 137) {
      return testcases.map((t) => ({
        stdout: runnerRes.stdout,
        stderr: runnerRes.stderr,
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

    if (runnerRes.exitCode !== 0) {
      return testcases.map((t) => ({
        stdout: runnerRes.stdout,
        stderr: runnerRes.stderr,
        error: "RE",
        apiResult: {
          testcaseId: t.testcaseId,
          result: "RE",
          score: 0,
          maxScore: t.score || 0,
          message: extractShortError(runnerRes.stdout, runnerRes.stderr),
        },
      }));
    }

    return parseNodeApiRunnerOutput(
      runnerRes.stdout,
      runnerRes.stderr,
      testcases
    );
  } finally {
    if (runnerContainer) {
      await runnerContainer.remove({ force: true }).catch(() => { });
    }

    if (submissionContainer) {
      await submissionContainer.remove({ force: true }).catch(() => { });
    }

    if (network) {
      await network.remove().catch(() => { });
    }
  }
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

async function waitContainer(container, timeoutMs) {
  let timeoutHandle;

  const timeoutPromise = new Promise((resolve) => {
    timeoutHandle = setTimeout(() => {
      resolve({
        timeout: true,
        statusCode: 124,
      });
    }, timeoutMs);
  });

  const waitPromise = container.wait().then((data) => ({
    timeout: false,
    statusCode: data.StatusCode,
  }));

  const result = await Promise.race([waitPromise, timeoutPromise]);

  clearTimeout(timeoutHandle);

  if (result.timeout) {
    await container.kill().catch(() => { });
  }

  return result;
}

async function getContainerLogs(container) {
  const stream = await container.logs({
    stdout: true,
    stderr: true,
    follow: false,
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

  docker.modem.demuxStream(stream, outStream, errStream);

  await new Promise((resolve) => {
    outStream.on("finish", resolve);
    errStream.on("finish", resolve);
    setTimeout(resolve, 1000);
  });

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

function parseNodeApiRunnerOutput(stdout, stderr, testcases) {
  const json = stdout
    .split("__API_TEST_RESULT_START__")[1]
    ?.split("__API_TEST_RESULT_END__")[0]
    ?.trim();

  if (!json) {
    return testcases.map((t) => ({
      stdout,
      stderr,
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
      stdout,
      stderr,
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