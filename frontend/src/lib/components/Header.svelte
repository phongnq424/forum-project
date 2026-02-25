<script lang="ts">
    import { page } from "$app/state";
    import { user } from "$lib/stores/auth.store";

    let { data }: { data?: App.PageData } = $props();

    // Dùng $derived để Svelte 5 tự động theo dõi và ưu tiên lấy dữ liệu mới nhất từ store $user
    let currentUser = $derived($user || data?.user);
</script>

<header class="site-header">
    <div class="container nav">
        <a href="/" class="logo">
            <img src="/logo.png" alt="Windflow logo" class="logo-img" />
            <span class="brand">WINDFLOW</span>
        </a>

        <nav class="main-nav">
            <a
                href="/discuss"
                class:active={page.url.pathname.startsWith("/discuss")}
            >
                Discuss
            </a>

            <a
                href="/challenges"
                class:active={page.url.pathname.startsWith("/challenges")}
            >
                Challenges
            </a>

            <a
                href="/chat"
                class:active={page.url.pathname.startsWith("/chat")}
            >
                Chat
            </a>

            <a
                href="/contact"
                class:active={page.url.pathname.startsWith("/contact")}
            >
                Contact
            </a>
        </nav>

        <div class="search">
            <svg viewBox="0 0 26 26" class="search-icon">
                <path
                    d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
            <input type="text" placeholder="Search..." />
        </div>

        <div class="auth">
            {#if !currentUser}
                <a href="/login" class="signin">Sign in</a>
                <a href="/register" class="join">Join now</a>
            {:else}
                <div class="notification-wrapper">
                    <button class="notification-btn" aria-label="Notifications">
                        <svg viewBox="0 0 24 24" class="bell-icon">
                            <path
                                d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <path
                                d="M13.73 21a2 2 0 01-3.46 0"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <span class="badge">3</span>
                    </button>
                </div>
                <div class="user-menu">
                    <span class="greeting">Hi, {currentUser.username}</span>
                    <a href="/profile" class="avatar-link">
                        {#if currentUser.avatar}
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.username}
                                class="avatar"
                            />
                        {:else}
                            <div class="avatar-placeholder">
                                {currentUser.username.charAt(0).toUpperCase()}
                            </div>
                        {/if}
                    </a>
                </div>
            {/if}
        </div>
    </div>
</header>

<style>
    /* ... (Giữ nguyên toàn bộ phần CSS của bạn ở đây) ... */
    .site-header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #282828;
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(139, 92, 246, 0.3);
        z-index: 100;
    }

    .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 10px 20px;
    }

    .nav {
        display: flex;
        align-items: center;
        gap: 36px;
    }

    /* LOGO */
    .logo {
        display: flex;
        align-items: center;
        gap: 14px;
        text-decoration: none;
        color: #e6e7ea;
    }

    .logo-img {
        height: 38px;
        width: auto;
        display: block;
    }

    .brand {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: none;
        color: #ffffff;
    }

    /* NAV */
    .main-nav {
        display: flex;
        gap: 42px;
        margin-left: 30px;
    }

    .main-nav a {
        position: relative;
    }
    .main-nav a.active {
        color: #8b5cf6;
    }

    .main-nav a.active::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -6px;
        width: 100%;
        height: 2px;
        background: #8b5cf6;
    }

    .main-nav a::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -6px;
        width: 0%;
        height: 2px;
        background: #8b5cf6;
        transition: width 0.25s ease;
    }

    .main-nav a:hover::after {
        width: 100%;
    }

    /* SEARCH */
    .search {
        position: relative;
        margin-left: auto;
    }

    .search input {
        width: 220px;
        padding: 9px 14px 9px 38px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #1c1f26;
        color: white;
        font-size: 14px;
        outline: none;
        transition:
            width 0.25s ease,
            border 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
    }

    .search input:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
        background: #20232b;
        width: 260px;
    }
    .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: #9ca3af;
        pointer-events: none;
    }

    /* AUTH */
    .auth {
        display: flex;
        align-items: center;
        gap: 36px;
        margin-left: 24px;
    }

    .signin {
        font-size: 15px;
        color: #cbd5e1;
        text-decoration: none;
        position: relative;
        transition: color 0.2s ease;
    }
    .signin::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -4px;
        width: 0%;
        height: 2px;
        background: #8b5cf6;
        transition: width 0.25s ease;
    }

    .signin:hover {
        color: #8b5cf6;
    }

    .signin:hover::after {
        width: 100%;
    }

    .join {
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
        font-weight: 600;
        font-size: 14px;
        color: white;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .join:hover {
        background: #8b5cf6;
        border-color: #8b5cf6;
    }

    .greeting {
        font-size: 14px;
        color: #9ca3af;
    }
    /* CSS CHO AVATAR */
    .user-menu {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .avatar-link {
        display: block;
        line-height: 0;
        transition: transform 0.2s ease;
    }

    .avatar-link:hover {
        transform: scale(1.05);
    }

    .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(139, 92, 246, 0.5); /* Viền tím mờ */
        background: #1c1f26;
    }

    .avatar-placeholder {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        border: 2px solid rgba(255, 255, 255, 0.1);
    }
    .notification-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .notification-btn {
        background: none;
        border: none;
        padding: 8px;
        color: #9ca3af;
        cursor: pointer;
        position: relative;
        transition:
            color 0.2s ease,
            transform 0.1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .notification-btn:hover {
        color: #8b5cf6; /* Tím khi hover */
        transform: translateY(-1px);
    }

    .bell-icon {
        width: 22px;
        height: 22px;
    }

    .badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: #ef4444; /* Màu đỏ thông báo */
        color: white;
        font-size: 10px;
        font-weight: 700;
        min-width: 16px;
        height: 16px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid #282828; /* Viền trùng màu header để tách khối */
    }

    /* ===== RESPONSIVE ===== */

    /* Tablet */
    @media (max-width: 1100px) {
        .main-nav {
            gap: 28px;
        }

        .search input {
            width: 180px;
        }
        .greeting {
            display: none;
        }
    }

    /* Small tablet */
    @media (max-width: 900px) {
        .main-nav {
            display: none;
        }
        .greeting {
            display: none;
        }

        .search input {
            width: 160px;
        }
    }

    /* Mobile */
    @media (max-width: 600px) {
        .search {
            display: none;
        }
        .greeting {
            display: none;
        }

        .brand {
            font-size: 16px;
        }
    }
</style>
