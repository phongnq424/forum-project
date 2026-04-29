<script lang="ts">
    import { onMount } from "svelte";

    import { adminUserService } from "$lib/services/admin-user.service";
    import { categoryService } from "$lib/services/category.service";
    import { adminTopicService } from "$lib/services/topic.service";
    import { challengeService } from "$lib/services/challenge.service";

    type Stats = {
        totalUsers: number;
        totalCategories: number;
        totalTopics: number;
        totalChallenges: number;
        totalPosts: number;
    };

    let stats = $state<Stats>({
        totalUsers: 0,
        totalCategories: 0,
        totalTopics: 0,
        totalChallenges: 0,
        totalPosts: 0,
    });

    let loading = $state(false);
    let error = $state("");

    onMount(loadStats);

    async function loadStats() {
        loading = true;
        error = "";

        try {
            const [
                usersResult,
                categoriesResult,
                topicsResult,
                challengesResult,
            ] = await Promise.all([
                adminUserService.listUsers({ page: 1, limit: 1 }),
                categoryService.listCategories({ page: 1, limit: 1 }),
                adminTopicService.listTopics({ page: 1, limit: 1 }),
                challengeService.listChallenges({ page: 1, limit: 1 }),
            ]);
            console.log("Stats results:", {
                usersResult,
                categoriesResult,
                topicsResult,
                challengesResult,
            });
            stats = {
                totalUsers: usersResult.pagination.total,
                totalCategories: categoriesResult.pagination.total,
                totalTopics: topicsResult.pagination.total,
                totalChallenges: challengesResult.pagination.total,
                totalPosts: 0,
            };
        } catch (err) {
            console.error("Failed to fetch stats:", err);
            error = "Failed to load dashboard statistics";
        } finally {
            loading = false;
        }
    }
</script>

<div class="dashboard-page">
    <div class="page-header">
        <div>
            <p class="eyebrow">Admin Overview</p>
            <h1>Dashboard</h1>
            <p>Monitor forum modules and jump into common admin tasks.</p>
        </div>
    </div>

    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    {#if loading}
        <div class="panel empty-state">Loading stats...</div>
    {:else}
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">👥</span>
                <p class="label">Total Users</p>
                <p class="value">{stats.totalUsers}</p>
            </div>

            <div class="stat-card">
                <span class="icon">📁</span>
                <p class="label">Categories</p>
                <p class="value">{stats.totalCategories}</p>
            </div>

            <div class="stat-card">
                <span class="icon">🏷️</span>
                <p class="label">Topics</p>
                <p class="value">{stats.totalTopics}</p>
            </div>

            <div class="stat-card">
                <span class="icon">🎯</span>
                <p class="label">Challenges</p>
                <p class="value">{stats.totalChallenges}</p>
            </div>

            <div class="stat-card">
                <span class="icon">📝</span>
                <p class="label">Posts</p>
                <p class="value">{stats.totalPosts}</p>
            </div>
        </div>
    {/if}

    <div class="panel">
        <div class="panel-header">
            <div>
                <h2>Quick Actions</h2>
                <p>Go directly to the most-used admin sections.</p>
            </div>
        </div>

        <div class="actions-grid">
            <a href="/admin/users" class="action-card">
                <strong>Manage Users</strong>
                <span>Accounts, roles and status</span>
            </a>

            <a href="/admin/categories" class="action-card">
                <strong>Manage Categories</strong>
                <span>Category and topic structure</span>
            </a>

            <a href="/admin/topics" class="action-card">
                <strong>Manage Topics</strong>
                <span>Discussion topic list</span>
            </a>

            <a href="/admin/challenges" class="action-card">
                <strong>Manage Challenges</strong>
                <span>Coding challenge catalog</span>
            </a>

            <a href="/admin/reports" class="action-card">
                <strong>View Reports</strong>
                <span>Moderation queue</span>
            </a>
        </div>
    </div>
</div>

<style>
    .dashboard-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #a78bfa;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .page-header h1 {
        margin: 0;
        color: #ffffff;
        font-size: 30px;
        font-weight: 800;
    }

    .page-header p:not(.eyebrow) {
        margin: 8px 0 0;
        color: #9ca3af;
        font-size: 14px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
    }

    .stat-card,
    .panel {
        background: #181b22;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
    }

    .stat-card {
        padding: 18px;
    }

    .icon {
        display: inline-grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 14px;
        background: rgba(139, 92, 246, 0.16);
        margin-bottom: 14px;
    }

    .label {
        margin: 0;
        font-size: 13px;
        color: #9ca3af;
    }

    .value {
        margin: 6px 0 0;
        font-size: 30px;
        font-weight: 800;
        color: #ffffff;
    }

    .panel {
        padding: 20px;
    }

    .panel-header h2 {
        margin: 0;
        color: #ffffff;
        font-size: 20px;
        font-weight: 800;
    }

    .panel-header p {
        margin: 6px 0 0;
        color: #9ca3af;
        font-size: 14px;
    }

    .actions-grid {
        margin-top: 18px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
    }

    .action-card {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 15px;
        border-radius: 14px;
        text-decoration: none;
        background: #111318;
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
    }

    .action-card:hover {
        background: rgba(139, 92, 246, 0.12);
        border-color: rgba(139, 92, 246, 0.38);
        transform: translateY(-2px);
    }

    .action-card strong {
        color: #f9fafb;
        font-size: 14px;
    }

    .action-card span {
        color: #9ca3af;
        font-size: 13px;
    }

    .alert {
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 14px;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.12);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .empty-state {
        color: #9ca3af;
        text-align: center;
    }

    @media (max-width: 1100px) {
        .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 640px) {
        .stats-grid,
        .actions-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
