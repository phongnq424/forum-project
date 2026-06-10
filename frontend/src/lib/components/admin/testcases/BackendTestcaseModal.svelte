<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Select, {
        type SelectOption,
    } from "$lib/components/ui/Select.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import type {
        ApiTestcasePayload,
        ApiTestcaseStep,
    } from "$lib/types/testcase.type";
    import BackendStepEditor from "./BackendStepEditor.svelte";
    import type {
        StepJsonText,
        StepJsonTextMap,
    } from "../../../utils/testcase-form.utils";
    import {
        buildApiTestcasePayload,
        createDefaultBackendForm,
        createUserApiExample,
        syncJsonTextFromSteps,
    } from "../../../utils/testcase-form.utils";

    const initialForm = createDefaultBackendForm();

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

    let form = $state<ApiTestcasePayload>(initialForm);
    let jsonTextByStep = $state<StepJsonTextMap>(
        syncJsonTextFromSteps(initialForm.steps),
    );

    const visibilityOptions: SelectOption[] = [
        { value: "HIDDEN", label: "Hidden" },
        { value: "PUBLIC", label: "Public" },
    ];

    function createEmptyJsonText(): StepJsonText {
        return {
            headers_json: "",
            body_json: "",
            expected_json: "",
            assert_json: "",
            save_variables: "",
        };
    }

    $effect(() => {
        if (!open) return;

        const nextForm = createDefaultBackendForm();

        form = nextForm;
        jsonTextByStep = syncJsonTextFromSteps(nextForm.steps);
        modalError = "";
        modalLoading = false;
    });

    function getStepJsonText(index: number): StepJsonText {
        return jsonTextByStep[index] ?? createEmptyJsonText();
    }

    function addStep() {
        const nextIndex = form.steps.length;

        const nextStep: ApiTestcaseStep = {
            name: `Step ${nextIndex + 1}`,
            method: "GET",
            path: "/",
            expected_status: 200,
            score: 1,
            assert_json: null,
        };

        form.steps = [...form.steps, nextStep];

        jsonTextByStep = {
            ...jsonTextByStep,
            [nextIndex]: createEmptyJsonText(),
        };
    }

    function removeStep(index: number) {
        if (form.steps.length <= 1) {
            modalError = "A testcase must have at least one step";
            return;
        }

        const nextSteps = form.steps.filter((_, i) => i !== index);
        const nextJsonTextByStep: StepJsonTextMap = {};

        nextSteps.forEach((_, nextIndex) => {
            const oldIndex = nextIndex >= index ? nextIndex + 1 : nextIndex;

            nextJsonTextByStep[nextIndex] =
                jsonTextByStep[oldIndex] ?? createEmptyJsonText();
        });

        form.steps = nextSteps;
        jsonTextByStep = nextJsonTextByStep;
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
                ...(jsonTextByStep[index] ?? createEmptyJsonText()),
                [key]: value,
            },
        };
    }

    function useExample() {
        const exampleForm = createUserApiExample();

        form = exampleForm;
        jsonTextByStep = syncJsonTextFromSteps(exampleForm.steps);
        modalError = "";
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
    <div class="adm-modal-content lg-gap">
        {#if modalError}
            <div class="adm-alert-error">{modalError}</div>
        {/if}

        <div class="adm-backend-modal-grid">
            <div class="adm-form-group">
                <label class="adm-label" for="name">Testcase name *</label>
                <Input
                    id="name"
                    bind:value={form.name}
                    placeholder="User API full flow"
                />
            </div>

            <div class="adm-form-group">
                <Select
                    label="Visibility"
                    bind:value={form.visibility}
                    options={visibilityOptions}
                    placement="auto"
                />
            </div>

            <div class="adm-form-group">
                <label class="adm-label" for="order">Order</label>
                <Input
                    id="order"
                    type="number"
                    min="0"
                    bind:value={form.order_index}
                />
            </div>
        </div>

        <div class="adm-backend-modal-actions">
            <Button variant="secondary" size="sm" onclick={useExample}>
                Use user API example
            </Button>

            <Button variant="secondary" size="sm" onclick={addStep}>
                <Icon name="plus" size={14} />
                Add step
            </Button>
        </div>

        <div class="adm-steps-editor">
            {#each form.steps as step, index}
                <BackendStepEditor
                    {step}
                    {index}
                    jsonText={getStepJsonText(index)}
                    onUpdate={updateStep}
                    onJsonUpdate={updateJsonText}
                    onRemove={removeStep}
                />
            {/each}
        </div>
    </div>

    {#snippet footer()}
        <div class="adm-modal-footer">
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
