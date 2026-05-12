<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import type { ApiTestcaseStep, HttpMethod } from "$lib/types/testcase.type";
    import type { StepJsonText } from "./testcase-form.utils";
    import {
        headerPlaceholder,
        bodyPlaceholder,
        expectedPlaceholder,
        assertPlaceholder,
        saveVariablesPlaceholder,
    } from "./testcase-form.utils";

    let {
        step,
        index,
        jsonText,
        onUpdate,
        onJsonUpdate,
        onRemove,
    }: {
        step: ApiTestcaseStep;
        index: number;
        jsonText: StepJsonText;
        onUpdate: (index: number, patch: Partial<ApiTestcaseStep>) => void;
        onJsonUpdate: (
            index: number,
            key: keyof StepJsonText,
            value: string,
        ) => void;
        onRemove: (index: number) => void;
    } = $props();
</script>

<section class="step-editor">
    <div class="step-header">
        <h3>Step {index + 1}</h3>
        <Button variant="ghost" size="sm" onclick={() => onRemove(index)}>
            Remove
        </Button>
    </div>

    <div class="form-grid step-basic">
        <div class="form-group">
            <label for="step-name-{index}">Name</label>
            <Input
                id="step-name-{index}"
                value={step.name}
                placeholder="Create user"
                oninput={(e) =>
                    onUpdate(index, {
                        name: (e.currentTarget as HTMLInputElement).value,
                    })}
            />
        </div>

        <div class="form-group">
            <label for="step-method-{index}">Method</label>
            <select
                id="step-method-{index}"
                value={step.method}
                onchange={(e) =>
                    onUpdate(index, {
                        method: (e.currentTarget as HTMLSelectElement)
                            .value as HttpMethod,
                    })}
            >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
            </select>
        </div>

        <div class="form-group wide">
            <label for="step-path-{index}">Path *</label>
            <Input
                id="step-path-{index}"
                value={step.path}
                placeholder="/api/users"
                oninput={(e) =>
                    onUpdate(index, {
                        path: (e.currentTarget as HTMLInputElement).value,
                    })}
            />
        </div>

        <div class="form-group">
            <label for="step-expected-status-{index}">
                Expected status *
            </label>
            <Input
                id="step-expected-status-{index}"
                type="number"
                value={step.expected_status}
                oninput={(e) =>
                    onUpdate(index, {
                        expected_status: Number(
                            (e.currentTarget as HTMLInputElement).value,
                        ),
                    })}
            />
        </div>

        <div class="form-group">
            <label for="step-score-{index}">Score *</label>
            <Input
                id="step-score-{index}"
                type="number"
                min="1"
                value={step.score}
                oninput={(e) =>
                    onUpdate(index, {
                        score: Number(
                            (e.currentTarget as HTMLInputElement).value,
                        ),
                    })}
            />
        </div>
    </div>

    <div class="json-grid">
        <div class="form-group">
            <label for="step-headers-json-{index}">headers_json</label>
            <textarea
                id="step-headers-json-{index}"
                value={jsonText.headers_json}
                rows="4"
                placeholder={headerPlaceholder}
                oninput={(e) =>
                    onJsonUpdate(
                        index,
                        "headers_json",
                        (e.currentTarget as HTMLTextAreaElement).value,
                    )}
            ></textarea>
        </div>

        <div class="form-group">
            <label for="step-body-json-{index}">body_json</label>
            <textarea
                id="step-body-json-{index}"
                value={jsonText.body_json}
                rows="4"
                placeholder={bodyPlaceholder}
                oninput={(e) =>
                    onJsonUpdate(
                        index,
                        "body_json",
                        (e.currentTarget as HTMLTextAreaElement).value,
                    )}
            ></textarea>
        </div>

        <div class="form-group">
            <label for="step-expected-json-{index}">expected_json</label>
            <textarea
                id="step-expected-json-{index}"
                value={jsonText.expected_json}
                rows="4"
                placeholder={expectedPlaceholder}
                oninput={(e) =>
                    onJsonUpdate(
                        index,
                        "expected_json",
                        (e.currentTarget as HTMLTextAreaElement).value,
                    )}
            ></textarea>
        </div>

        <div class="form-group">
            <label for="step-assert-json-{index}">assert_json</label>
            <textarea
                id="step-assert-json-{index}"
                value={jsonText.assert_json}
                rows="6"
                placeholder={assertPlaceholder}
                oninput={(e) =>
                    onJsonUpdate(
                        index,
                        "assert_json",
                        (e.currentTarget as HTMLTextAreaElement).value,
                    )}
            ></textarea>
        </div>

        <div class="form-group full">
            <label for="step-save-variables-{index}">save_variables</label>
            <textarea
                id="step-save-variables-{index}"
                value={jsonText.save_variables}
                rows="3"
                placeholder={saveVariablesPlaceholder}
                oninput={(e) =>
                    onJsonUpdate(
                        index,
                        "save_variables",
                        (e.currentTarget as HTMLTextAreaElement).value,
                    )}
            ></textarea>
        </div>
    </div>
</section>

<style>
    .step-editor {
        border: 1px solid #2a2e36;
        background: #181b22;
        border-radius: 16px;
        padding: 16px;
    }

    .step-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
    }

    .step-header h3 {
        margin: 0;
        color: #f3f4f6;
        font-size: 16px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 130px 1.3fr 150px 120px;
        gap: 14px;
        margin-bottom: 14px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group.wide {
        grid-column: span 2;
    }

    .form-group.full {
        grid-column: 1 / -1;
    }

    label {
        color: #d1d5db;
        font-size: 13px;
        font-weight: 700;
    }

    select,
    textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        padding: 12px 14px;
        background: #14161c;
        color: #e5e7eb;
        font: inherit;
        outline: none;
    }

    textarea {
        resize: vertical;
        min-height: 92px;
        font-family: "Fira Code", monospace;
        font-size: 13px;
    }

    select:focus,
    textarea:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }

    .json-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }

    @media (max-width: 900px) {
        .form-grid,
        .json-grid {
            grid-template-columns: 1fr;
        }

        .form-group.wide,
        .form-group.full {
            grid-column: auto;
        }
    }
</style>
