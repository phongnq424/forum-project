<script lang="ts">
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { postService } from "$lib/services/post.service";

    let {
        open = $bindable(false),
        postId,
        onDeleted = () => {},
    } = $props<{
        open: boolean;
        postId: string;
        onDeleted?: () => void;
    }>();

    let loading = $state(false);
    let error = $state("");

    async function confirmDelete() {
        if (!postId) return;

        error = "";
        loading = true;

        try {
            await postService.deletePost(postId);
            open = false;
            onDeleted();
        } catch (e: any) {
            error = e?.response?.data?.message || "Delete failed.";
        } finally {
            loading = false;
        }
    }
</script>

<Modal bind:open title="Delete post" maxWidth="480px">
    <div class="content">
        <p>
            Are you sure you want to delete this post?
            <br />
            This action cannot be undone.
        </p>

        {#if error}
            <div class="error">{error}</div>
        {/if}
    </div>

    <div class="actions">
        <Button
            variant="ghost"
            onclick={() => (open = false)}
            disabled={loading}
        >
            Cancel
        </Button>

        <Button variant="danger" onclick={confirmDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
        </Button>
    </div>
</Modal>

<style>
    .content {
        padding: 6px 0;
    }

    .error {
        color: #f87171;
        margin-top: 8px;
        font-size: 14px;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
    }
</style>
