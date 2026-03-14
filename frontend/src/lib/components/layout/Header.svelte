<script lang="ts">
    import { page } from "$app/state";
    import { authState } from "$lib/states/auth.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Dropdown from "$lib/components/ui/Dropdown.svelte";
    import { authService } from "$lib/services/auth.service";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    let { data }: { data?: App.PageData } = $props();

    // Quản lý menu tập trung
    const navItems = [
        { name: "Discuss", href: "/discuss" },
        { name: "Challenges", href: "/challenges" },
        { name: "Chat", href: "/chat" },
        { name: "Contact", href: "/contact" },
    ];

    let currentUser = $derived(authState.user || data?.user);

    // Avatar logic gọn gàng hơn
    let avatarUrl = $derived(currentUser?.avatar || null);
    let isUserMenuOpen = $state(false);
    let isMobileMenuOpen = $state(false);
    let isLogoutModalOpen = $state(false);
    let loading = $state(false);
    async function handleLogout(e: MouseEvent) {
        e.preventDefault();
        loading = true;
        try {
            await authService.logout();
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            loading = false;
        }
    }
</script>

<header class="site-header">
    <div class="container nav">
        <div class="mobile-menu-wrapper">
            <button
                class="hamburger-btn"
                aria-label="Open menu"
                onclick={(e) => {
                    e.stopPropagation();
                    isMobileMenuOpen = !isMobileMenuOpen;
                }}
            >
                <Icon name="menu" size={28} />
            </button>

            <Dropdown bind:show={isMobileMenuOpen} align="left">
                {#each navItems as item}
                    <a
                        href={item.href}
                        class="mobile-nav-link"
                        class:active={page.url.pathname.startsWith(item.href)}
                        onclick={() => (isMobileMenuOpen = false)}
                    >
                        {item.name}
                    </a>
                {/each}
            </Dropdown>
        </div>
        <a href="/" class="logo">
            <img src="/logo.png" alt="Windflow logo" class="logo-img" />
            <span class="brand">WINDFLOW</span>
        </a>

        <nav class="main-nav">
            {#each navItems as item}
                <a
                    href={item.href}
                    class:active={page.url.pathname.startsWith(item.href)}
                    aria-current={page.url.pathname.startsWith(item.href)
                        ? "page"
                        : undefined}
                >
                    {item.name}
                </a>
            {/each}
        </nav>

        <div class="search">
            <Icon name="search" size={16} class="search-icon" />
            <input
                type="text"
                placeholder="Search..."
                aria-label="Search site"
            />
        </div>

        <div class="auth">
            {#if !currentUser}
                <a href="/login" class="signin">Sign in</a>
                <a href="/register" class="join">Join now</a>
            {:else}
                <div class="notification-wrapper">
                    <button
                        class="notification-btn"
                        aria-label="3 new notifications"
                    >
                        <Icon name="bell" size={22} class="bell-icon" />
                        <span class="badge">3</span>
                    </button>
                </div>

                <div class="user-menu">
                    <span class="greeting">Hi, {currentUser.username}</span>

                    <button
                        class="avatar-btn"
                        aria-label="Toggle user menu"
                        onclick={(e) => {
                            e.stopPropagation(); // Cực kỳ quan trọng để không bị xung đột lúc click
                            isUserMenuOpen = !isUserMenuOpen;
                        }}
                    >
                        {#if avatarUrl}
                            <img
                                src={avatarUrl}
                                alt={currentUser.username}
                                class="avatar"
                            />
                        {:else}
                            <div class="avatar-placeholder">
                                {currentUser.username.charAt(0).toUpperCase()}
                            </div>
                        {/if}
                    </button>

                    <Dropdown bind:show={isUserMenuOpen} align="right">
                        <a
                            href="/profile"
                            onclick={() => (isUserMenuOpen = false)}
                        >
                            <Icon name="user" size={16} /> Profile
                        </a>
                        <a
                            href="/discuss/saved"
                            onclick={() => (isUserMenuOpen = false)}
                        >
                            <Icon name="bookmark" size={16} /> Saved Posts
                        </a>
                        <div
                            style="height: 1px; background: rgba(255,255,255,0.08); margin: 6px 0;"
                        ></div>
                        <button
                            class="logout-btn"
                            onclick={() => {
                                isUserMenuOpen = false;
                                isLogoutModalOpen = true;
                            }}
                        >
                            <Icon name="log-out" size={16} /> Logout
                        </button>
                    </Dropdown>
                </div>
            {/if}
        </div>
    </div>
</header>
<Modal bind:open={isLogoutModalOpen} title="Confirm Logout" maxWidth="400px">
    <div style="padding: 10px 0; color: #d1d5db; font-size: 15px;">
        Are you sure you want to log out of WINDFLOW?
    </div>
    {#snippet footer()}
        <div
            style="display: flex; gap: 12px; justify-content: flex-end; width: 100%;"
        >
            <Button
                variant="secondary"
                onclick={() => (isLogoutModalOpen = false)}>CANCEL</Button
            >
            <Button variant="danger" onclick={handleLogout} disabled={loading}>
                {loading ? "LOGGING OUT..." : "LOGOUT"}
            </Button>
        </div>
    {/snippet}
</Modal>

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
        display: flex; /* Thêm cái này để căn icon dễ hơn */
        align-items: center;
    }

    .search input {
        width: 220px;
        padding: 9px 14px 9px 38px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #1c1f26;
        color: white;
        font-size: 14px;
        font-family: poppins;
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
    :global(.search-icon) {
        /* Dùng :global nếu class truyền từ ngoài vào component con */
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
        z-index: 2;
    }
    /* --- MOBILE MENU --- */
    .mobile-menu-wrapper {
        display: none; /* Mặc định ẩn trên màn hình bự */
        position: relative;
    }

    .hamburger-btn {
        background: none;
        border: none;
        color: #e6e7ea;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .hamburger-btn:hover {
        color: #8b5cf6;
    }

    .mobile-nav-link.active {
        color: #8b5cf6 !important;
        font-weight: 600;
        background: rgba(139, 92, 246, 0.1);
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

    .avatar-btn {
        display: block;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        line-height: 0;
        transition: transform 0.2s ease;
    }

    .avatar-btn:hover {
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
    @media (max-width: 1180px) {
        .greeting {
            display: none;
        }
    }
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
        .mobile-menu-wrapper {
            display: block;
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
        .nav {
            gap: 12px;
        }

        .auth {
            gap: 8px;
            margin-left: auto;
        }
        .join {
            padding: 8px 12px;
        }
    }
</style>
