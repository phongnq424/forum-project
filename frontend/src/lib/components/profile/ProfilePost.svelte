<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { Post } from "$lib/types/post.type";
    import PostCard from "$lib/components/ui/PostCard.svelte";

    // 👇 Khuyên dùng type Post[] thay vì any[] để code chặt chẽ hơn
    let { posts, postCount } = $props<{ posts: Post[]; postCount: number }>();
</script>

<div class="section-title">
    <h3>POSTS</h3>
    <Badge color="info" size="sm">{postCount}</Badge>
</div>

<div class="posts-grid">
    {#each posts as post}
        <PostCard {post} />
    {:else}
        <div class="empty-state">No posts yet.</div>
    {/each}
</div>

<style>
    .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 32px 0 16px;
    }
    .section-title h3 {
        font-size: 14px;
        letter-spacing: 1px;
        color: #fff;
        margin: 0;
    }

    .posts-grid {
        display: flex;
        flex-direction: column;
        gap: 16px; /* Giữ nguyên khoảng cách giữa các PostCard */
    }
    .empty-state {
        color: #6b7280;
        font-size: 14px;
        padding: 20px 0;
        text-align: center;
        background: #14161c;
        border-radius: 12px;
        border: 1px dashed #2a2e36;
    }
</style>
