<script lang="ts">
    import { page } from "$app/state";
    import { postService } from "$lib/services/post.service";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { formatDistanceToNow } from "date-fns";
    import DiscussSidebar from "$lib/components/discuss/DiscussSidebar.svelte";

    let post = $state<any>(null);
    let loading = $state(true);
    let showAllImages = $state(false);

    let postId = $derived(String(page.params.id));

    async function loadPost() {
        loading = true;
        try {
            // Nhớ sửa lại postService để lấy trực tiếp res nếu BE trả về object nhé
            const res = await postService.getPost(postId);
            post = res;
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        postId;
        loadPost();
    });

    let displayedImages = $derived(
        post?.Image
            ? showAllImages
                ? post.Image
                : post.Image.slice(0, 3)
            : [],
    );
    let hasMoreImages = $derived(
        (post?.Image?.length || 0) > 3 && !showAllImages,
    );

    // Mock data cho Sidebar
    const trendingPosts = [
        { id: 1, title: "How to scale SvelteKit apps", author: "josh_dev" },
        { id: 2, title: "Why Rust is the future", author: "ferris_fan" },
    ];
</script>

<div class="detail-page-wrapper">
    <div class="detail-container">
        {#if loading}
            <div class="skeleton">Loading content...</div>
        {:else if post}
            <main class="detail-layout">
                <article>
                    <header class="post-header">
                        <button
                            class="icon-btn back-btn"
                            onclick={() => history.back()}
                        >
                            <Icon name="arrow-left" size={24} color="#d1d5db" />
                        </button>

                        <div class="author-meta">
                            <img
                                src={post.User?.avatar || "/default-avatar.png"}
                                alt="Avatar"
                                class="avatar"
                            />
                            <div class="author-info">
                                <h3 class="username">
                                    {post.User?.username || "Anonymous"}
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
                    </header>

                    <main class="post-content">
                        <h1 class="post-title">{post.title}</h1>

                        {#if post.Image && post.Image.length > 0}
                            <div
                                class="image-grid {showAllImages
                                    ? 'grid-expanded'
                                    : 'grid-' + displayedImages.length}"
                            >
                                {#each displayedImages as img, i}
                                    <div class="image-item">
                                        <img src={img.url} alt="Post content" />
                                        {#if i === 2 && hasMoreImages}
                                            <button
                                                class="overlay-more"
                                                onclick={() =>
                                                    (showAllImages = true)}
                                            >
                                                <Icon
                                                    name="plus"
                                                    size={28}
                                                    color="#fff"
                                                />
                                                <span
                                                    >{post.Image.length - 3} more</span
                                                >
                                            </button>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <div class="text-body">
                            {@html post.content || ""}
                        </div>

                        {#if post.Topic?.name}
                            <div class="tags">
                                <span class="topic-tag">#{post.Topic.name}</span
                                >
                            </div>
                        {/if}
                    </main>

                    <footer class="post-actions">
                        <button class="action-btn">
                            <Icon name="heart" size={22} />
                            <span>{post.reactionCount || 0}</span>
                        </button>
                        <button class="action-btn">
                            <Icon name="message-circle" size={22} />
                            <span>{post.commentCount || 0}</span>
                        </button>
                        <button class="action-btn">
                            <Icon name="share" size={22} />
                        </button>
                    </footer>
                </article>

                <aside class="sidebar-wrapper">
                    <div class="sticky-sidebar">
                        <DiscussSidebar
                            {trendingPosts}
                            filterGroups={[]}
                            suggestedAuthors={[]}
                        />
                    </div>
                </aside>
            </main>
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
        line-height: 1.5;
        color: #d1d5db;
        font-size: 16px;
        white-space: pre-wrap;
        margin-bottom: 16px;
    }

    .image-grid {
        width: 100%;
        display: grid;
        gap: 2px; /* Dùng gap làm đường viền phân cách cực tinh tế */
        margin-bottom: 32px;
        border-radius: 16px; /* Bo góc to, hiện đại hơn */
        overflow: hidden;
        border: 1px solid #374151;
        background: #374151; /* Màu nền này lấp ló qua khe 'gap' tạo nét đứt đoạn đẹp mắt */
    }

    .image-item {
        position: relative;
        width: 100%;
        height: 100%;
        display: block;
    }

    .image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    /* --- TRƯỜNG HỢP 1 ẢNH --- */
    .grid-1 {
        grid-template-columns: 1fr;
    }
    .grid-1 .image-item img {
        max-height: 350px; /* Giới hạn để không bị bành trướng */
        height: auto; /* Chiều cao linh hoạt theo tỷ lệ thực của ảnh */
    }

    /* --- TRƯỜNG HỢP 2 ẢNH --- */
    .grid-2 {
        grid-template-columns: 1fr 1fr;
        aspect-ratio: 16/9;
        max-height: 350px;
    }

    /* --- TRƯỜNG HỢP 3 ẢNH --- */
    .grid-3 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr; /* Chia đều 2 hàng */
        aspect-ratio: 16/9;
        max-height: 400px;
    }
    .grid-3 .image-item:first-child {
        grid-row: span 2; /* Ảnh đầu tiên chiếm trọn cột trái */
    }

    /* --- TRẠNG THÁI KHI BẤM XEM TẤT CẢ ẢNH (>3 ảnh) --- */
    .grid-expanded {
        grid-template-columns: 1fr; /* Xổ dọc xuống cho dễ xem chi tiết */
        gap: 16px;
        background: transparent;
        border: none;
    }
    .grid-expanded .image-item {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #374151;
    }
    .grid-expanded img {
        max-height: none;
        height: auto; /* Cho phép ảnh bung hết cỡ tự nhiên */
    }

    /* --- OVERLAY "+X MORE" --- */
    .overlay-more {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        border: none;
        cursor: pointer;
        backdrop-filter: blur(4px); /* Làm mờ ảnh lót dưới, nhìn premium hơn */
        font-size: 18px;
        font-weight: 600;
        gap: 8px;
        transition: background 0.2s ease;
    }
    .overlay-more:hover {
        background: rgba(0, 0, 0, 0.3);
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

    /* LOADING & SIDEBAR */
    .sticky-sidebar {
        position: sticky;
        top: 24px;
    }
    .skeleton {
        font-size: 18px;
        color: #9ca3af;
        padding: 40px;
        text-align: center;
        background: #111827;
        border-radius: 16px;
        border: 1px dashed #374151;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
        .image-grid {
            max-width: 100%;
        } /* Mobile thì nên để ảnh full màn hình cho dễ nhìn */
    }
</style>
