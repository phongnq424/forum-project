<script lang="ts">
    import { tick } from "svelte";
    import { toastState } from "$lib/states/toast.svelte";
    import { marked } from "marked";
    import { page } from "$app/state";
    import { replaceState } from "$app/navigation";
    import { reactionService } from "$lib/services/reaction.service";
    import { postSaveService } from "$lib/services/postSaved.service.js";
    import { reportService } from "$lib/services/report.service";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Dropdown from "$lib/components/ui/Dropdown.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { formatDistanceToNow } from "date-fns";
    import DiscussSidebar from "$lib/components/discuss/DiscussSidebar.svelte";
    import CommentSection from "$lib/components/discuss/CommentSection.svelte";
    import PostImageGrid from "$lib/components/discuss/PostImageGrid.svelte";
    import DeleteConfirmationModal from "$lib/components/discuss/DeleteConfirmationModal.svelte";
    import EditPostModal from "$lib/components/discuss/PostFormModal.svelte";
    import type { Post } from "$lib/types/post.type";
    import { discussState } from "$lib/states/discuss.svelte.js";
    import { invalidateAll } from "$app/navigation";

    // --- State ---
    let { data } = $props();
    let post = $derived(data.post);

    let isReacted = $state(false);
    let isSaved = $state(false);
    let reactionCount = $state(0);
    let postId = $derived(String(page.params.id));
    let showOwnerMenu = $state(false);
    let openEditModal = $state(false);
    let openDeleteModal = $state(false);
    let postContentHtml = $derived(
        post?.content ? (marked.parse(post.content) as string) : "",
    );
    let reporting = $state(false);

    async function handleAfterEdit(updated?: Post) {
        if (!updated) return;

        await invalidateAll();
        openEditModal = false;
    }

    function handleAfterDelete() {
        history.back();
    }

    async function handleReaction() {
        if (!post) return;
        const previousIsReacted = isReacted;
        const previousCount = reactionCount;

        isReacted = !isReacted;
        reactionCount += isReacted ? 1 : -1;

        try {
            await reactionService.toggleReaction(post.id);
        } catch (error) {
            console.error("Reaction failed, reverting:", error);
            isReacted = previousIsReacted;
            reactionCount = previousCount;
        }
    }
    async function handleSave() {
        if (!post) return;
        isSaved = !isSaved;

        try {
            await postSaveService.toggleSave(post.id);
        } catch (error) {
            console.error("Reaction failed, reverting:", error);
            isSaved = !isSaved;
        }
    }
    async function handleReportPost() {
        if (!post || reporting) return;

        reporting = true;
        showOwnerMenu = false;

        try {
            await reportService.create({
                target_type: "POST",
                target_id: post.id,
                category: "OTHER",
                reason: "This post was reported by a user.",
                evidence: `Post title: ${post.title}`,
            });

            toastState.success("Report submitted successfully.");
        } catch (error) {
            console.error("Report post failed:", error);
            toastState.error("Failed to submit report.");
        } finally {
            reporting = false;
        }
    }
    $effect(() => {
        isReacted = data.post?.isReacted || false;
        reactionCount = data.post?.reactionCount || 0;
        isSaved = data.post?.isSaved || false;
    });

    $effect(() => {
        const scrollTo = page.url.searchParams.get("scrollTo");

        if (scrollTo === "comments") {
            // Dùng setTimeout(..., 100) thay vì tick() để cho trình duyệt thở và vẽ DOM xong xuôi
            setTimeout(() => {
                const targetArea = document.getElementById("discussion-area");

                if (targetArea) {
                    targetArea.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                    setTimeout(() => {
                        const url = new URL(window.location.href);
                        url.searchParams.delete("scrollTo");
                        replaceState(url, {});
                    }, 500);
                }
            }, 100);
        }
    });
    const trendingPosts = [
        { id: 1, title: "How to scale SvelteKit apps", author: "josh_dev" },

        { id: 2, title: "Why Rust is the future", author: "ferris_fan" },
    ];
    const suggestedAuthors = [
        { name: "PN Nguyen", role: "Fullstack Developer" },
        { name: "Sarah Connor", role: "AI Researcher" },
        { name: "Tech Lead", role: "Ex-Google Engineer" },
    ];
</script>

<svelte:head>
    <title>{post.title} | Discuss</title>
    <meta name="description" content={post.content?.slice(0, 160)} />
    <meta property="og:title" content={post.title} />
</svelte:head>

