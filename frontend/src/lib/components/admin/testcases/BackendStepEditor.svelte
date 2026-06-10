<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import type { ApiTestcaseStep, HttpMethod } from "$lib/types/testcase.type";
    import type { StepJsonText } from "../../../utils/testcase-form.utils";
    import {
        headerPlaceholder,
        bodyPlaceholder,
        expectedPlaceholder,
        assertPlaceholder,
        saveVariablesPlaceholder,
    } from "../../../utils/testcase-form.utils";

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
        jsonText?: StepJsonText;
        onUpdate: (index: number, patch: Partial<ApiTestcaseStep>) => void;
        onJsonUpdate: (
            index: number,
            key: keyof StepJsonText,
            value: string,
        ) => void;
        onRemove: (index: number) => void;
    } = $props();
</script>

<section class="adm-step-editor">
    <div class="adm-backend-step-header">
        <h3 class="adm-title-sm">Step {index + 1}</h3>
        <Button variant="ghost" size="sm" onclick={() => onRemove(index)}>
            Remove
        </Button>
    </div>

    <div class="adm-backend-step-basic-grid">
        <div class="adm-form-group">
            <label class="adm-label" for="step-name-{index}">Name</label>
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

        <div class="adm-form-group">
            <label class="adm-label" for="step-method-{index}">Method</label>
            <select
                class="adm-select"
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

        <div class="adm-form-group adm-backend-step-wide">
            <label class="adm-label" for="step-path-{index}">Path *</label>
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

        <div class="adm-form-group">
            <label class="adm-label" for="step-expected-status-{index}">
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

        <div class="adm-form-group">
            <label class="adm-label" for="step-score-{index}">Score *</label>
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

    <div class="adm-backend-json-grid">
        <div class="adm-form-group">
            <label class="adm-label" for="step-headers-json-{index}">
                headers_json
            </label>
            <textarea
                class="adm-textarea code"
                id="step-headers-json-{index}"
                value={jsonText?.headers_json ?? ""}
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

        <div class="adm-form-group">
            <label class="adm-label" for="step-body-json-{index}">
                body_json
            </label>
            <textarea
                class="adm-textarea code"
                id="step-body-json-{index}"
                value={jsonText?.body_json ?? ""}
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

        <div class="adm-form-group">
            <label class="adm-label" for="step-expected-json-{index}">
                expected_json
            </label>
            <textarea
                class="adm-textarea code"
                id="step-expected-json-{index}"
                value={jsonText?.expected_json ?? ""}
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

        <div class="adm-form-group">
            <label class="adm-label" for="step-assert-json-{index}">
                assert_json
            </label>
            <textarea
                class="adm-textarea code"
                id="step-assert-json-{index}"
                value={jsonText?.assert_json ?? ""}
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

        <div class="adm-form-group adm-backend-step-full">
            <label class="adm-label" for="step-save-variables-{index}">
                save_variables
            </label>
            <textarea
                class="adm-textarea code"
                id="step-save-variables-{index}"
                value={jsonText?.save_variables ?? ""}
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
