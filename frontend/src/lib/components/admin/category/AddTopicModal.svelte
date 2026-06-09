<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import TextArea from "$lib/components/ui/TextArea.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import type { Category } from "$lib/types/category.type";
    import type { Topic } from "$lib/types/topic.type";

    type SelectOption = {
        value: string;
        label: string;
        disabled?: boolean;
    };

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

    let parentOptions = $derived<SelectOption[]>([
        {
            value: "",
            label: "Root topic",
        },
        ...flatTopics.map((topic) => ({
            value: topic.id,
            label: `${"— ".repeat(topic.level)}${topic.name}`,
        })),
    ]);

    $effect(() => {
        if (!open) return;

        parentId = defaultParentId ?? "";
        modalError = "";
        modalLoading = false;
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
    <div class="adm-modal-content lg-gap">
        <div class="adm-helper-card">
            <div class="adm-helper-icon">
                <Icon name="folder" size={18} />
            </div>

            <div>
                <p class="adm-helper-title">
                    Create structured learning topics
                </p>

                <p class="adm-helper-text">
                    Choose a parent topic to create a nested topic tree. Leave
                    parent empty to create root-level topics.
                </p>
            </div>
        </div>

        {#if modalError}
            <div class="adm-alert-error">{modalError}</div>
        {/if}

        <Select
            bind:value={parentId}
            label="Parent topic"
            placeholder="Root topic"
            options={parentOptions}
            disabled={modalLoading}
        />

        <div class="adm-form-group">
            <label class="adm-label">Topics</label>

            <div class="topic-input-list">
                {#each topicInputs as item, index}
                    <div class="topic-input-row">
                        <div class="topic-input-main">
                            <Input
                                id={`topic-name-${index}`}
                                value={item.name}
                                placeholder={`Topic ${index + 1}`}
                                oninput={(e: Event) =>
                                    updateTopicName(
                                        index,
                                        (e.currentTarget as HTMLInputElement)
                                            .value,
                                    )}
                            />

                            <TextArea
                                id={`topic-description-${index}`}
                                value={item.description}
                                placeholder="Short description"
                                rows="2"
                                oninput={(e: Event) =>
                                    updateTopicDescription(
                                        index,
                                        (e.currentTarget as HTMLTextAreaElement)
                                            .value,
                                    )}
                            />
                        </div>

                        <button
                            type="button"
                            class="adm-icon-btn md danger"
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
                class="adm-text-btn"
                disabled={modalLoading}
                onclick={addTopicInputRow}
            >
                <Icon name="plus" size={14} />
                Add row
            </button>
        </div>
    </div>

    {#snippet footer()}
        <div class="adm-modal-footer">
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
        border: 1px solid var(--adm-border);
        background: var(--adm-surface-subtle);
        border-radius: var(--adm-radius-xl);
    }

    .topic-input-main {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
</style>
