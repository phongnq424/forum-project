<script lang="ts">
    import { onMount } from "svelte";
    import { commentService } from "$lib/services/comment.service";
    import { formatDistanceToNow } from "date-fns";
    import type {
        Comment,
        CreateCommentRequest,
    } from "$lib/types/comment.type";

    import Icon from "$lib/components/ui/Icon.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import TextArea from "../ui/TextArea.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    // --- Props ---
    let { postId } = $props<{ postId: string }>();

    // --- State (Runes) ---
    let comments = $state<Comment[]>([]);
    let newCommentText = $state("");
    let loading = $state(true);
    let sending = $state(false);

    // Trạng thái cho chức năng Reply
    let replyingToId = $state<string | null>(null);
    let replyText = $state("");

    // --- Logic ---
    async function fetchComments() {
        loading = true;
        try {
            comments = (await commentService.getCommentsByPost(postId)) || [];
        } catch (e) {
            console.error("Error fetching comments:", e);
        } finally {
            loading = false;
        }
    }

    async function handleSubmit(parentId: string | null = null) {
        const detail = parentId ? replyText : newCommentText;
        if (!detail.trim() || sending) return;

        sending = true;
        try {
            const payload: CreateCommentRequest = {
                postId,
                comment_detail: detail,
                parent_id: parentId,
            };
            const res = await commentService.createComment(payload);

            if (parentId) {
                // Thêm comment mới vào danh sách con của parent
                updateTree(comments, parentId, res);
                replyingToId = null;
                replyText = "";
            } else {
                comments = [res, ...comments];
                newCommentText = "";
            }
        } catch (e) {
            console.error("Failed to post comment:", e);
        } finally {
            sending = false;
        }
    }

    // Hàm đệ quy để cập nhật comment mới vào đúng cha của nó trong UI
    function updateTree(
        list: Comment[],
        parentId: string,
        newComment: Comment,
    ) {
        for (let item of list) {
            if (item.id === parentId) {
                item.childComments = [
                    newComment,
                    ...(item.childComments || []),
                ];
                return true;
            }
            if (item.childComments?.length > 0) {
                if (updateTree(item.childComments, parentId, newComment))
                    return true;
            }
        }
        return false;
    }

    onMount(fetchComments);
</script>

