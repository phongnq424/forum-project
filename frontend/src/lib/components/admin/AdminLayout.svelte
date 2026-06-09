<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import type { Snippet } from "svelte";

    import { authState } from "$lib/states/auth.svelte";
    import { authService } from "$lib/services/auth.service";
    import Button from "$lib/components/ui/Button.svelte";

    let { children } = $props<{ children: Snippet }>();

    let isOpen = $state(false);
    let loggingOut = $state(false);

    const menuItems = [
        { label: "Dashboard", href: "/admin", description: "Overview" },
        {
            label: "Users",
            href: "/admin/users",
            description: "Accounts & roles",
        },
        {
            label: "Categories & Topics",
            href: "/admin/categories",
            description: "Forum structure",
        },
        {
            label: "Challenges",
            href: "/admin/challenges",
            description: "Coding tasks",
        },
        {
            label: "Reports",
            href: "/admin/reports",
            description: "Moderation queue",
        },
        {
            label: "Groups",
            href: "/admin/groups",
            description: "Manage chat groups",
        },
    ];

    function isActive(href: string) {
        if (href === "/admin") return $page.url.pathname === "/admin";
        return $page.url.pathname.startsWith(href);
    }

    async function handleLogout() {
        loggingOut = true;
        try {
            await authService.logout();
            authState.clearAuth();
            await goto("/login");
        } finally {
            loggingOut = false;
        }
    }
</script>

<div class="admin-panel">
    <div class="admin-mobile-bar">
        <div>
            <h1>Admin Panel</h1>
            <p>Windflow Management Console</p>
        </div>

        <button
            type="button"
            class="menu-toggle"
            onclick={() => (isOpen = !isOpen)}
        >
            {isOpen ? "Close" : "Menu"}
        </button>
    </div>

    <div class="admin-grid">
        <aside class:open={isOpen} class="sidebar">
            <div class="sidebar-header">
                <div class="brand-mark">W</div>
                <div>
                    <h2>Windflow</h2>
                    <p>Admin Console</p>
                </div>
            </div>

            <nav class="menu" aria-label="Admin navigation">
                {#each menuItems as item (item.href)}
                    <a
                        href={item.href}
                        class="menu-item"
                        class:active={isActive(item.href)}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        onclick={() => (isOpen = false)}
                    >
                        <span class="menu-label">{item.label}</span>
                        <span class="menu-description">{item.description}</span>
                    </a>
                {/each}
            </nav>
        </aside>

        <main class="admin-content">
            {@render children()}
        </main>
    </div>
</div>

<style>
    .admin-panel {
        width: 100%;
        min-height: 72vh;
        border-radius: 24px;
        overflow: hidden;
        background: #0f1115;
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #e5e7eb;
    }

    .admin-grid {
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        min-height: 72vh;
    }

    .sidebar {
        background: #181b22;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        min-height: 72vh;
    }

    .sidebar-header {
        padding: 22px;
        display: flex;
        gap: 12px;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand-mark {
        width: 40px;
        height: 40px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        color: white;
        font-weight: 900;
    }

    .sidebar-header h2 {
        margin: 0;
        color: #ffffff;
        font-size: 20px;
        font-weight: 800;
    }

    .sidebar-header p {
        margin: 4px 0 0;
        color: #9ca3af;
        font-size: 13px;
    }

    .menu {
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
    }

    .menu-item {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 11px 14px 11px 16px;
        border-radius: 13px;
        color: #aeb6c2;
        text-decoration: none;
        background: transparent;
        border: 1px solid transparent;
        transition:
            background-color 0.16s ease,
            border-color 0.16s ease,
            color 0.16s ease,
            transform 0.16s ease;
    }

    .menu-label {
        font-size: 13.5px;
        line-height: 1.35;
        font-weight: 500;
        letter-spacing: -0.01em;
        color: inherit;
    }

    .menu-description {
        font-size: 11.5px;
        line-height: 1.35;
        font-weight: 400;
        color: #747d8c;
    }

    .menu-item:hover {
        background: rgba(255, 255, 255, 0.045);
        color: #f3f4f6;
    }

    .menu-item:hover .menu-description {
        color: #9ca3af;
    }

    .menu-item.active {
        background: rgba(139, 92, 246, 0.16);
        border-color: rgba(139, 92, 246, 0.22);
        color: #ffffff;
    }

    .menu-item.active::before {
        content: "";
        position: absolute;
        left: 7px;
        top: 11px;
        bottom: 11px;
        width: 3px;
        border-radius: 999px;
        background: #8b5cf6;
    }

    .menu-item.active .menu-label {
        font-weight: 700;
    }

    .menu-item.active .menu-description {
        color: #c4b5fd;
    }

    .menu-item:focus-visible {
        outline: 2px solid rgba(139, 92, 246, 0.65);
        outline-offset: 2px;
    }

    .admin-content {
        min-width: 0;
        padding: 28px;
        background: #0f1115;
    }

    .admin-mobile-bar {
        display: none;
        padding: 16px;
        background: #181b22;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        justify-content: space-between;
        align-items: center;
    }

    .admin-mobile-bar h1 {
        margin: 0;
        color: #ffffff;
        font-size: 18px;
    }

    .admin-mobile-bar p {
        margin: 4px 0 0;
        color: #9ca3af;
        font-size: 12px;
    }

    .menu-toggle {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #20232b;
        color: #ffffff;
        border-radius: 10px;
        padding: 8px 12px;
        cursor: pointer;
    }

    @media (max-width: 767px) {
        .admin-mobile-bar {
            display: flex;
        }

        .admin-grid {
            grid-template-columns: 1fr;
        }

        .sidebar {
            display: none;
            min-height: auto;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sidebar.open {
            display: flex;
        }

        .admin-content {
            padding: 16px;
        }
    }
</style>
