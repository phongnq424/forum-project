// src/lib/types/testcase.type.ts

export type TestcaseVisibility = "PUBLIC" | "HIDDEN";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiAssertJson = {
    jsonContains?: unknown;
    jsonNotContainsKeys?: string[];
    jsonPath?: Record<string, unknown>;
};

export type ApiTestcaseStep = {
    id?: string;
    stepId?: string;
    name?: string;
    order_index?: number;
    method: HttpMethod;
    path: string;
    headers_json?: Record<string, unknown> | null;
    body_json?: unknown;
    expected_status: number;
    expected_json?: unknown;
    expected_headers_json?: Record<string, unknown> | null;
    assert_json?: ApiAssertJson | null;
    save_variables?: Record<string, string> | null;
    score?: number;
};

export type ApiTestcasePayload = {
    name: string;
    score?: number;
    visibility: TestcaseVisibility;
    order_index: number;
    input_json?: unknown;
    expected_json?: unknown;
    steps: ApiTestcaseStep[];
};

export type ApiTestcase = {
    id: string;
    challenge_id: string;
    name: string;
    score: number;
    visibility: TestcaseVisibility;
    order_index: number;
    input_json?: unknown;
    expected_json?: unknown;
    input_path?: string | null;
    expected_output_path?: string | null;
    schema_path?: string | null;
    steps?: ApiTestcaseStep[];
};