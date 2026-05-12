const fs = require("fs");

const BASE_URL = process.env.TARGET_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;

function normalizeJson(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(normalizeJson);
  }

  if (typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeJson(value[key]);
        return acc;
      }, {});
  }

  return value;
}

function deepEqual(a, b) {
  return JSON.stringify(normalizeJson(a)) === JSON.stringify(normalizeJson(b));
}

function getByPath(obj, jsonPath) {
  if (!jsonPath || jsonPath === "$") return obj;

  const clean = jsonPath.replace(/^\$\./, "");
  const parts = clean.split(".").filter(Boolean);

  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[p];
  }

  return cur;
}

function containsObject(actual, expected) {
  if (expected === null || typeof expected !== "object") {
    return actual === expected;
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    return expected.every((expectedItem, index) =>
      containsObject(actual[index], expectedItem)
    );
  }

  if (actual === null || typeof actual !== "object") return false;

  return Object.keys(expected).every((key) =>
    containsObject(actual[key], expected[key])
  );
}

function hasKeyDeep(obj, keyName) {
  if (obj === null || obj === undefined) return false;

  if (Array.isArray(obj)) {
    return obj.some((item) => hasKeyDeep(item, keyName));
  }

  if (typeof obj === "object") {
    if (Object.prototype.hasOwnProperty.call(obj, keyName)) return true;
    return Object.values(obj).some((value) => hasKeyDeep(value, keyName));
  }

  return false;
}

function replaceVariables(value, vars) {
  if (typeof value === "string") {
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      return vars[name] !== undefined ? String(vars[name]) : "";
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceVariables(item, vars));
  }

  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = replaceVariables(v, vars);
    }
    return out;
  }

  return value;
}

async function readResponseBody(res) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function assertResponse({ actualStatus, actualBody, step }) {
  const errors = [];

  if (actualStatus !== step.expected_status) {
    errors.push(`Expected status ${step.expected_status} but got ${actualStatus}`);
  }

  if (step.expected_json !== undefined && step.expected_json !== null) {
    if (!deepEqual(actualBody, step.expected_json)) {
      errors.push("Response JSON does not exactly match expected_json");
    }
  }

  const assertJson = step.assert_json || {};

  if (assertJson.jsonContains) {
    if (!containsObject(actualBody, assertJson.jsonContains)) {
      errors.push("Response JSON does not contain required fields");
    }
  }

  if (Array.isArray(assertJson.jsonNotContainsKeys)) {
    for (const key of assertJson.jsonNotContainsKeys) {
      if (hasKeyDeep(actualBody, key)) {
        errors.push(`Response JSON must not contain key: ${key}`);
      }
    }
  }

  if (assertJson.jsonPath) {
    for (const [path, expectedValue] of Object.entries(assertJson.jsonPath)) {
      const actualValue = getByPath(actualBody, path);
      if (!deepEqual(actualValue, expectedValue)) {
        errors.push(`JSON path ${path} expected ${JSON.stringify(expectedValue)} but got ${JSON.stringify(actualValue)}`);
      }
    }
  }

  return errors;
}

async function runStep(step, vars) {
  const headers = replaceVariables(step.headers_json || {}, vars);
  const body = replaceVariables(step.body_json, vars);

  const init = {
    method: step.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body !== undefined && body !== null && !["GET", "HEAD"].includes(init.method.toUpperCase())) {
    init.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  init.signal = controller.signal;

  try {
    const res = await fetch(BASE_URL + step.path, init);
    clearTimeout(timer);

    const actualBody = await readResponseBody(res);

    const errors = assertResponse({
      actualStatus: res.status,
      actualBody,
      step,
    });

    if (errors.length > 0) {
      return {
        ok: false,
        status: "WA",
        message: errors.join("; "),
        actualStatus: res.status,
        actualBody,
      };
    }

    if (step.save_variables && typeof step.save_variables === "object") {
      for (const [name, jsonPath] of Object.entries(step.save_variables)) {
        vars[name] = getByPath(actualBody, jsonPath);
      }
    }

    return {
      ok: true,
      status: "AC",
      actualStatus: res.status,
      actualBody,
    };
  } catch (err) {
    clearTimeout(timer);

    if (err.name === "AbortError") {
      return {
        ok: false,
        status: "TLE",
        message: "Request timeout",
      };
    }

    return {
      ok: false,
      status: "RE",
      message: err.message,
    };
  }
}

async function run() {
  const raw = fs.readFileSync("/sandbox/testcases.json", "utf8");
  const testcases = JSON.parse(raw);

  const results = [];

  for (const testcase of testcases) {
    const vars = {};
    const steps = testcase.steps || [];

    let earnedScore = 0;
    let maxScore = 0;
    let failedCount = 0;
    let passedCount = 0;
    const stepResults = [];

    if (!steps.length) {
      results.push({
        testcaseId: testcase.testcaseId,
        result: "IE",
        score: 0,
        maxScore: testcase.score || 0,
        message: "No API steps found",
        steps: []
      });
      continue;
    }

    for (const step of steps) {
      const stepScore = Number(step.score ?? 1);
      maxScore += stepScore;

      const stepResult = await runStep(step, vars);

      if (stepResult.ok) {
        earnedScore += stepScore;
        passedCount++;
      } else {
        failedCount++;
      }

      stepResults.push({
        stepId: step.stepId,
        name: step.name || step.path,
        result: stepResult.ok ? "AC" : stepResult.status,
        score: stepResult.ok ? stepScore : 0,
        maxScore: stepScore,
        message: stepResult.message || ""
      });
    }

    let result = "WA";

    if (passedCount === steps.length) {
      result = "AC";
    } else if (passedCount > 0) {
      result = "PARTIAL";
    } else if (stepResults.some(s => ["RE", "TLE"].includes(s.result))) {
      result = stepResults.find(s => ["RE", "TLE"].includes(s.result)).result;
    }

    results.push({
      testcaseId: testcase.testcaseId,
      result,
      score: earnedScore,
      maxScore,
      message: failedCount > 0
        ? `${passedCount}/${steps.length} steps passed`
        : "",
      steps: stepResults
    });
  }

  console.log("__API_TEST_RESULT_START__");
  console.log(JSON.stringify(results));
  console.log("__API_TEST_RESULT_END__");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});