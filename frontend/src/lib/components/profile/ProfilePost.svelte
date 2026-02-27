<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    let { posts, postCount } = $props<{ posts: any[]; postCount: number }>();
</script>

<div class="section-title">
    <h3>POSTS</h3>
    <Badge color="info" size="sm">{postCount}</Badge>
</div>

<div class="posts-grid">
    {#each posts as post}
        <Card variant="default" hover={true} padding="16px">
            <div class="post-card-content">
                <h4>{post.title}</h4>
                <div class="post-footer">
                    <span class="post-date">
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <div class="post-stats">
                        <span>💬 {post.commentCount || 0}</span>
                    </div>
                </div>
            </div>
        </Card>
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
        gap: 16px;
    }
    .post-card-content h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #fff;
    }
    .post-footer {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #6b7280;
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
