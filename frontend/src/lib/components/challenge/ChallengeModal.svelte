<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import type {
        Challenge,
        ChallengeDifficulty,
        ChallengePayload,
        ChallengeType,
    } from "$lib/types/challenge.type";

    let {
        open = $bindable(false),
        isEdit = false,
        challengeId = null,
        challenge = {},
        onSave,
    }: {
        open: boolean;
        isEdit: boolean;
        challengeId?: string | null;
        challenge: Partial<Challenge>;
        onSave: () => Promise<void>;
    } = $props();

    let modalError = $state("");
    let modalLoading = $state(false);
    let detailLoading = $state(false);

    let form = $state({
        title: "",
        description: "",
        input: "",
        output: "",
        constraints: "",
        time_limit: 1000,
        memory_limit: 256,
        point: 10,
        difficulty: "EASY" as ChallengeDifficulty,
        type: "DSA" as ChallengeType,
    });
    let testCaseFile = $state<File | null>(null);

    function handleTestCaseFileChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        testCaseFile = input.files?.[0] ?? null;
    }

    function fillForm(data: Partial<Challenge> = {}) {
        form = {
            title: data.title ?? "",
            description: data.description ?? "",
            input: data.input ?? "",
            output: data.output ?? "",
            constraints: data.constraints ?? "",
            time_limit: data.time_limit ?? 1000,
            memory_limit: data.memory_limit ?? 256,
            point: data.point ?? 10,
            difficulty: (data.difficulty ?? "EASY") as ChallengeDifficulty,
            type: (data.type ?? "DSA") as ChallengeType,
        };
    }

    function closeModal() {
        open = false;
        modalError = "";
        modalLoading = false;
        detailLoading = false;
    }

    $effect(() => {
        if (!open) return;

        modalError = "";

        if (isEdit && challengeId) {
            loadChallengeDetail(challengeId);
        } else {
            fillForm(challenge);
        }
    });

    async function loadChallengeDetail(id: string) {
        detailLoading = true;
        modalError = "";

        try {
            const detail = await challengeService.getById(id);
            fillForm(detail);
        } catch (e) {
            modalError = e instanceof Error ? e.message : String(e);
        } finally {
            detailLoading = false;
        }
    }

    function buildPayload(): ChallengePayload {
        return {
            title: form.title.trim(),
            description: form.description.trim(),
            input: form.input.trim(),
            output: form.output.trim(),
            constraints: form.constraints.trim(),
            time_limit: Number(form.time_limit),
            memory_limit: Number(form.memory_limit),
            point: Number(form.point),
            difficulty: form.difficulty,
            type: form.type,
        };
    }

    function validate(payload: ChallengePayload) {
        if (!payload.title) return "Title is required";

        if (payload.type === "BACKEND") {
            if (!payload.description) return "Description is required";
            if (!payload.input) return "API requirements are required";
            if (!payload.output) return "Expected behavior is required";
        } else {
            if (!payload.input) return "Input is required";
            if (!payload.output) return "Output is required";
        }

        if (!payload.constraints) return "Constraints are required";
        if (!payload.time_limit || payload.time_limit <= 0) {
            return "Time limit must be greater than 0";
        }
        if (!payload.memory_limit || payload.memory_limit <= 0) {
            return "Memory limit must be greater than 0";
        }
        if (!payload.point || payload.point <= 0) {
            return "Point must be greater than 0";
        }
        return "";
    }
    function buildFormData(payload: ChallengePayload) {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            formData.append(key, String(value ?? ""));
        });

        if (testCaseFile) {
            formData.append("testcaseZip", testCaseFile);
        }

        return formData;
    }

    async function handleSave() {
        const payload = buildPayload();
        const validationError = validate(payload);

        if (validationError) {
            modalError = validationError;
            return;
        }

        modalLoading = true;
        modalError = "";

        try {
            let savedChallenge: Challenge | { id?: string };

            if (isEdit && challengeId) {
                savedChallenge = await challengeService.updateChallenge(
                    challengeId,
                    payload,
                );

                if (testCaseFile && payload.type !== "BACKEND") {
                    await challengeService.uploadTestcaseZip(
                        challengeId,
                        testCaseFile,
                    );
                }
            } else {
                savedChallenge =
                    await challengeService.createChallenge(payload);

                const newChallengeId = savedChallenge.id;

                if (
                    testCaseFile &&
                    newChallengeId &&
                    payload.type !== "BACKEND"
                ) {
                    await challengeService.uploadTestcaseZip(
                        newChallengeId,
                        testCaseFile,
                    );
                }
            }

            open = false;
            await onSave();
        } catch (e) {
            modalError = e instanceof Error ? e.message : String(e);
        } finally {
            modalLoading = false;
        }
    }
