<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import type { Challenge } from "$lib/types/challenge.type";
    import type { Leaderboard } from "$lib/types/leaderboard.type";
    import { submissionStatusColor } from "$lib/constants/submissionStatusColor";

    interface PartialSubmission {
        id: string;
        status: string;
        score: number;
        submitted_at: Date | string;
    }

    let {
        challenge,
        recentSubmissions = [],
        leaderboard = [],
    } = $props<{
        challenge: Challenge;
        recentSubmissions?: PartialSubmission[];
        leaderboard?: Leaderboard[];
    }>();

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
        });
    };
</script>

<aside class="sidebar-container">
    <Card padding="20px">
        <h3 class="sidebar-title">Challenge Info</h3>

        <div class="info-row">
            <span class="label">Total Submissions</span>
            <span class="val">{challenge.userStats?.totalSubmissions || 0}</span
            >
        </div>

        <div class="info-row">
            <span class="label">Points</span>
            <span class="val highlight">{challenge.point || 0}</span>
        </div>

        <div class="info-row">
            <span class="label">Time Limit</span>
            <span class="val">{challenge.time_limit} ms</span>
        </div>

        <div class="info-row">
            <span class="label">Memory Limit</span>
            <span class="val">{challenge.memory_limit} MB</span>
        </div>

        <div class="info-row">
            <span class="label">Type</span>
            <span class="val">{challenge.type}</span>
        </div>

        {#if challenge.topics && challenge.topics.length > 0}
            <div class="tags-section">
                <span class="tiny-label">Topics</span>
                <div class="tags-list">
                    {#each challenge.topics as topic}
                        <Badge color="outline" size="sm">{topic.name}</Badge>
                    {/each}
                </div>
            </div>
        {/if}
    </Card>

    {#if recentSubmissions.length > 0 || leaderboard.length > 0}
        <Card padding="20px">
            {#if recentSubmissions.length > 0}
                <section class="nested-section">
                    <h3 class="section-subtitle">Recent Submissions</h3>
                    <div class="list-wrapper">
                        {#each recentSubmissions.slice(0, 5) as sub}
                            <div class="list-item-clean">
                                <div class="item-left">
                                    <span
                                        class="status-dot {submissionStatusColor[
                                            sub.status
                                        ]}"
                                    ></span>
                                    <span class="text-xs secondary-text"
                                        >{formatDate(sub.submitted_at)} • {sub.status}</span
                                    >
                                </div>
                                <span class="text-sm weight-500"
                                    >{sub.score} pt</span
                                >
                            </div>
                        {/each}
                    </div>
                </section>
            {/if}

            {#if recentSubmissions.length > 0 && leaderboard.length > 0}
                <div class="section-divider"></div>
            {/if}

            {#if leaderboard.length > 0}
                <section class="nested-section">
                    <div class="header-with-action">
                        <h3 class="section-subtitle">Top 5 Leaderboard</h3>
                    </div>

                    <div class="list-wrapper">
                        {#each leaderboard.slice(0, 5) as item}
                            {@const user = item.User ?? item.user}

                            <div class="list-item-clean">
                                <div class="item-left">
                                    <span class="rank-tag"
                                        >#{item.rank ?? "-"}</span
                                    >

                                    <Avatar
                                        src={user?.avatar || undefined}
                                        name={user?.username ||
                                            user?.fullname ||
                                            "Unknown user"}
                                        size="sm"
                                    />

                                    <span class="text-sm username-text">
                                        {user?.username ||
                                            user?.fullname ||
                                            "Unknown user"}
                                    </span>
                                </div>

                                <span class="text-sm weight-500 color-indigo">
                                    {item.score ?? 0}
                                </span>
                            </div>
                        {/each}
                    </div>

                    <a
                        href="/challenges/{challenge.id}/leaderboard"
                        class="view-more-btn"
                    >
                        View Full Leaderboard
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="m9 18 6-6-6-6" /></svg
                        >
                    </a>
                </section>
            {/if}
        </Card>
    {/if}
</aside>

<style>
    .sidebar-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    /* Challenge Info Styling */
    .sidebar-title {
        font-size: 0.95rem;
        margin-bottom: 16px;
        color: #f3f4f6;
        font-weight: 600;
        letter-spacing: -0.01em;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .info-row:last-of-type {
        border-bottom: none;
    }

    .label {
        color: #9ca3af;
        font-size: 0.875rem;
    }
    .val {
        color: #f9fafb;
        font-weight: 500;
        font-size: 0.875rem;
    }
    .highlight {
        color: #818cf8 !important;
    }

    .tags-section {
        margin-top: 12px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .tiny-label {
        display: block;
        margin-bottom: 10px;
        color: #6b7280;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    /* Nested Sections Styling */
    .section-subtitle {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        margin-bottom: 12px;
        font-weight: 600;
    }

    .section-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.05);
        margin: 20px 0;
    }

    .list-wrapper {
        display: flex;
        flex-direction: column;
    }

    .list-item-clean {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
    }

    .item-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .view-more-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        margin-top: 12px;
        padding: 8px;
        width: 100%;
        font-size: 0.75rem;
        color: #9ca3af;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.2s;
        border: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.02);
    }

    .view-more-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #f3f4f6;
    }

    /* Visual Elements */
    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
    .bg-green {
        background: #10b981;
    }

    .bg-red {
        background: #ef4444;
    }

    .bg-orange {
        background: #f59e0b;
    }

    .bg-blue {
        background: #3b82f6;
    }

    .bg-purple {
        background: #8b5cf6;
    }

    .bg-yellow {
        background: #eab308;
    }

    .bg-gray {
        background: #6b7280;
    }

    .rank-tag {
        font-size: 0.75rem;
        color: #4b5563;
        width: 20px;
        font-weight: 600;
    }

    .secondary-text {
        color: #6b7280;
    }
    .username-text {
        color: #d1d5db;
        font-weight: 400;
    }
    .color-indigo {
        color: #818cf8;
    }
    .weight-500 {
        font-weight: 500;
    }

    .text-xs {
        font-size: 0.75rem;
    }
    .text-sm {
        font-size: 0.875rem;
    }
</style>
