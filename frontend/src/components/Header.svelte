<script>
    import { page } from "$app/state";
    let { currentUser } = $props();
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
                <span class="greeting">Hi, {currentUser.username}</span>
            {/if}
        </div>
    </div>
</header>

<style>
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
        padding: 15px 20px;
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
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.04);
        color: white;
        font-size: 14px;
        outline: none;
        transition:
            border 0.2s ease,
            width 0.25s ease;
    }

    .search input:focus {
        border: 1px solid #8b5cf6;
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

    /* ===== RESPONSIVE ===== */

    /* Tablet */
    @media (max-width: 1100px) {
        .main-nav {
            gap: 28px;
        }

        .search input {
            width: 180px;
        }
    }

    /* Small tablet */
    @media (max-width: 900px) {
        .main-nav {
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

        .brand {
            font-size: 16px;
        }
    }
</style>
