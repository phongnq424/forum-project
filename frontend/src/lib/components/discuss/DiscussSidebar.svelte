<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    let { trendingPosts, filterGroups, suggestedAuthors } = $props();

    function getInitial(name: string) {
        return name ? name.charAt(0).toUpperCase() : "U";
    }
</script>

<aside class="discuss-sidebar">
    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="flame" size={16} class="heading-icon" /> Trending posts
        </h3>
        <div class="trending-list">
            {#each trendingPosts as trend, i}
                <div class="trend-item">
                    <span class="trend-number">0{i + 1}</span>
                    <div class="trend-info">
                        <p class="trend-title">{trend.title}</p>
                        <p class="trend-author">@{trend.author}</p>
                    </div>
                </div>
            {/each}
        </div>
    </Card>

    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="folder" size={16} class="heading-icon" /> Category filter
        </h3>
        <div class="category-filter-box">
            {#each filterGroups as group}
                <div class="filter-group">
                    <span class="group-label">{group.name}</span>
                    <div class="topic-chips">
                        {#each group.topics as topic}
                            <Badge color="outline" size="md">#{topic}</Badge>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </Card>

    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="user" size={16} class="heading-icon" /> Suggested authors
        </h3>
        <div class="author-list">
            {#each suggestedAuthors as author}
                <div class="author-item">
                    <div class="author-avatar-mini">
                        {getInitial(author.name)}
                    </div>
                    <div class="author-meta">
                        <p class="a-name">{author.name}</p>
                        <p class="a-role">{author.role}</p>
                    </div>
                    <button class="follow-btn">Follow</button>
                </div>
            {/each}
        </div>
    </Card>
</aside>

<style>
    .discuss-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .sidebar-heading {
        display: flex;
        align-items: center;
        gap: 8px; /* Khoảng cách giữa icon và chữ */
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #6b7280;
        margin-bottom: 20px;
    }

    .trend-item {
        display: flex;
        gap: 15px;
        margin-bottom: 16px;
    }
    .trend-number {
        font-size: 24px;
        font-weight: 800;
        color: #2a2e36;
    }
    .trend-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        line-height: 1.4;
    }
    .trend-author {
        font-size: 12px;
        color: #6366f1;
        margin-top: 4px;
    }

    .filter-group {
        margin-bottom: 16px;
    }
    .group-label {
        font-size: 11px;
        font-weight: 800;
        color: #6366f1;
        text-transform: uppercase;
        display: block;
        margin-bottom: 8px;
    }
    .topic-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .author-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }
    .author-avatar-mini {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #374151;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
    }
    .author-meta {
        flex: 1;
    }
    .a-name {
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        margin: 0;
    }
    .a-role {
        font-size: 11px;
        font-family: inherit;
        color: #6b7280;
        margin: 0;
    }
    .follow-btn {
        font-size: 11px;
        font-weight: 700;
        background: #fff;
        color: #000;
        border: none;
        padding: 6px 14px;
        border-radius: 20px;
        cursor: pointer;
    }
    :global(.heading-icon) {
        color: #6366f1; /* Cho màu tím đồng bộ hoặc giữ nguyên currentColor */
    }
</style>