</script>

<Modal
    bind:open
    title={isEdit ? "Edit Challenge" : "Create Challenge"}
    maxWidth="860px"
>
    <div class="modal-content">
        {#if detailLoading}
            <div class="loading-box">Loading challenge detail...</div>
        {:else}
            <p class="helper-text">
                Manage coding challenge content, scoring, difficulty and
                execution limits.
            </p>

            {#if modalError}
                <div class="error-message">{modalError}</div>
            {/if}

            <div class="form-group">
                <label for="title">Title *</label>
                <Input
                    id="title"
                    bind:value={form.title}
                    placeholder="Enter challenge title"
                />
            </div>

            <div class="grid-2">
                <div class="form-group">
                    <label for="type">Type *</label>
                    <select id="type" bind:value={form.type}>
                        <option value="DSA">DSA</option>
                        <option value="SQL">SQL</option>
                        <option value="BACKEND">Backend</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="difficulty">Difficulty *</label>
                    <select id="difficulty" bind:value={form.difficulty}>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea
                    id="description"
                    bind:value={form.description}
                    rows="4"
                    placeholder="Describe the challenge"
                ></textarea>
            </div>

            <div class="grid-2">
                <div class="form-group">
                    <label for="input">Input *</label>
                    <textarea
                        id="input"
                        bind:value={form.input}
                        rows="4"
                        placeholder="Input format / sample input"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="output">Output *</label>
                    <textarea
                        id="output"
                        bind:value={form.output}
                        rows="4"
                        placeholder="Output format / sample output"
                    ></textarea>
                </div>
            </div>

            <div class="form-group">
                <label for="constraints">Constraints *</label>
                <textarea
                    id="constraints"
                    bind:value={form.constraints}
                    rows="3"
                    placeholder="Enter constraints"
                ></textarea>
            </div>
            {#if form.type !== "BACKEND"}
                <div class="form-group">
                    <label for="testcase-file">Testcase ZIP</label>
                    <input
                        id="testcase-file"
                        type="file"
                        accept=".zip,application/zip,application/x-zip-compressed"
                        onchange={handleTestCaseFileChange}
                    />

                    {#if testCaseFile}
                        <p class="file-name">{testCaseFile.name}</p>
                    {:else if isEdit}
                        <p class="helper-text">
                            Leave empty to keep existing testcase file.
                        </p>
                    {/if}
                </div>
            {:else}
                <div class="backend-testcase-note">
                    Backend challenges use API step testcases. Create the
                    challenge first, then add API testcase steps from the
                    testcase manager.
                </div>
            {/if}
            <div class="grid-3">
                <div class="form-group">
                    <label for="time-limit">Time limit *</label>
                    <Input
                        id="time-limit"
                        bind:value={form.time_limit}
                        type="number"
                        min="1"
                    />
                </div>

                <div class="form-group">
                    <label for="memory-limit">Memory limit *</label>
                    <Input
                        id="memory-limit"
                        bind:value={form.memory_limit}
                        type="number"
                        min="1"
                    />
                </div>

                <div class="form-group">
                    <label for="point">Point *</label>
                    <Input
                        id="point"
                        bind:value={form.point}
                        type="number"
                        min="1"
                    />
                </div>
            </div>
        {/if}
    </div>

    {#snippet footer()}
        <div class="modal-footer">
            <Button
                variant="secondary"
                disabled={modalLoading}
                onclick={closeModal}
            >
                Cancel
            </Button>

            <Button
                variant="primary"
                disabled={modalLoading}
                onclick={handleSave}
            >
                {modalLoading
                    ? isEdit
                        ? "Updating..."
                        : "Creating..."
                    : isEdit
                      ? "Update"
                      : "Create"}
            </Button>
        </div>
    {/snippet}
</Modal>

<style>
    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .helper-text {
        margin: 0;
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.5;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    label {
        color: #d1d5db;
        font-size: 14px;
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

    select:focus,
    textarea:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }

    textarea {
        resize: vertical;
        min-height: 92px;
    }

    .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }

    .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }

    .error-message {
        color: #fca5a5;
        font-size: 14px;
        background: rgba(239, 68, 68, 0.12);
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        width: 100%;
    }

    @media (max-width: 768px) {
        .grid-2,
        .grid-3 {
            grid-template-columns: 1fr;
        }

        .modal-footer {
            flex-direction: column-reverse;
        }
    }
</style>
