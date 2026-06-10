<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Select, {
        type SelectOption,
    } from "$lib/components/ui/Select.svelte";
    import FileInput from "$lib/components/ui/FileInput.svelte";
    import ErrorBox from "$lib/components/ui/ErrorMessage.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import { adminTopicService } from "$lib/services/topic.service";
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
    let topicOptions = $state<{ id: string; name: string }[]>([]);
    let selectedTopicIds = $state<string[]>([]);

    const typeOptions: SelectOption[] = [
        { value: "DSA", label: "DSA" },
        { value: "SQL", label: "SQL" },
        { value: "BACKEND", label: "Backend" },
    ];

    const difficultyOptions: SelectOption[] = [
        { value: "EASY", label: "Easy" },
        { value: "MEDIUM", label: "Medium" },
        { value: "HARD", label: "Hard" },
    ];

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

        selectedTopicIds = data.topics?.map((topic) => topic.id) ?? [];
        testCaseFile = null;
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
        testCaseFile = null;
        loadTopics();

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

    async function loadTopics() {
        try {
            const result = await adminTopicService.listTopics({
                page: 1,
                limit: 100,
            });

            topicOptions = result.data ?? [];
        } catch (e) {
            topicOptions = [];
        }
    }

    function toggleTopic(topicId: string, checked: boolean) {
        if (checked) {
            selectedTopicIds = selectedTopicIds.includes(topicId)
                ? selectedTopicIds
                : [...selectedTopicIds, topicId];
            return;
        }

        selectedTopicIds = selectedTopicIds.filter((id) => id !== topicId);
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
            topicIds: selectedTopicIds,
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

        if (payload.topicIds && payload.topicIds.length === 0) {
            return "At least one topic is required";
        }

        return "";
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
            <Loading message="Loading challenge detail..." size="sm" />
        {:else}
            <p class="helper-text">
                Manage coding challenge content, scoring, difficulty and
                execution limits.
            </p>

            <div class="form-group">
                <Input
                    id="title"
                    label="Title *"
                    bind:value={form.title}
                    placeholder="Enter challenge title"
                />
            </div>

            <div class="grid-2">
                <div class="form-group">
                    <Select
                        label="Type *"
                        bind:value={form.type}
                        options={typeOptions}
                        placement="auto"
                    />
                </div>

                <div class="form-group">
                    <Select
                        label="Difficulty *"
                        bind:value={form.difficulty}
                        options={difficultyOptions}
                        placement="auto"
                    />
                </div>
            </div>

            <div class="form-group">
                <label for="topics">Topics *</label>

                <div class="topic-grid">
                    {#each topicOptions as topic}
                        <label class="topic-option">
                            <input
                                type="checkbox"
                                value={topic.id}
                                checked={selectedTopicIds.includes(topic.id)}
                                onchange={(e) =>
                                    toggleTopic(
                                        topic.id,
                                        (e.currentTarget as HTMLInputElement)
                                            .checked,
                                    )}
                            />
                            <span>{topic.name}</span>
                        </label>
                    {/each}
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
                    <label for="input">
                        {form.type === "BACKEND"
                            ? "API requirements *"
                            : "Input *"}
                    </label>
                    <textarea
                        id="input"
                        bind:value={form.input}
                        rows="4"
                        placeholder={form.type === "BACKEND"
                            ? "Describe API requirements"
                            : "Input format / sample input"}
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="output">
                        {form.type === "BACKEND"
                            ? "Expected behavior *"
                            : "Output *"}
                    </label>
                    <textarea
                        id="output"
                        bind:value={form.output}
                        rows="4"
                        placeholder={form.type === "BACKEND"
                            ? "Describe expected API behavior"
                            : "Output format / sample output"}
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
                    <FileInput
                        id="testcase-file"
                        label="Testcase ZIP"
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
                    <Input
                        id="time-limit"
                        label="Time limit *"
                        bind:value={form.time_limit}
                        type="number"
                        min="1"
                    />
                </div>

                <div class="form-group">
                    <Input
                        id="memory-limit"
                        label="Memory limit *"
                        bind:value={form.memory_limit}
                        type="number"
                        min="1"
                    />
                </div>

                <div class="form-group">
                    <Input
                        id="point"
                        label="Point *"
                        bind:value={form.point}
                        type="number"
                        min="1"
                    />
                </div>
            </div>
            <ErrorBox error={modalError} compact />
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
        color: var(--ui-text-muted);
        font-size: 14px;
        line-height: 1.5;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group > label {
        color: var(--ui-text-muted);
        font-size: 13px;
        font-weight: 500;
    }

    textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--ui-border);
        border-radius: var(--ui-radius-lg);
        padding: 12px 14px;
        background: var(--ui-surface-raised);
        color: var(--ui-text);
        font: inherit;
        outline: none;
        resize: vertical;
        min-height: 92px;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease,
            color 0.2s ease;
    }

    textarea::placeholder {
        color: var(--ui-text-soft);
    }

    textarea:focus {
        border-color: var(--ui-primary);
        box-shadow: 0 0 0 3px var(--ui-primary-focus);
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

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        width: 100%;
    }

    .topic-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .topic-option {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        border: 1px solid var(--ui-border);
        border-radius: 999px;
        background: var(--ui-surface-raised);
        color: var(--ui-text);
        font-size: 13px;
        cursor: pointer;
        transition:
            border-color 0.2s ease,
            background-color 0.2s ease,
            color 0.2s ease;
    }

    .topic-option:hover {
        border-color: var(--ui-primary-border);
        background: var(--ui-surface-hover);
        color: var(--ui-text-strong);
    }

    .topic-option input {
        accent-color: var(--ui-primary);
    }

    .file-name {
        margin: 0;
        color: var(--ui-text);
        font-size: 13px;
        word-break: break-word;
    }

    .backend-testcase-note {
        padding: 12px 14px;
        border-radius: var(--ui-radius-lg);
        background: var(--ui-primary-soft);
        border: 1px solid var(--ui-primary-border);
        color: var(--ui-text);
        font-size: 14px;
        line-height: 1.5;
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
