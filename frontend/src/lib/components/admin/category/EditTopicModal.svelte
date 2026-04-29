<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import type { Topic } from "$lib/types/topic.type";

    let {
        open = $bindable(false),
        topic = {},
        onSave,
    }: {
        open: boolean;
        topic: Partial<Topic>;
        onSave: () => Promise<void>;
    } = $props();

    let modalError = $state("");
    let modalLoading = $state(false);

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

        modalLoading = true;
        modalError = "";

        try {
            await adminTopicService.updateTopic(topic.id, {
                name,
                category_id: topic.category_id,
                description,
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

<Modal bind:open title="Edit Topic" maxWidth="520px">
    <div class="modal-content">
        {#if modalError}
            <div class="error-message">
                {modalError}
            </div>
        {/if}

        <div class="form-group">
            <label for="topic-name">Topic Name *</label>
            <Input
                id="topic-name"
                bind:value={topic.name}
                placeholder="Enter topic name"
            />
        </div>

        <div class="form-group">
            <label for="topic-description">Description</label>
            <textarea
                id="topic-description"
                bind:value={topic.description}
                placeholder="Enter topic description"
                rows="3"
            ></textarea>
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
                onclick={handleSaveEditTopic}
            >
                {modalLoading ? "Saving..." : "Save"}
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

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label {
        color: #d1d5db;
        font-size: 14px;
        font-weight: 700;
    }

    textarea {
        width: 100%;
        min-height: 90px;
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

    textarea:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
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
</style>
