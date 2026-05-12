<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import type {
        ApiTestcasePayload,
        ApiTestcaseStep,
    } from "$lib/types/testcase.type";
    import BackendStepEditor from "./BackendStepEditor.svelte";
    import type { StepJsonTextMap } from "./testcase-form.utils";
    import {
        buildApiTestcasePayload,
        createDefaultBackendForm,
        createUserApiExample,
        syncJsonTextFromSteps,
    } from "./testcase-form.utils";

    let {
        open = $bindable(false),
        challengeId,
        onReload,
    }: {
        open: boolean;
        challengeId: string;
        onReload: () => Promise<void>;
    } = $props();

    let modalLoading = $state(false);
    let modalError = $state("");

    let form = $state<ApiTestcasePayload>(createDefaultBackendForm());
    let jsonTextByStep = $state<StepJsonTextMap>({});

    $effect(() => {
        if (!open) return;

        form = createDefaultBackendForm();
        jsonTextByStep = syncJsonTextFromSteps(form.steps);
        modalError = "";
        modalLoading = false;
    });

    function addStep() {
        form.steps = [
            ...form.steps,
            {
                name: `Step ${form.steps.length + 1}`,
                method: "GET",
                path: "/",
                expected_status: 200,
                score: 1,
                assert_json: null,
            },
        ];

        jsonTextByStep = syncJsonTextFromSteps(form.steps);
    }

    function removeStep(index: number) {
        if (form.steps.length <= 1) {
            modalError = "A testcase must have at least one step";
            return;
        }

        form.steps = form.steps.filter((_, i) => i !== index);
        jsonTextByStep = syncJsonTextFromSteps(form.steps);
    }

    function updateStep(index: number, patch: Partial<ApiTestcaseStep>) {
        form.steps = form.steps.map((step, i) =>
            i === index ? { ...step, ...patch } : step,
        );
    }

    function updateJsonText(
        index: number,
        key: keyof StepJsonTextMap[number],
        value: string,
    ) {
        jsonTextByStep = {
            ...jsonTextByStep,
            [index]: {
                ...jsonTextByStep[index],
                [key]: value,
            },
        };
    }

    function useExample() {
        form = createUserApiExample();
        jsonTextByStep = syncJsonTextFromSteps(form.steps);
    }

    async function createTestcase() {
        modalLoading = true;
        modalError = "";

        try {
            const payload = buildApiTestcasePayload(form, jsonTextByStep);

            await challengeService.createApiTestcase(challengeId, payload);

            open = false;
            await onReload();
        } catch (e) {
            modalError = e instanceof Error ? e.message : String(e);
        } finally {
            modalLoading = false;
        }
    }
</script>

<Modal bind:open title="Create Backend API Testcase" maxWidth="980px">
    <div class="modal-content">
        {#if modalError}
            <div class="error-message">{modalError}</div>
        {/if}

        <div class="form-grid">
            <div class="form-group">
                <label for="name">Testcase name *</label>
                <Input
                    id="name"
                    bind:value={form.name}
                    placeholder="User API full flow"
                />
            </div>

            <div class="form-group">
                <label for="visibility">Visibility</label>
                <select id="visibility" bind:value={form.visibility}>
                    <option value="HIDDEN">Hidden</option>
                    <option value="PUBLIC">Public</option>
                </select>
            </div>

            <div class="form-group">
                <label for="order">Order</label>
                <Input
                    id="order"
                    type="number"
                    min="0"
                    bind:value={form.order_index}
                />
            </div>
        </div>

        <div class="actions-row">
            <Button variant="secondary" size="sm" onclick={useExample}>
                Use user API example
            </Button>

            <Button variant="secondary" size="sm" onclick={addStep}>
                <Icon name="plus" size={14} />
                Add step
            </Button>
        </div>

        <div class="steps-editor">
            {#each form.steps as step, index}
                <BackendStepEditor
                    {step}
                    {index}
                    jsonText={jsonTextByStep[index]}
                    onUpdate={updateStep}
                    onJsonUpdate={updateJsonText}
                    onRemove={removeStep}
                />
            {/each}
        </div>
    </div>

    {#snippet footer()}
        <div class="modal-footer">
            <Button
                variant="secondary"
                disabled={modalLoading}
                onclick={() => (open = false)}
            >
                Cancel
            </Button>

            <Button
                variant="primary"
                disabled={modalLoading}
                onclick={createTestcase}
            >
                {modalLoading ? "Creating..." : "Create Testcase"}
            </Button>
        </div>
    {/snippet}
</Modal>

<style>
    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .error-message {
        color: #fca5a5;
        font-size: 14px;
        background: rgba(239, 68, 68, 0.12);
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 180px 140px;
        gap: 14px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    label {
        color: #d1d5db;
        font-size: 13px;
        font-weight: 700;
    }

    select {
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

    select:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }

    .actions-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
    }

    .steps-editor {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        width: 100%;
    }

    @media (max-width: 900px) {
        .form-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
