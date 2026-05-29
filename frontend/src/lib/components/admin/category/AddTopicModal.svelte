<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import type { Category } from "$lib/types/category.type";
    import type { Topic } from "$lib/types/topic.type";

    let {
        open = $bindable(false),
        category = null,
        topics = [],
        defaultParentId = null,
        onSave,
    }: {
        open: boolean;
        category: Category | null;
        topics?: Topic[];
        defaultParentId?: string | null;
        onSave: () => Promise<void>;
    } = $props();

    let topicInputs = $state<{ name: string; description: string }[]>([
        { name: "", description: "" },
    ]);

    let parentId = $state<string>("");
    let modalError = $state("");
    let modalLoading = $state(false);

    type FlatTopic = Topic & { level: number };

    function flattenTopics(items: Topic[], level = 0): FlatTopic[] {
        return items.flatMap((item) => [
            { ...item, level },
            ...flattenTopics(item.children ?? [], level + 1),
        ]);
    }

    let flatTopics = $derived(flattenTopics(topics ?? []));

    $effect(() => {
        if (!open) return;
        parentId = defaultParentId ?? "";
    });

    function resetForm() {
        topicInputs = [{ name: "", description: "" }];
        parentId = defaultParentId ?? "";
        modalError = "";
        modalLoading = false;
    }

    function closeModal() {
        open = false;
        resetForm();
    }

    function addTopicInputRow() {
        topicInputs = [...topicInputs, { name: "", description: "" }];
    }

    function removeTopicInputRow(index: number) {
        if (topicInputs.length === 1) {
            topicInputs = [{ name: "", description: "" }];
            return;
        }

        topicInputs = topicInputs.filter((_, i) => i !== index);
    }

    function updateTopicName(index: number, value: string) {
        topicInputs[index].name = value;
        topicInputs = [...topicInputs];
    }

    function updateTopicDescription(index: number, value: string) {
        topicInputs[index].description = value;
        topicInputs = [...topicInputs];
    }

    async function handleSaveTopics() {
        if (!category) {
            modalError = "No category selected";
            return;
        }

        const cleanedTopics = topicInputs
            .map((item) => ({
                name: item.name.trim(),
                description: item.description.trim(),
            }))
            .filter((item) => item.name.length > 0);

        if (cleanedTopics.length === 0) {
            modalError = "Please enter at least one topic";
            return;
        }

        modalLoading = true;
        modalError = "";

        try {
            await adminTopicService.createTopics(
                cleanedTopics.map((topic) => ({
                    name: topic.name,
                    category_id: category.id,
                    description: topic.description,
                    parent_id: parentId || null,
                })),
            );

            open = false;
            resetForm();
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
    title={`Add topics${category?.name ? ` to ${category.name}` : ""}`}
    maxWidth="680px"
>
    <div class="modal-content">
        <div class="helper-card">
            <div class="helper-icon">
                <Icon name="folder" size={18} />
            </div>
            <div>
                <p class="helper-title">Create structured learning topics</p>
                <p class="helper-text">
                    Choose a parent topic to create a nested topic tree. Leave
                    parent empty to create root-level topics.
                </p>
            </div>
        </div>

        {#if modalError}
            <div class="error-message">{modalError}</div>
        {/if}

        <div class="form-group">
            <label for="parent-topic">Parent topic</label>
            <select id="parent-topic" bind:value={parentId}>
                <option value="">Root topic</option>
                {#each flatTopics as topic}
                    <option value={topic.id}>
                        {"— ".repeat(topic.level)}{topic.name}
                    </option>
                {/each}
            </select>
        </div>

        <div class="form-group">
            <label for="topics">Topics</label>

            <div class="topic-input-list">
                {#each topicInputs as item, index}
                    <div class="topic-input-row">
                        <div class="topic-input-main">
                            <Input
                                id="topics"
                                value={item.name}
                                placeholder={`Topic ${index + 1}`}
                                oninput={(e: Event) =>
                                    updateTopicName(
                                        index,
                                        (e.currentTarget as HTMLInputElement)
                                            .value,
                                    )}
                            />

                            <textarea
                                value={item.description}
                                placeholder="Short description"
                                rows="2"
                                oninput={(e: Event) =>
                                    updateTopicDescription(
                                        index,
                                        (e.currentTarget as HTMLTextAreaElement)
                                            .value,
                                    )}
                            ></textarea>
                        </div>

                        <button
                            type="button"
                            class="icon-button danger"
                            aria-label="Remove topic row"
                            title="Remove row"
                            disabled={modalLoading}
                            onclick={() => removeTopicInputRow(index)}
                        >
                            <Icon name="trash" size={15} />
                        </button>
                    </div>
                {/each}
            </div>

            <button
                type="button"
                class="add-row-button"
                disabled={modalLoading}
                onclick={addTopicInputRow}
            >
                <Icon name="plus" size={14} />
                Add row
            </button>
        </div>
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
                onclick={handleSaveTopics}
            >
                {modalLoading ? "Saving..." : "Save all"}
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

    .helper-card {
        display: flex;
        gap: 12px;
        padding: 14px;
        border-radius: 16px;
        background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.14),
            rgba(139, 92, 246, 0.08)
        );
        border: 1px solid rgba(139, 92, 246, 0.24);
    }

    .helper-icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: rgba(99, 102, 241, 0.16);
        color: #c4b5fd;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .helper-title {
        margin: 0 0 4px;
        color: #f3f4f6;
        font-weight: 800;
        font-size: 14px;
    }

    .helper-text {
        margin: 0;
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.5;
    }

    .error-message {
        color: #fca5a5;
        font-size: 14px;
        background: rgba(239, 68, 68, 0.12);
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .form-group label {
        color: #d1d5db;
        font-size: 14px;
        font-weight: 800;
    }

    select,
    textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        padding: 11px 13px;
        background: #111318;
        color: #e5e7eb;
        font-family: inherit;
        outline: none;
    }

    select:focus,
    textarea:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }

    textarea {
        resize: vertical;
        min-height: 66px;
    }

    .topic-input-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .topic-input-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 38px;
        gap: 10px;
        align-items: start;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background: #14171f;
        border-radius: 16px;
    }

    .topic-input-main {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #111318;
        color: #cbd5e1;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .icon-button:hover:not(:disabled) {
        background: rgba(139, 92, 246, 0.14);
        border-color: rgba(139, 92, 246, 0.32);
        color: #ffffff;
    }

    .icon-button.danger:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.16);
        border-color: rgba(239, 68, 68, 0.3);
        color: #fca5a5;
    }

    .icon-button:disabled,
    .add-row-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .add-row-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        width: fit-content;
        border: none;
        background: transparent;
        color: #a78bfa;
        padding: 0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 800;
    }

    .add-row-button:hover:not(:disabled) {
        color: #c4b5fd;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        width: 100%;
    }
</style>
