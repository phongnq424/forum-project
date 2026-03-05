<script lang="ts">
    import Icon from "$lib/components/ui/Icon.svelte";
    import PostCard from "$lib/components/ui/PostCard.svelte";
    import DiscussSidebar from "$lib/components/discuss/DiscussSidebar.svelte";
    import { discussState } from "$lib/states/discuss.svelte";

    let { data } = $props();

    let savedPosts = $derived(
        data?.post || [
            {
                id: 1,
                title: "How to master Svelte 5 Runes in 10 minutes",
                author: "johndoe",
                excerpt:
                    "A quick guide to $state, $derived, and $props to upgrade your Svelte game...",
                date: "2 hours ago",
            },
            {
                id: 2,
                title: "Building a scalable chat app with Supabase",
                author: "janedev",
                excerpt:
                    "Real-time subscriptions made easy. Let's build a chat app from scratch...",
                date: "1 day ago",
            },
        ],
    );

    // 2. DATA CỨNG CHO SIDEBAR (Giống hệt trang chính để xài tạm)
    const trendingPosts = [
        {
            id: 1,
            title: "How to scale SvelteKit apps to millions of users",
            author: "josh_dev",
        },
        {
            id: 2,
            title: "Why Rust is the future of Frontend Tooling",
            author: "ferris_fan",
        },
        {
            id: 3,
            title: "Mastering TypeScript Utility Types",
            author: "pro_coder",
        },
    ];

    const suggestedAuthors = [
        { name: "PN Nguyen", role: "Fullstack Developer" },
        { name: "Sarah Connor", role: "AI Researcher" },
        { name: "Tech Lead", role: "Ex-Google Engineer" },
    ];
</script>

<div class="discuss-container">
    <main class="discuss-layout">
        <section class="feed-section">
            <header class="page-header">
                <div class="header-title">
                    <div class="icon-wrapper">
                        <Icon name="bookmark" size={20} color="#fff" />
                    </div>
                    <h1>Saved Posts</h1>
                </div>
                <p class="subtitle">
                    {#if savedPosts.pagination.total > 0}
                        You have <span class="highlight"
                            >{savedPosts.pagination.total}</span
                        >
                        saved {savedPosts.pagination.total === 1
                            ? "item"
                            : "items"}
                    {:else}
                        Your reading list is empty
                    {/if}
                </p>
            </header>

            {#if savedPosts.pagination.total > 0}
                {#each savedPosts.data as post}
                    <PostCard {post} />
                {/each}
            {:else}
                <div class="saved-empty-state">
                    <div class="empty-icon">
                        <Icon name="folder" size={48} color="#4b5563" />
                    </div>
                    <h3>No posts saved yet</h3>
                    <p>
                        Articles, discussions, and challenges you save will
                        appear here for easy access later.
                    </p>
                    <a href="/discuss" class="explore-btn"
                        >Explore Discussions</a
                    >
                </div>
            {/if}
        </section>

        <div class="sidebar-wrapper">
            <DiscussSidebar
                {trendingPosts}
                filterGroups={discussState.filterGroups}
                {suggestedAuthors}
            />
        </div>
    </main>
</div>

<style>
    /* --- BỘ KHUNG CSS TỪ TRANG MAIN ĐƯA SANG --- */
    .discuss-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        color: #e5e7eb;
    }

    .discuss-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 30px;
    }

    .feed-section {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    /* --- CSS RIÊNG CHO HEADER CỦA TRANG SAVED --- */
    .page-header {
        margin-bottom: 8px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header-title {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;
    }

    .icon-wrapper {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    .header-title h1 {
        font-size: 28px;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
        letter-spacing: -0.02em;
    }

    .subtitle {
        color: #9ca3af;
        font-size: 15px;
        margin: 0;
    }

    .highlight {
        color: #e5e7eb;
        font-weight: 700;
    }

    /* --- EMPTY STATE RIÊNG CHO TRANG SAVED --- */
    .saved-empty-state {
        text-align: center;
        padding: 60px 20px;
        background: #14161c;
        border-radius: 16px;
        border: 2px dashed rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .empty-icon {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
    }

    .saved-empty-state h3 {
        font-size: 20px;
        font-weight: 700;
        color: #e5e7eb;
        margin: 0 0 12px 0;
    }

    .saved-empty-state p {
        color: #9ca3af;
        font-size: 15px;
        max-width: 400px;
        margin: 0 0 24px 0;
        line-height: 1.5;
    }

    .explore-btn {
        display: inline-flex;
        align-items: center;
        padding: 12px 24px;
        background: #8b5cf6;
        color: white;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 15px;
        transition:
            background 0.2s ease,
            transform 0.1s ease;
    }

    .explore-btn:hover {
        background: #7c3aed;
        transform: translateY(-2px);
    }

    /* --- RESPONSIVE CHUẨN TRANG MAIN --- */
    @media (max-width: 900px) {
        .discuss-layout {
            grid-template-columns: 1fr;
        }
        .sidebar-wrapper {
            display: none;
        }
    }
</style>
