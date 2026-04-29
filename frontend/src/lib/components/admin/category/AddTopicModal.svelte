<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import type { Category } from "$lib/types/category.type";

    let {
        open = $bindable(false),
        category = null,
        onSave,
    }: {
        open: boolean;
        category: Category | null;
        onSave: () => Promise<void>;
    } = $props();

    let topicInputs = $state<{ name: string }[]>([{ name: "" }]);
    let modalError = $state("");
    let modalLoading = $state(false);

    function resetForm() {
        topicInputs = [{ name: "" }];
        modalError = "";
        modalLoading = false;
    }

    function closeModal() {
        open = false;
        resetForm();
    }

    function addTopicInputRow() {
        topicInputs = [...topicInputs, { name: "" }];
    }

    function removeTopicInputRow(index: number) {
        if (topicInputs.length === 1) {
            topicInputs = [{ name: "" }];
            return;
        }

        topicInputs = topicInputs.filter((_, i) => i !== index);
    }

    function updateTopicInput(index: number, value: string) {
        topicInputs[index].name = value;
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
            }))
            .filter((item) => item.name.length > 0);

        if (cleanedTopics.length === 0) {
            modalError = "Please enter at least one topic";
            return;
        }

        modalLoading = true;
        modalError = "";

        try {
            await Promise.all(
                cleanedTopics.map((topic) =>
                    adminTopicService.createTopic({
                        name: topic.name,
                        category_id: category.id,
                        description: "",
                    }),
                ),
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
    maxWidth="560px"
>
    <div class="modal-content">
        <p class="helper-text">
            Add one or more topics under this category. Empty rows will be
            ignored.
        </p>

        {#if modalError}
            <div class="error-message">
                {modalError}
            </div>
        {/if}

        <div class="form-group">
            <label for="topics">Topics</label>

            <div class="topic-input-list">
                {#each topicInputs as item, index}
                    <div class="topic-input-row">
                        <Input
                            id="topics"
                            value={item.name}
                            placeholder={`Topic ${index + 1}`}
                            oninput={(e: Event) =>
                                updateTopicInput(
                                    index,
                                    (e.currentTarget as HTMLInputElement).value,
                                )}
                        />

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
        gap: 16px;
    }

    .helper-text {
        margin: 0;
        color: #9ca3af;
        font-size: 14px;
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
        font-weight: 700;
    }

    .topic-input-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .topic-input-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 36px;
        gap: 10px;
        align-items: center;
    }

    .icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #111318;
        color: #cbd5e1;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
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
        font-weight: 700;
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

    @media (max-width: 560px) {
        .topic-input-row {
            grid-template-columns: minmax(0, 1fr) 34px;
        }
    }
</style>
