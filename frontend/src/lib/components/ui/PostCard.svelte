<script lang="ts">
    import { goto } from "$app/navigation";
    import Card from "./Card.svelte";
    import Avatar from "./Avatar.svelte";
    import type { Post, PostTopic } from "$lib/types/post.type";
    import Badge from "./Badge.svelte";
    import Icon from "./Icon.svelte";
    import { reactionService } from "$lib/services/reaction.service";
    import { postSaveService } from "$lib/services/postSaved.service";

    let { post } = $props<{ post: Post }>();

    let isReacted = $state(post.isReacted || false);
    let reactionCount = $state(post.reactionCount || 0);
    let isSaved = $state(post.isSaved || false);

    function isPostTopic(
        topic: PostTopic | null | undefined,
    ): topic is PostTopic {
        return Boolean(topic && topic.id && topic.name);
    }

    let displayName = $derived(
        post.User?.fullname || post.User?.username || "Anonymous",
    );

    let authorHref = $derived(
        post.User?.id ? `/profile/${post.User.id}` : null,
    );

    let postHref = $derived(`/discuss/${post.id}`);

    let coverImage = $derived(
        post.Image && post.Image.length > 0
            ? post.Image[0].url
            : "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
    );

    let primaryTopic = $derived(
        post.primaryTopic || post.topic || post.Topic || null,
    );

    let displayTopics = $derived.by(() => {
        const fromTopics = post.topics ?? [];

        const fromPostTopics =
            post.PostTopics?.map(
                (item: { Topic?: PostTopic | null }) => item.Topic,
            ).filter(isPostTopic) ?? [];

        const merged: PostTopic[] = [...fromTopics, ...fromPostTopics];

        if (
            primaryTopic &&
            !merged.some((topic) => topic.id === primaryTopic.id)
        ) {
            merged.unshift(primaryTopic);
        }

        const map = new Map<string, PostTopic>();

        merged.forEach((topic) => {
            if (topic?.id) {
                map.set(topic.id, topic);
            }
        });

        return Array.from(map.values()).slice(0, 3);
    });

    async function handleReaction(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        const previousIsReacted = isReacted;
        const previousCount = reactionCount;

        isReacted = !isReacted;
        reactionCount += isReacted ? 1 : -1;

        try {
            await reactionService.toggleReaction(post.id);
        } catch (error) {
            console.error("Lỗi khi thả tym:", error);
            isReacted = previousIsReacted;
            reactionCount = previousCount;
        }
    }

    async function handleSave(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        const previousIsSaved = isSaved;
        isSaved = !isSaved;

        try {
            await postSaveService.toggleSave(post.id);
        } catch (error) {
            console.error("Save failed:", error);
            isSaved = previousIsSaved;
        }
    }

    function goToComments(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        goto(`/discuss/${post.id}?scrollTo=comments`);
    }

    function handleShare(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
    }
</script>

<Card
    variant="default"
    padding="0"
    hover={true}
    style="margin-bottom: 20px; overflow: hidden;"
>
    <article class="post-card">
        <div class="post-content">
            <div class="post-header">
                <div class="post-author">
                    {#if authorHref}
                        <a
                            href={authorHref}
                            class="author-link"
                            aria-label={`View profile of ${displayName}`}
                        >
                            <Avatar
                                name={displayName}
                                src={post.User?.avatar ?? undefined}
                                size="sm"
                            />

                            <span class="author-name">{displayName}</span>
                        </a>
                    {:else}
                        <div class="author-link static">
                            <Avatar
                                name={displayName}
                                src={post.User?.avatar ?? undefined}
                                size="sm"
                            />

                            <span class="author-name">{displayName}</span>
                        </div>
                    {/if}

                    <span class="dot">•</span>

                    <span class="post-date">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>

                {#if displayTopics.length > 0}
                    <div class="post-topics">
                        {#each displayTopics as topic (topic.id)}
                            <Badge color="outline" size="sm">
                                #{topic.name}
                            </Badge>
                        {/each}
                    </div>
                {/if}
            </div>

            <a href={postHref} class="post-body-link">
                <h2 class="post-title">{post.title}</h2>

                <p class="post-excerpt">
                    {post.content ||
                        "No description provided for this post yet..."}
                </p>
            </a>

            <div class="post-actions">
                <div class="stats-group">
                    <button
                        type="button"
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
                        type="button"
                        class="action-btn"
                        title="Comments"
                        onclick={goToComments}
                    >
                        <Icon name="message-square" />
                        {post.commentCount || 0}
                    </button>

                    <button
                        type="button"
                        class="action-btn"
                        title="Share"
                        onclick={handleShare}
                    >
                        <Icon name="share" />
                    </button>

                    <button
                        type="button"
                        class="action-btn {isSaved ? 'saved' : ''}"
                        title="Save Post"
                        onclick={handleSave}
                    >
                        <Icon
                            name="bookmark"
                            fill={isSaved ? "currentColor" : "none"}
                        />
                    </button>
                </div>
            </div>
        </div>

        <a href={postHref} class="post-thumbnail" aria-label={post.title}>
            <img src={coverImage} alt={post.title} />
        </a>
    </article>
</Card>

<style>
    .post-card {
        display: grid;
        grid-template-columns: 1fr 180px;
        padding: 24px;
        gap: 20px;
    }

    .post-content {
        min-width: 0;
    }

    .post-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 12px;
        gap: 16px;
    }

    .post-author {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    .author-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        text-decoration: none;
        color: inherit;
        border-radius: 10px;
    }

    .author-link:not(.static):hover .author-name {
        color: var(--ui-text-strong);
        text-decoration: underline;
    }

    .post-topics {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 6px;
        margin-left: auto;
        max-width: 45%;
    }

    .author-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--ui-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .post-date,
    .dot {
        font-size: 12px;
        color: var(--ui-text-soft);
        white-space: nowrap;
    }

    .post-body-link {
        display: block;
        text-decoration: none;
        color: inherit;
    }

    .post-body-link:hover .post-title {
        color: var(--ui-text-strong);
    }

    .post-title {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 8px 0;
        line-height: 1.4;
        color: var(--ui-text-strong);
        transition: color 0.16s ease;
    }

    .post-excerpt {
        font-size: 14px;
        color: var(--ui-text-muted);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0 0 20px;
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
        color: var(--ui-text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;
        padding: 0;
    }

    .action-btn.liked {
        color: var(--ui-danger);
    }

    .action-btn:hover {
        color: var(--ui-text-strong);
    }

    .action-btn.saved {
        color: var(--ui-primary);
    }

    .action-btn.saved:hover {
        color: var(--ui-primary-hover);
    }

    .post-thumbnail {
        display: flex;
        align-items: center;
        text-decoration: none;
    }

    .post-thumbnail img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 12px;
        border: 1px solid var(--ui-border);
        transition:
            filter 0.16s ease,
            transform 0.16s ease;
    }

    .post-thumbnail:hover img {
        filter: brightness(1.08);
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

        .post-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .post-topics {
            max-width: 100%;
            justify-content: flex-start;
            margin-left: 0;
        }
    }
</style>
