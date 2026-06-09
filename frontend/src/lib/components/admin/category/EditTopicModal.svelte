<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import type { Topic } from "$lib/types/topic.type";

    let {
        open = $bindable(false),
        topic = {},
        topics = [],
        onSave,
    }: {
        open: boolean;
        topic: Partial<Topic>;
        topics?: Topic[];
        onSave: () => Promise<void>;
    } = $props();

    let modalError = $state("");
    let modalLoading = $state(false);
    let parentId = $state<string>("");

    type FlatTopic = Topic & { level: number };

    function flattenTopics(items: Topic[], level = 0): FlatTopic[] {
        return items.flatMap((item) => [
            { ...item, level },
            ...flattenTopics(item.children ?? [], level + 1),
        ]);
    }

    function collectDescendantIds(item: Topic | undefined): Set<string> {
        const result = new Set<string>();

        function walk(node?: Topic) {
            if (!node) return;

            for (const child of node.children ?? []) {
                result.add(child.id);
                walk(child);
            }
        }

        walk(item);
        return result;
    }

    function findTopic(items: Topic[], id?: string): Topic | undefined {
        if (!id) return undefined;

        for (const item of items) {
            if (item.id === id) return item;

            const found = findTopic(item.children ?? [], id);
            if (found) return found;
        }

        return undefined;
    }

    let currentTopicNode = $derived(findTopic(topics ?? [], topic.id));
    let blockedParentIds = $derived(collectDescendantIds(currentTopicNode));
    let flatTopics = $derived(flattenTopics(topics ?? []));

    $effect(() => {
        if (!open) return;
        parentId = topic.parent_id ?? "";
        modalError = "";
        modalLoading = false;
    });

    function closeModal() {
        open = false;
        modalError = "";
        modalLoading = false;
    }

    async function handleSaveEditTopic() {
        if (!topic.id) {
            modalError = "Invalid topic";
            return;
        }

        const name = topic.name?.trim();
        const description = topic.description?.trim() ?? "";

        if (!name) {
            modalError = "Topic name is required";
            return;
        }

        if (parentId === topic.id) {
            modalError = "Topic cannot be parent of itself";
            return;
        }

        if (blockedParentIds.has(parentId)) {
            modalError = "Cannot move topic under its own child";
            return;
        }

        modalLoading = true;
        modalError = "";

        try {
            await adminTopicService.updateTopic(topic.id, {
                name,
                category_id: topic.category_id,
                description,
                parent_id: parentId || null,
            });

            open = false;
            await onSave();
        } catch (e) {
            modalError = e instanceof Error ? e.message : String(e);
        } finally {
            modalLoading = false;
        }
    }
</script>

<Modal bind:open title="Edit Topic" maxWidth="620px">
    <div class="adm-modal-content">
        <div class="adm-helper-card">
            <div class="adm-helper-icon">
                <Icon name="folder" size={18} />
            </div>

            <div>
                <p class="adm-helper-title">Reorganize topic hierarchy</p>
                <p class="adm-helper-text">
                    Move this topic between root level and nested branches.
                    Child topics will move together with it.
                </p>
            </div>
        </div>

        {#if modalError}
            <div class="adm-alert-error">{modalError}</div>
        {/if}

        <div class="adm-form-group">
            <label class="adm-label" for="topic-name"> Topic Name * </label>

            <Input
                id="topic-name"
                bind:value={topic.name}
                placeholder="Enter topic name"
            />
        </div>

        <div class="adm-form-group">
            <label class="adm-label" for="parent-topic"> Parent topic </label>

            <select class="adm-select" id="parent-topic" bind:value={parentId}>
                <option value="">Root topic</option>

                {#each flatTopics as item}
                    {#if item.id !== topic.id && !blockedParentIds.has(item.id)}
                        <option value={item.id}>
                            {"— ".repeat(item.level)}{item.name}
                        </option>
                    {/if}
                {/each}
            </select>
        </div>

        <div class="adm-form-group">
            <label class="adm-label" for="topic-description">
                Description
            </label>

            <textarea
                class="adm-textarea"
                id="topic-description"
                bind:value={topic.description}
                placeholder="Enter topic description"
                rows="3"
            ></textarea>
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
                onclick={handleSaveEditTopic}
            >
                {modalLoading ? "Saving..." : "Save"}
            </Button>
        </div>
    {/snippet}
</Modal>

<style>
    select,
    textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        padding: 12px 14px;
        background: #14161c;
        color: #e5e7eb;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        outline: none;
    }

    select:focus,
    textarea:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }
</style>
