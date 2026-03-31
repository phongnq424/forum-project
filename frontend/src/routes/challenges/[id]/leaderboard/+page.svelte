<script lang="ts">
    import { page } from "$app/state";
    import Card from "$lib/components/ui/Card.svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import { submissionService } from "$lib/services/submission.service";
    import type { Leaderboard } from "$lib/types/leaderboard.type";
    import type { Challenge } from "$lib/types/challenge.type";

    // 1. State
    let challengeId = $derived(page.params.id);
    let leaderboard = $state<Leaderboard[]>([]);
    let challenge = $state<Challenge | null>(null);
    let isLoading = $state(true);

    // 2. Fetch Data
    async function loadLeaderboard() {
        if (!challengeId) return;
        isLoading = true;
        try {
            const [lbRes, challengeRes] = await Promise.all([
                submissionService.getLeaderboard(challengeId),
                challengeService.getById(challengeId),
            ]);

            leaderboard = lbRes;
            challenge = challengeRes;
        } catch (error) {
            console.error("Failed to load leaderboard:", error);
        } finally {
            isLoading = false;
        }
    }

    $effect(() => {
        loadLeaderboard();
    });

    const formatDateTime = (dateStr: any) => {
        if (!dateStr) return "—";

        const date = new Date(dateStr.toString());
        if (isNaN(date.getTime())) return "—";

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };
</script>

