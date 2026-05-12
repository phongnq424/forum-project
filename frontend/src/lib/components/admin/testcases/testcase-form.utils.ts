import type {
    ApiTestcasePayload,
    ApiTestcaseStep,
} from "$lib/types/testcase.type";

export type StepJsonText = {
    headers_json: string;
    body_json: string;
    expected_json: string;
    assert_json: string;
    save_variables: string;
};

export type StepJsonTextMap = Record<number, StepJsonText>;

export const headerPlaceholder = '{"Authorization":"Bearer {{token}}"}';
export const bodyPlaceholder =
    '{"fullName":"Nguyen Van A","email":"a@example.com"}';
export const expectedPlaceholder = '{"success":true}';
export const assertPlaceholder =
    '{"jsonContains":{"success":true},"jsonNotContainsKeys":["password"]}';
export const saveVariablesPlaceholder = '{"userId":"$.data.id"}';

export function stringifyJson(value: unknown) {
    if (value === undefined || value === null) return "";
    return JSON.stringify(value, null, 2);
}

export function parseOptionalJson(text: string, fieldName: string) {
    const trimmed = text.trim();
    if (!trimmed) return null;

    try {
        return JSON.parse(trimmed);
    } catch {
        throw new Error(`${fieldName} must be valid JSON`);
    }
}

export function syncJsonTextFromSteps(steps: ApiTestcaseStep[]) {
    const next: StepJsonTextMap = {};

    steps.forEach((step, index) => {
        next[index] = {
            headers_json: stringifyJson(step.headers_json),
            body_json: stringifyJson(step.body_json),
            expected_json: stringifyJson(step.expected_json),
            assert_json: stringifyJson(step.assert_json),
            save_variables: stringifyJson(step.save_variables),
        };
    });

    return next;
}

export function buildApiTestcasePayload(
    form: ApiTestcasePayload,
    jsonTextByStep: StepJsonTextMap,
): ApiTestcasePayload {
    if (!form.name.trim()) {
        throw new Error("Testcase name is required");
    }

    if (!form.steps.length) {
        throw new Error("At least one step is required");
    }

    const steps = form.steps.map((step, index) => {
        if (!step.method) {
            throw new Error(`Step ${index + 1}: method is required`);
        }

        if (!step.path?.trim()) {
            throw new Error(`Step ${index + 1}: path is required`);
        }

        if (!step.expected_status) {
            throw new Error(`Step ${index + 1}: expected status is required`);
        }

        if (!step.score || Number(step.score) <= 0) {
            throw new Error(`Step ${index + 1}: score must be greater than 0`);
        }

        const jsonState = jsonTextByStep[index] ?? {
            headers_json: "",
            body_json: "",
            expected_json: "",
            assert_json: "",
            save_variables: "",
        };

        return {
            ...step,
            name: step.name?.trim() || `Step ${index + 1}`,
            order_index: index,
            path: step.path.trim(),
            expected_status: Number(step.expected_status),
            score: Number(step.score),
            headers_json: parseOptionalJson(
                jsonState.headers_json,
                `Step ${index + 1} headers_json`,
            ),
            body_json: parseOptionalJson(
                jsonState.body_json,
                `Step ${index + 1} body_json`,
            ),
            expected_json: parseOptionalJson(
                jsonState.expected_json,
                `Step ${index + 1} expected_json`,
            ),
            assert_json: parseOptionalJson(
                jsonState.assert_json,
                `Step ${index + 1} assert_json`,
            ),
            save_variables: parseOptionalJson(
                jsonState.save_variables,
                `Step ${index + 1} save_variables`,
            ),
        };
    });

    const totalScore = steps.reduce(
        (sum, step) => sum + Number(step.score || 0),
        0,
    );

    return {
        name: form.name.trim(),
        visibility: form.visibility,
        order_index: Number(form.order_index),
        score: totalScore,
        steps,
    };
}

export function createDefaultBackendForm(orderIndex = 0): ApiTestcasePayload {
    return {
        name: "",
        visibility: "HIDDEN",
        order_index: orderIndex,
        steps: [
            {
                name: "Health check",
                method: "GET",
                path: "/health",
                expected_status: 200,
                score: 10,
                assert_json: {
                    jsonContains: {
                        ok: true,
                    },
                },
            },
        ],
    };
}

export function createUserApiExample(orderIndex = 0): ApiTestcasePayload {
    return {
        name: "User API full flow",
        visibility: "HIDDEN",
        order_index: orderIndex,
        steps: [
            {
                name: "Health check",
                method: "GET",
                path: "/health",
                expected_status: 200,
                score: 10,
                assert_json: {
                    jsonContains: {
                        ok: true,
                    },
                },
            },
            {
                name: "Create user",
                method: "POST",
                path: "/api/users",
                expected_status: 201,
                score: 40,
                body_json: {
                    fullName: "Nguyen Van A",
                    email: "a@example.com",
                    password: "123456",
                },
                assert_json: {
                    jsonContains: {
                        success: true,
                        data: {
                            email: "a@example.com",
                        },
                    },
                    jsonNotContainsKeys: ["password"],
                },
            },
            {
                name: "Duplicate email",
                method: "POST",
                path: "/api/users",
                expected_status: 409,
                score: 50,
                body_json: {
                    fullName: "Nguyen Van B",
                    email: "a@example.com",
                    password: "abcdef",
                },
                assert_json: {
                    jsonContains: {
                        success: false,
                    },
                },
            },
        ],
    };
}