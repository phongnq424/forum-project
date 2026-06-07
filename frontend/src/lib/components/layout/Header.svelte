<script lang="ts">
    import { page } from "$app/state";
    import { authState } from "$lib/states/auth.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Dropdown from "$lib/components/ui/Dropdown.svelte";
    import { authService } from "$lib/services/auth.service";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import NotificationBell from "$lib/components/notification/NotificationBell.svelte";

    let { data }: { data?: App.PageData } = $props();

    let currentUser = $derived(authState.user || data?.user);

    let navItems = $derived([
        { name: "Discuss", href: "/discuss" },
        { name: "Challenges", href: "/challenges" },
        { name: "Chat", href: "/chat" },
        { name: "Learn", href: "/visualizer" },
        ...(currentUser?.role === "ADMIN"
            ? [{ name: "Admin", href: "/admin" }]
            : []),
    ]);

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

    function closeHeaderDropdowns() {
        isUserMenuOpen = false;
        isMobileMenuOpen = false;
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
                    isUserMenuOpen = false;
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
                <NotificationBell closeOthers={closeHeaderDropdowns} />

                <div class="user-menu">
                    <span class="greeting">Hi, {currentUser.username}</span>

                    <button
                        class="avatar-btn"
                        aria-label="Toggle user menu"
                        onclick={(e) => {
                            e.stopPropagation();
                            isMobileMenuOpen = false;
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

                        {#if currentUser?.role === "ADMIN"}
                            <div class="dropdown-divider"></div>

                            <a
                                href="/admin"
                                onclick={() => (isUserMenuOpen = false)}
                            >
                                <Icon name="settings" size={16} /> Admin Panel
                            </a>
                        {/if}

                        <div class="dropdown-divider"></div>

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
    <div class="logout-message">
        Are you sure you want to log out of WINDFLOW?
    </div>

    {#snippet footer()}
        <div class="logout-actions">
            <Button
                variant="secondary"
                onclick={() => (isLogoutModalOpen = false)}
            >
                CANCEL
            </Button>

            <Button variant="danger" onclick={handleLogout} disabled={loading}>
                {loading ? "LOGGING OUT..." : "LOGOUT"}
            </Button>
        </div>
    {/snippet}
</Modal>

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
        padding: 10px 20px;
    }

    .nav {
        display: flex;
        align-items: center;
        gap: 36px;
    }

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
        color: #ffffff;
    }

    .main-nav {
        display: flex;
        gap: 42px;
        margin-left: 30px;
    }

    .main-nav a {
        position: relative;
        color: #cbd5e1;
        text-decoration: none;
        font-size: 15px;
        transition: color 0.2s ease;
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

    .main-nav a:hover {
        color: #ffffff;
    }

    .main-nav a:hover::after {
        width: 100%;
    }

    .search {
        position: relative;
        margin-left: auto;
        display: flex;
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
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
        z-index: 2;
    }

    .mobile-menu-wrapper {
        display: none;
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

    .mobile-nav-link {
        display: flex;
        align-items: center;
        color: #d1d5db;
        text-decoration: none;
    }

    .mobile-nav-link.active {
        color: #8b5cf6 !important;
        font-weight: 600;
        background: rgba(139, 92, 246, 0.1);
    }

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
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .join:hover {
        background: #8b5cf6;
        border-color: #8b5cf6;
    }

    .user-menu {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .greeting {
        font-size: 14px;
        color: #9ca3af;
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
        border: 2px solid rgba(139, 92, 246, 0.5);
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

    .dropdown-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
        margin: 6px 0;
    }

    .logout-btn {
        width: 100%;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        text-align: left;
    }

    .logout-message {
        padding: 10px 0;
        color: #d1d5db;
        font-size: 15px;
    }

    .logout-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        width: 100%;
    }

    @media (max-width: 1180px) {
        .greeting {
            display: none;
        }
    }

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

    @media (max-width: 900px) {
        .main-nav {
            display: none;
        }

        .mobile-menu-wrapper {
            display: block;
        }

        .search input {
            width: 160px;
        }

        .greeting {
            display: none;
        }
    }

    @media (max-width: 600px) {
        .search {
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

        .greeting {
            display: none;
        }
    }
</style>
