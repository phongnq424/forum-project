<script lang="ts">
    import Card from "./Card.svelte";

    let { post } = $props();

    function getInitial(name: string) {
        return name ? name.charAt(0).toUpperCase() : "U";
    }
</script>

<Card
    variant="default"
    padding="0"
    hover={true}
    style="margin-bottom: 20px; overflow: hidden;"
>
    <div class="post-card">
        <div class="post-content">
            <div class="post-author">
                <div class="mini-avatar">
                    {getInitial(post.User?.fullname)}
                </div>
                <span class="author-name"
                    >{post.User?.fullname || "Anonymous"}</span
                >
                <span class="dot">•</span>
                <span class="post-date"
                    >{new Date(post.created_at).toLocaleDateString()}</span
                >
            </div>
            <h2 class="post-title">{post.title}</h2>
            <p class="post-excerpt">
                {post.excerpt || "No description provided for this post yet..."}
            </p>
            <div class="post-actions">
                <div class="stats-group">
                    <button class="action-btn">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                            /></svg
                        > 90
                    </button>
                    <button class="action-btn">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            /></svg
                        > 70
                    </button>
                </div>
                <div class="utility-group">
                    <button class="action-btn">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
                            /></svg
                        >
                    </button>
                </div>
            </div>
        </div>
        <div class="post-thumbnail">
            <img
                src={post.thumbnail ||
                    "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400"}
                alt="post thumb"
            />
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
    .post-author {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
    }
    .mini-avatar {
        width: 24px;
        height: 24px;
        background: #6366f1;
        border-radius: 6px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
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
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 10px 0;
        line-height: 1.4;
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
    .stats-group,
    .utility-group {
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
    }
    .action-btn:hover {
        color: #fff;
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
    }
</style>