{#snippet commentItem(comment: Comment, isChild = false)}
    <div class="comment-item" class:child-item={isChild}>
        <img
            src={comment.User?.avatar || "/default-avatar.png"}
            alt="Avatar"
            class="comm-avatar"
            style={isChild ? "width: 32px; height: 32px;" : ""}
        />

        <div class="comm-content">
            <div class="comm-header">
                <span class="comm-user"
                    >{comment.User?.username || "Anonymous"}</span
                >
                <span class="comm-time">
                    • {formatDistanceToNow(new Date(comment.created_at))} ago
                </span>
            </div>

            <p class="comm-text">{comment.comment_detail}</p>

            <div class="comm-actions">
                <button class="action-btn-tiny"
                    ><Icon name="heart" size={14} /> Like</button
                >
                <button
                    class="action-btn-tiny"
                    onclick={() =>
                        (replyingToId =
                            replyingToId === comment.id ? null : comment.id)}
                >
                    <Icon name="reply" size={14} /> Reply
                </button>
            </div>

            {#if replyingToId === comment.id}
                <div class="reply-input-box">
                    <TextArea
                        bind:value={replyText}
                        placeholder="Write a reply..."
                        rows="2"
                    />
                    <div class="reply-actions">
                        <Button
                            variant="ghost"
                            size="sm"
                            onclick={() => (replyingToId = null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onclick={() => handleSubmit(comment.id)}
                            disabled={sending || !replyText.trim()}
                        >
                            {sending ? "Sending..." : "Reply"}
                        </Button>
                    </div>
                </div>
            {/if}

            {#if comment.childComments && comment.childComments.length > 0}
                <div class="child-comments-wrapper">
                    {#each comment.childComments as child (child.id)}
                        {@render commentItem(child, true)}
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{/snippet}

<section class="comments-section">
    <div class="section-header">
        <h3>Discussion</h3>
        <Badge color="default" size="sm">
            {comments.length}
            {comments.length === 1 ? "Conversation" : "Conversations"}
        </Badge>
    </div>

    <TextArea
        bind:value={newCommentText}
        placeholder="What are your thoughts?"
        rows="3"
        disabled={sending}
    />
    <div class="input-footer">
        <Button
            variant="primary"
            size="md"
            onclick={() => handleSubmit(null)}
            disabled={!newCommentText.trim() || sending}
        >
            {#if sending}
                <Icon name="loader" size={16} class="animate-spin" />
                Posting...
            {:else}
                Post Comment
            {/if}
        </Button>
    </div>

    <div class="comments-list">
        {#if loading}
            <div class="status-msg">
                <div class="spinner"></div>
                <p>Loading discussions...</p>
            </div>
        {:else if comments.length === 0}
            <div class="status-msg empty">
                <Icon name="message-square" size={40} color="#374151" />
                <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
        {:else}
            {#each comments as comment (comment.id)}
                {@render commentItem(comment)}
            {/each}
        {/if}
    </div>
</section>

<style>
    .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
    }

    .section-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0;
        color: #f3f4f6;
    }

    .input-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #1f2937;
    }

    /* Danh sách comment */
    .comment-item {
        display: flex;
        gap: 14px;
        margin-bottom: 24px;
    }

    .comm-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        background: #374151;
        flex-shrink: 0;
    }

    .comm-content {
        flex: 1;
    }

    .comm-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
    }

    .comm-user {
        font-weight: 600;
        color: #f9fafb;
        font-size: 0.95rem;
    }

    .comm-time {
        font-size: 0.8rem;
        color: #6b7280;
    }

    .comm-text {
        color: #d1d5db;
        line-height: 1.6;
        margin: 4px 0 10px 0;
        font-size: 0.95rem;
    }

    /* Nút action (Like, Reply) */
    .comm-actions {
        display: flex;
        gap: 16px;
    }
    /* Khung bao quanh toàn bộ section để tạo khoảng cách với bài viết trên */
    .comments-section {
        margin-top: 64px;
        padding-top: 32px;
        border-top: 1px solid #2a2e36;
    }

    /* Container danh sách comment */
    .comments-list {
        display: flex;
        flex-direction: column;
        gap: 32px; /* Khoảng cách giữa các comment cha */
        margin-top: 32px;
    }

    /* Style cho ô Reply lồng bên trong comment */
    .reply-input-box {
        margin: 16px 0;
        padding: 16px;
        background: #111827; /* Đậm hơn nền chính để tách biệt */
        border: 1px solid #2a2e36;
        border-radius: 12px;
    }

    .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #1f2937;
    }

    /* Phân cấp comment con */
    .child-comments-wrapper {
        margin-top: 20px;
        padding-left: 20px;
        border-left: 2px solid #2a2e36; /* Đường kẻ đứng bên trái */
        display: flex;
        flex-direction: column;
        gap: 20px; /* Khoảng cách giữa các comment con với nhau */
    }

    /* Trạng thái empty khi chưa có comment */
    .status-msg.empty {
        background: #111827;
        border-radius: 16px;
        border: 1px dashed #2a2e36;
        padding: 48px;
    }

    .action-btn-tiny {
        background: transparent;
        border: none;
        color: #9ca3af;
        font-size: 0.85rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        padding: 4px 0;
        transition: color 0.2s;
    }

    .action-btn-tiny:hover {
        color: #f3f4f6;
    }

    /* Trạng thái Loading & Empty */
    .status-msg {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #6b7280;
        gap: 12px;
        text-align: center;
    }

    .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(99, 102, 241, 0.2);
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    /* Animation cho loader icon */
    :global(.animate-spin) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
