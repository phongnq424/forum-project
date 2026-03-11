<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let { completed = 1, total = 3 } = $props();

    const hotChallenges = [
        {
            id: "101",
            title: "LRU Cache Implementation",
            solveCount: 1205,
            difficulty: "Hard",
        },
        {
            id: "102",
            title: "Optimize SQL Joins",
            solveCount: 850,
            difficulty: "Medium",
        },
    ];

    const recentActivities = [
        { user: "anh_dev", task: "Two Sum", time: "2m ago" },
        { user: "linh_da", task: "Merge Intervals", time: "5m ago" },
    ];

    let progress = $derived(total > 0 ? (completed / total) * 100 : 0);
</script>

<aside class="challenge-sidebar">
    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="trending-up" size={16} class="heading-icon" /> Personal Goal
        </h3>
        <div class="goal-minimal">
            <div class="goal-text">
                <span class="count">{completed}/{total}</span>
                <span class="label">tasks done</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" style:width="{progress}%"></div>
            </div>
        </div>
    </Card>

    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="flame" size={16} class="heading-icon" /> Hot Challenges
        </h3>
        <div class="hot-list">
            {#each hotChallenges as challenge, i}
                <a href="/challenges/{challenge.id}" class="hot-item">
                    <span class="index">0{i + 1}</span>
                    <div class="hot-info">
                        <p class="hot-title">{challenge.title}</p>
                        <p class="hot-meta">
                            {challenge.solveCount} solved •
                            <span
                                class="d-text {challenge.difficulty.toLowerCase()}"
                                >{challenge.difficulty}</span
                            >
                        </p>
                    </div>
                </a>
            {/each}
        </div>
    </Card>

    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="bell" size={16} class="heading-icon" /> Live Activity
        </h3>
        <div class="activity-list">
            {#each recentActivities as act}
                <div class="activity-item">
                    <div class="status-dot"></div>
                    <p class="activity-msg">
                        <span class="user">{act.user}</span> solved
                        <span class="task">{act.task}</span>
                        <span class="time">{act.time}</span>
                    </p>
                </div>
            {/each}
        </div>
    </Card>
</aside>

<style>
    .challenge-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px; /* Đồng bộ gap với discuss-sidebar */
    }

    .sidebar-heading {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px; /* Tăng từ 12 lên 14 cho giống bên Post */
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #6b7280;
        margin-bottom: 20px;
    }

    /* Personal Goal Minimal */
    .goal-minimal {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .goal-text {
        display: flex;
        align-items: baseline;
        gap: 6px;
    }
    .goal-text .count {
        font-size: 20px;
        font-weight: 700;
        color: #e5e7eb;
    } /* Bỏ màu tím chói */
    .goal-text .label {
        font-size: 13px;
        color: #6b7280;
    }
    .progress-track {
        height: 4px;
        background: #2a2e36;
        border-radius: 2px;
    }
    .progress-fill {
        height: 100%;
        background: #6366f1;
        border-radius: 2px;
        transition: width 0.3s ease;
    }

    /* Hot Challenges - Clone style của Trending */
    .hot-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .hot-item {
        display: flex;
        gap: 15px;
        text-decoration: none;
        color: inherit;
    }
    .index {
        font-size: 20px;
        font-weight: 800;
        color: #2a2e36;
        line-height: 1;
    }
    .hot-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        line-height: 1.4;
        color: #e5e7eb;
    }
    .hot-meta {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
    }
    .d-text.hard {
        color: #ef4444;
        opacity: 0.8;
    }
    .d-text.medium {
        color: #f59e0b;
        opacity: 0.8;
    }

    /* Live Activity Minimal */
    .activity-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .activity-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
    }
    .status-dot {
        width: 6px;
        height: 6px;
        background: #4b5563;
        border-radius: 50%;
        margin-top: 6px;
    }
    .activity-msg {
        font-size: 13px;
        margin: 0;
        color: #9ca3af;
        line-height: 1.5;
    }
    .user {
        color: #e5e7eb;
        font-weight: 500;
    }
    .task {
        color: #6366f1;
    }
    .time {
        display: block;
        font-size: 11px;
        color: #4b5563;
        margin-top: 2px;
    }

    :global(.heading-icon) {
        color: #6366f1;
        opacity: 0.8;
    }

    @media (max-width: 900px) {
        .challenge-sidebar {
            display: none;
        }
    }
</style>
