<script lang="ts">
    import Card from "./Card.svelte";
    import type { Post } from "$lib/types/post.type";
    import Badge from "./Badge.svelte";
    import Icon from "./Icon.svelte";
    let { post } = $props<{ post: Post }>();

    function getInitial(name?: string) {
        return name ? name.charAt(0).toUpperCase() : "U";
    }

    const displayName =
        post.User?.fullname || post.User?.username || "Anonymous";

    const coverImage =
        post.Image && post.Image.length > 0
            ? post.Image[0].url
            : "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400";
</script>

<Card
    variant="default"
    padding="0"
    hover={true}
    style="margin-bottom: 20px; overflow: hidden;"
>
    <div class="post-card">
        <div class="post-content">
            <div class="post-header">
                <div class="post-author">
                    {#if post.User?.avatar}
                        <img
                            class="real-avatar"
                            src={post.User.avatar}
                            alt={displayName}
                        />
                    {:else}
                        <div class="mini-avatar">
                            {getInitial(displayName)}
                        </div>
                    {/if}
                    <span class="author-name">{displayName}</span>
                    <span class="dot">•</span>
                    <span class="post-date">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>

                {#if post.Topic?.name}
                    <Badge color="outline" size="sm">
                        #{post.Topic.name}
                    </Badge>
                {/if}
            </div>

            <h2 class="post-title">{post.title}</h2>

            <p class="post-excerpt">
                {post.content || "No description provided for this post yet..."}
            </p>

            <div class="post-actions">
                <div class="stats-group">
                    <button class="action-btn" title="Reactions">
                        <Icon name="heart" />
                        {post.reactionCount || 0}
                    </button>
                    <button class="action-btn" title="Comments">
                        <Icon name="message-square" />
                        {post.commentCount || 0}
                    </button>
                    <button
                        class="action-btn {post.isSaved ? 'saved' : ''}"
                        title="Save Post"
                    >
                        <Icon
                            name="bookmark"
                            fill={post.isSaved ? "currentColor" : "none"}
                        />
                    </button>
                </div>
            </div>
        </div>

        <div class="post-thumbnail">
            <img src={coverImage} alt={post.title} />
        </div>
    </div>
</Card>

<style>
    .post-card {
        display: grid;
        grid-template-columns: 1fr 180px;
        padding: 24px;
        gap: 20px;
    }

    .post-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        gap: 16px;
    }

    .post-author {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .mini-avatar,
    .real-avatar {
        width: 24px;
        height: 24px;
        border-radius: 6px;
    }
    .mini-avatar {
        background: #6366f1;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
    }
    .real-avatar {
        object-fit: cover;
    }

    .author-name {
        font-size: 13px;
        font-weight: 600;
        color: #d1d5db;
    }

    .post-date,
    .dot {
        font-size: 12px;
        color: #6b7280;
    }

    .post-title {
        font-size: 18px; /* Đã làm nhỏ lại so với 20px cũ */
        font-weight: 700;
        margin: 0 0 8px 0;
        line-height: 1.4;
        color: #f3f4f6;
    }

    .post-excerpt {
        font-size: 14px;
        color: #9ca3af;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 20px;
    }

    .post-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .stats-group {
        display: flex;
        gap: 16px;
    }

    .action-btn {
        background: transparent;
        border: none;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;
        padding: 0;
    }

    .action-btn:hover {
        color: #fff;
    }

    .action-btn.saved {
        color: #6366f1; /* Đổi màu xanh nếu đã lưu */
    }
    .action-btn.saved:hover {
        color: #818cf8;
    }

    .post-thumbnail {
        display: flex;
        align-items: center;
    }

    .post-thumbnail img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 12px;
        border: 1px solid #2a2e36;
    }

    @media (max-width: 600px) {
        .post-card {
            grid-template-columns: 1fr;
        }
        .post-thumbnail {
            order: -1;
        }
        .post-thumbnail img {
            height: auto;
            aspect-ratio: 16/9;
        }
    }
</style>
