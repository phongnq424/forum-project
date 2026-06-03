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
        gap: 20px;
    }

    /* Header */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
    }

    .eyebrow {
        margin: 0 0 8px;
        color: #8b5cf6;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .page-header h1 {
        margin: 0;
        color: #f8fafc;
        font-size: 24px;
        line-height: 1.25;
        font-weight: 650;
        letter-spacing: -0.025em;
    }

    .page-header p:not(.eyebrow) {
        margin: 8px 0 0;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.55;
    }

    /* Stats */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
    }

    .stat-card,
    .panel {
        background: linear-gradient(180deg, #171a21 0%, #14171d 100%);
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 16px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
    }

    .stat-card {
        padding: 16px;
        min-height: 122px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: rgba(139, 92, 246, 0.12);
        color: #c4b5fd;
        font-size: 16px;
        margin-bottom: 16px;
        filter: saturate(0.8);
    }

    .label {
        margin: 0;
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 500;
    }

    .value {
        margin: 6px 0 0;
        color: #f8fafc;
        font-size: 24px;
        line-height: 1.15;
        font-weight: 650;
        letter-spacing: -0.03em;
    }

    /* Panel */
    .panel {
        padding: 18px;
    }

    .panel-header h2 {
        margin: 0;
        color: #f8fafc;
        font-size: 16px;
        line-height: 1.35;
        font-weight: 650;
        letter-spacing: -0.015em;
    }

    .panel-header p {
        margin: 6px 0 0;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.55;
    }

    /* Quick actions */
    .actions-grid {
        margin-top: 16px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
    }

    .action-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 14px;
        border-radius: 14px;
        text-decoration: none;
        background: rgba(15, 18, 24, 0.74);
        border: 1px solid rgba(148, 163, 184, 0.1);
        transition:
            background-color 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
    }

    .action-card:hover {
        background: rgba(139, 92, 246, 0.1);
        border-color: rgba(139, 92, 246, 0.28);
        transform: translateY(-1px);
    }

    .action-card strong {
        color: #e5e7eb;
        font-size: 13px;
        line-height: 1.4;
        font-weight: 600;
    }

    .action-card span {
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.45;
    }

    /* Alert */
    .alert {
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.22);
    }

    .empty-state {
        color: #94a3b8;
        text-align: center;
        font-size: 13px;
    }

    /* Responsive */
    @media (max-width: 1100px) {
        .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 640px) {
        .dashboard-page {
            gap: 16px;
        }

        .page-header h1 {
            font-size: 22px;
        }

        .stats-grid,
        .actions-grid {
            grid-template-columns: 1fr;
        }

        .stat-card {
            min-height: 108px;
        }
    }
</style>