<div class="detail-page-wrapper">
    <div class="detail-container">
        {#if post}
            <main class="detail-layout">
                <article>
                    <header class="post-header">
                        <Button
                            variant="secondary"
                            size="sm"
                            onclick={() => history.back()}
                        >
                            <Icon name="arrow-left" />
                        </Button>

                        <div class="author-meta">
                            <img
                                src={post.User?.avatar || "/default-avatar.png"}
                                alt="Avatar"
                                class="avatar"
                            />
                            <div class="author-info">
                                <h3 class="username">
                                    {post.User?.fullname ||
                                        post.User?.username ||
                                        "Anonymous"}
                                </h3>
                                <span class="timestamp">
                                    {post.created_at
                                        ? formatDistanceToNow(
                                              new Date(post.created_at),
                                          )
                                        : "just now"} ago
                                </span>
                            </div>
                        </div>
                        {#if post?.permissions}
                            {#if post}
                                <div class="owner-actions">
                                    <Dropdown bind:show={showOwnerMenu}>
                                        {#if post.permissions?.canEdit}
                                            <button
                                                type="button"
                                                onclick={() => {
                                                    openEditModal = true;
                                                    showOwnerMenu = false;
                                                }}
                                            >
                                                <Icon name="pencil" size={16} />
                                                Edit
                                            </button>
                                        {/if}

                                        {#if post.permissions?.canDelete}
                                            <button
                                                type="button"
                                                onclick={() => {
                                                    openDeleteModal = true;
                                                    showOwnerMenu = false;
                                                }}
                                            >
                                                <Icon name="trash" size={16} />
                                                Delete
                                            </button>
                                        {/if}

                                        {#if !post.permissions?.canEdit && !post.permissions?.canDelete}
                                            <button
                                                type="button"
                                                onclick={handleReportPost}
                                                disabled={reporting}
                                            >
                                                <Icon name="flag" size={16} />
                                                {reporting
                                                    ? "Reporting..."
                                                    : "Report"}
                                            </button>
                                        {/if}
                                    </Dropdown>

                                    <button
                                        type="button"
                                        class="icon-btn"
                                        aria-label="More post actions"
                                        title="More actions"
                                        onclick={() =>
                                            (showOwnerMenu = !showOwnerMenu)}
                                    >
                                        <Icon
                                            name="more-horizontal"
                                            size={20}
                                            color="#d1d5db"
                                        />
                                    </button>
                                </div>
                            {/if}
                        {/if}
                    </header>

                    <main class="post-content">
                        <h1 class="post-title">{post.title}</h1>
                        <PostImageGrid images={post.Image || []} />
                        <div class="text-body markdown-body">
                            {@html postContentHtml}
                        </div>

                        {#if post.primaryTopic || (post.topics && post.topics.length > 0)}
                            <div class="tags">
                                {#if post.primaryTopic}
                                    <span class="topic-tag primary"
                                        >#{post.primaryTopic.name}</span
                                    >
                                {/if}

                                {#each post.topics ?? [] as topic}
                                    {#if topic.id !== post.primaryTopic?.id}
                                        <span class="topic-tag"
                                            >#{topic.name}</span
                                        >
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                    </main>

                    <footer class="post-actions">
                        <button
                            class="action-btn {isReacted ? 'liked' : ''}"
                            title="Reactions"
                            onclick={handleReaction}
                        >
                            <Icon
                                name="heart"
                                fill={isReacted ? "currentColor" : "none"}
                            />
                            {reactionCount || 0}
                        </button>
                        <button
                            class="action-btn"
                            title="Comments"
                            onclick={() =>
                                document
                                    .getElementById("discussion-area")
                                    ?.scrollIntoView({ behavior: "smooth" })}
                        >
                            <Icon name="message-square" />
                            {post.commentCount || 0}
                        </button>
                        <button class="action-btn">
                            <Icon name="share" />
                        </button>
                        <button
                            class="action-btn {isSaved ? 'saved' : ''}"
                            title="Save Post"
                            onclick={handleSave}
                        >
                            <Icon
                                name="bookmark"
                                fill={isSaved ? "currentColor" : "none"}
                            />
                        </button>
                    </footer>
                    <div id="discussion-area">
                        <CommentSection {postId} />
                    </div>
                </article>

                <aside class="sidebar-wrapper">
                    <div class="sticky-sidebar">
                        <DiscussSidebar
                            {trendingPosts}
                            filterGroups={discussState.filterGroups}
                            {suggestedAuthors}
                        />
                    </div>
                </aside>
            </main>
            {#if post}
                <EditPostModal
                    bind:open={openEditModal}
                    {post}
                    topics={discussState.availableTopics}
                    onSuccess={handleAfterEdit}
                />

                <DeleteConfirmationModal
                    bind:open={openDeleteModal}
                    postId={post.id}
                    onDeleted={handleAfterDelete}
                />
            {/if}
        {/if}
    </div>
</div>

<style>
    /* BỐ CỤC TỔNG (Giữ 2 cột) */
    .detail-page-wrapper {
        background-color: transparent;
        min-height: 100vh;
        color: #e5e7eb;
    }
    .detail-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 32px 20px 80px;
    }
    .detail-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 30px;
        align-items: start;
    }

    /* HEADER BÊN TRÁI CỦA BẠN */
    .post-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
    }
    .icon-btn {
        background: transparent;
        border: none;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
        margin-left: -8px;
    }
    .icon-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .author-meta {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid #374151;
    }
    .author-info {
        display: flex;
        flex-direction: column;
    }
    .username {
        font-weight: 600;
        font-size: 16px;
        margin: 0;
        color: #f9fafb;
    }
    .timestamp {
        font-size: 14px;
        color: #9ca3af;
    }

    /* NỘI DUNG TEXT */
    .post-title {
        font-size: 24px;
        font-weight: 700;
        color: #f9fafb;
        margin: 0 0 24px 0;
        line-height: 1.4;
    }
    .text-body {
        line-height: 1.7;
        color: #d1d5db;
        font-size: 16px;
        margin-bottom: 16px;
    }
    .markdown-body :global(h1),
    .markdown-body :global(h2),
    .markdown-body :global(h3) {
        color: #f9fafb;
        margin: 24px 0 12px;
        line-height: 1.3;
    }

    .markdown-body :global(h1) {
        font-size: 28px;
    }

    .markdown-body :global(h2) {
        font-size: 22px;
    }

    .markdown-body :global(h3) {
        font-size: 18px;
    }

    .markdown-body :global(p) {
        margin: 0 0 14px;
    }

    .markdown-body :global(strong) {
        color: #ffffff;
        font-weight: 700;
    }

    .markdown-body :global(em) {
        color: #e5e7eb;
    }

    .markdown-body :global(ul),
    .markdown-body :global(ol) {
        padding-left: 24px;
        margin: 12px 0 16px;
    }

    .markdown-body :global(li) {
        margin-bottom: 6px;
    }

    .markdown-body :global(a) {
        color: #6366f1;
        text-decoration: none;
    }

    .markdown-body :global(a:hover) {
        text-decoration: underline;
    }

    .markdown-body :global(blockquote) {
        border-left: 4px solid #6366f1;
        padding: 10px 16px;
        margin: 18px 0;
        background: rgba(99, 102, 241, 0.08);
        color: #cbd5e1;
        border-radius: 8px;
        font-style: italic;
    }

    .markdown-body :global(code) {
        background: #1f2937;
        color: #93c5fd;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 14px;
    }

    .markdown-body :global(pre) {
        background: #020617;
        border: 1px solid #1f2937;
        padding: 16px;
        border-radius: 12px;
        overflow-x: auto;
        margin: 16px 0;
    }

    .markdown-body :global(pre code) {
        background: transparent;
        padding: 0;
        color: #dbeafe;
    }

    .markdown-body :global(img) {
        max-width: 100%;
        border-radius: 12px;
        margin: 20px 0;
    }
    .text-body :global(img) {
        max-width: 100%;
        border-radius: 12px;
        margin: 20px 0;
    }

    .text-body :global(a) {
        color: #6366f1;
        text-decoration: none;
    }

    .text-body :global(a:hover) {
        text-decoration: underline;
    }

    .text-body :global(blockquote) {
        border-left: 4px solid #6366f1;
        padding-left: 20px;
        margin: 24px 0;
        font-style: italic;
        color: #9ca3af;
    }

    /* TAGS VÀ ACTIONS */
    .tags {
        margin-bottom: 32px;
    }
    .topic-tag {
        color: #3b82f6;
        font-weight: 500;
        cursor: pointer;
        font-size: 16px;
    }
    .topic-tag:hover {
        text-decoration: underline;
    }

    .post-actions {
        display: flex;
        align-items: center;
        gap: 32px;
        padding-top: 24px;
        border-top: 1px solid #374151;
    }
    .action-btn {
        background: transparent;
        border: none;
        color: #9ca3af;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        padding: 8px 0;
        transition: color 0.2s;
    }
    .action-btn:hover {
        color: #f9fafb;
    }
    .action-btn.liked {
        color: #ef4444;
    }
    .action-btn.saved {
        color: #6366f1; /* Đổi màu xanh nếu đã lưu */
    }
    .action-btn.saved:hover {
        color: #818cf8;
    }

    /* LOADING & SIDEBAR */
    .sticky-sidebar {
        position: sticky;
        top: 24px;
    }

    .owner-actions {
        margin-left: auto; /* đẩy sang phải trong header */
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative; /* để dropdown absolute bên trong */
        z-index: 50;
    }

    /* nút More (icon tròn) */
    .owner-actions .icon-btn {
        padding: 6px;
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: transparent;
        transition:
            background-color 0.12s,
            transform 0.12s;
    }

    .owner-actions .icon-btn:hover {
        background-color: rgba(255, 255, 255, 0.04);
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    /* TABLET & MOBILE */
    @media (max-width: 1024px) {
        .detail-layout {
            grid-template-columns: 1fr;
        }
        .sidebar-wrapper {
            display: none;
        }
        .detail-container {
            padding: 24px 20px 60px;
            max-width: 100%;
        }
        .post-title {
            font-size: 28px;
        }
        .owner-actions {
            margin-left: 8px; /* tránh đẩy quá cực */
        }
    }
    @media (max-width: 768px) {
        .detail-container {
            padding: 16px 0 40px;
        }
        .post-title {
            font-size: 24px;
            margin-bottom: 16px;
        }
        .text-body {
            font-size: 16px;
        }
        .owner-actions {
            margin-left: 8px; /* tránh đẩy quá cực */
        }
    }
</style>