<div class="leaderboard-page">
    <header class="page-header">
        <a href="/challenges/{challengeId}" class="back-link">
            <Icon name="arrow-left" size={16} />
            Back to Challenge
        </a>
        <div class="title-section">
            <h1>Leaderboard</h1>
            {#if challenge}
                <p class="challenge-name">{challenge.title}</p>
            {/if}
        </div>
    </header>

    {#if isLoading}
        <div class="loading-state">Loading rankings...</div>
    {:else}
        {#if leaderboard.length >= 3}
            <div class="podium-container">
                <div class="podium-item silver">
                    <div class="rank-crown">2</div>
                    <Avatar
                        src={leaderboard[1].User.avatar || undefined}
                        name={leaderboard[1].User.username}
                        size="lg"
                    />
                    <span class="p-username"
                        >{leaderboard[1].User.username}</span
                    >
                    <span class="p-score">{leaderboard[1].score} pts</span>
                    <span class="p-time"
                        >{formatDateTime(leaderboard[1].submitted_at)}</span
                    >
                </div>

                <div class="podium-item gold">
                    <div class="rank-crown">
                        <Icon name="trophy" size={24} />
                    </div>
                    <Avatar
                        src={leaderboard[0].User.avatar || undefined}
                        name={leaderboard[0].User.username}
                        size="md"
                    />
                    <span class="p-username"
                        >{leaderboard[0].User.username}</span
                    >
                    <span class="p-score">{leaderboard[0].score} pts</span>
                    <span class="p-time"
                        >{formatDateTime(leaderboard[0].submitted_at)}</span
                    >
                </div>

                <div class="podium-item bronze">
                    <div class="rank-crown">3</div>
                    <Avatar
                        src={leaderboard[2].User.avatar || undefined}
                        name={leaderboard[2].User.username}
                        size="lg"
                    />
                    <span class="p-username"
                        >{leaderboard[2].User.username}</span
                    >
                    <span class="p-score">{leaderboard[2].score} pts</span>
                    <span class="p-time"
                        >{formatDateTime(leaderboard[2].submitted_at)}</span
                    >
                </div>
            </div>
        {/if}

        <Card padding="0px">
            <div class="table-responsive">
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 80px;"
                                >Rank</th
                            >
                            <th>User</th>
                            <th style="width: 120px;">Score</th>
                            <th style="width: 120px;">Language</th>
                            <th style="width: 180px;">Achieved At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each leaderboard as entry}
                            <tr class="rank-row">
                                <td class="text-center">
                                    <span
                                        class="rank-badge"
                                        class:top-rank={entry.rank <= 3}
                                    >
                                        #{entry.rank}
                                    </span>
                                </td>
                                <td>
                                    <div class="user-info">
                                        <Avatar
                                            src={entry.User.avatar || undefined}
                                            name={entry.User.username}
                                            size="sm"
                                        />
                                        <span class="username"
                                            >{entry.User.username}</span
                                        >
                                    </div>
                                </td>
                                <td
                                    ><span class="score-text"
                                        >{entry.score} pts</span
                                    ></td
                                >
                                <td>
                                    {#if entry.language}
                                        <Badge color="outline" size="sm"
                                            >{entry.language}</Badge
                                        >
                                    {:else}
                                        <span class="secondary-text">—</span>
                                    {/if}
                                </td>
                                <td>
                                    <span class="secondary-text">
                                        {formatDateTime(entry.submitted_at)}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </Card>
    {/if}
</div>

<style>
    .leaderboard-page {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    .page-header {
        margin-bottom: 40px;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #9ca3af;
        text-decoration: none;
        font-size: 0.875rem;
        margin-bottom: 16px;
    }

    .back-link:hover {
        color: #6366f1;
    }

    .title-section h1 {
        font-size: 2rem;
        color: white;
        margin: 0;
    }

    .challenge-name {
        color: #818cf8;
        font-size: 1.1rem;
        margin-top: 4px;
    }

    /* Podium */
    .podium-container {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 48px;
    }

    .podium-item {
        background: #1e222b;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        flex: 1;
        max-width: 180px;
    }

    .gold {
        order: 2;
        transform: translateY(-20px);
        border-color: rgba(234, 179, 8, 0.3);
        background: linear-gradient(
            180deg,
            rgba(234, 179, 8, 0.05) 0%,
            #1e222b 100%
        );
    }
    .silver {
        order: 1;
    }
    .bronze {
        order: 3;
    }

    .rank-crown {
        font-weight: 800;
        color: #6b7280;
        font-size: 1.2rem;
    }
    .gold .rank-crown {
        color: #fbbf24;
    }

    .p-username {
        font-weight: 600;
        color: #f3f4f6;
        font-size: 0.95rem;
    }
    .p-score {
        color: #818cf8;
        font-size: 0.85rem;
        font-weight: 500;
    }

    /* Table */
    .table-responsive {
        overflow-x: auto;
    }
    .leaderboard-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    .leaderboard-table th {
        padding: 16px 24px;
        white-space: nowrap;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: #6b7280;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .rank-row {
        border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    }
    .rank-row td {
        padding: 16px 24px;
        vertical-align: middle;
    }

    .rank-badge {
        font-weight: 600;
        color: #4b5563;
    }
    .top-rank {
        color: #818cf8;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .username {
        color: #e5e7eb;
    }
    .score-text {
        color: #818cf8;
        font-weight: 600;
    }
    .secondary-text {
        color: #4b5563;
    }
    .text-center {
        text-align: center;
    }

    .loading-state {
        text-align: center;
        padding: 100px;
        color: #6b7280;
    }
    .p-time {
        font-size: 0.7rem;
        color: #6b7280;
        margin-top: -4px;
    }
    @media (max-width: 600px) {
        .leaderboard-page {
            padding: 20px 12px; /* Giảm padding lề trang */
        }

        .title-section h1 {
            font-size: 1.5rem; /* Thu nhỏ tiêu đề */
        }

        .podium-container {
            gap: 8px;
            margin-bottom: 24px;
        }

        .podium-item {
            padding: 12px 4px;
        }

        /* Ẩn bớt giờ phút trên podium mobile cho đỡ rối */
        .p-time {
            display: none;
        }

        .gold {
            transform: translateY(
                -10px
            ); /* Giảm độ cao vượt trội của Gold trên mobile */
        }

        /* Table: Ẩn bớt cột không quan trọng trên mobile để tránh scroll ngang quá nhiều */
        .leaderboard-table th:nth-child(4), /* Cột Language */
        .leaderboard-table td:nth-child(4) {
            display: none;
        }

        /* Thu nhỏ padding của table */
        .leaderboard-table td,
        .leaderboard-table th {
            padding: 12px 8px;
            font-size: 0.8rem;
        }

        .rank-badge {
            font-size: 0.75rem;
        }
    }
</style>
