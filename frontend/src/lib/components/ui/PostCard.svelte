<script lang="ts">
    import { goto } from "$app/navigation";
    import Card from "./Card.svelte";
    import type { Post, PostTopic } from "$lib/types/post.type";
    import Badge from "./Badge.svelte";
    import Icon from "./Icon.svelte";
    import { reactionService } from "$lib/services/reaction.service";
    import { postSaveService } from "$lib/services/postSaved.service";

    let { post } = $props<{ post: Post }>();

    let isReacted = $state(post.isReacted || false);
    let reactionCount = $state(post.reactionCount || 0);
    let isSaved = $state(post.isSaved || false);

    function getInitial(name?: string) {
        return name ? name.charAt(0).toUpperCase() : "U";
    }

    function isPostTopic(
        topic: PostTopic | null | undefined,
    ): topic is PostTopic {
        return Boolean(topic && topic.id && topic.name);
    }

    let displayName = $derived(
        post.User?.fullname || post.User?.username || "Anonymous",
    );

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
</script>

<Card
    variant="default"
    padding="0"
    hover={true}
    style="margin-bottom: 20px; overflow: hidden;"
>
    <a href="/discuss/{post.id}" class="post-link">
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
                            {new Date(post.created_at).toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                },
                            )}
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

                <h2 class="post-title">{post.title}</h2>

                <p class="post-excerpt">
                    {post.content ||
                        "No description provided for this post yet..."}
                </p>

                <div class="post-actions">
                    <div class="stats-group">
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
                            onclick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                goto(`/discuss/${post.id}?scrollTo=comments`);
                            }}
                        >
                            <Icon name="message-square" />
                            {post.commentCount || 0}
                        </button>

                        <button
                            class="action-btn"
                            onclick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
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
                    </div>
                </div>
            </div>

            <div class="post-thumbnail">
                <img src={coverImage} alt={post.title} />
            </div>
        </div>
    </a>
</Card>

<style>
    .post-card {
        display: grid;
        grid-template-columns: 1fr 180px;
        padding: 24px;
        gap: 20px;
    }

    .post-link {
        text-decoration: none;
        color: inherit;
        display: block;
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

    .post-topics {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 6px;
        margin-left: auto;
        max-width: 45%;
    }

    .mini-avatar,
    .real-avatar {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        flex-shrink: 0;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .post-date,
    .dot {
        font-size: 12px;
        color: #6b7280;
        white-space: nowrap;
    }

    .post-title {
        font-size: 18px;
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
        color: #9ca3af;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;
        padding: 0;
    }

    .action-btn.liked {
        color: #ef4444;
    }

    .action-btn:hover {
        color: #fff;
    }

    .action-btn.saved {
        color: #6366f1;
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
