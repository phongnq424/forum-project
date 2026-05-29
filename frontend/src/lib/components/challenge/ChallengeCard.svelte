<script lang="ts">
    import type {
        Challenge,
        ChallengeDifficulty,
    } from "$lib/types/challenge.type";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let { challenge }: { challenge: Challenge } = $props();

    const difficultyColor: Record<
        ChallengeDifficulty,
        "success" | "warning" | "danger"
    > = {
        EASY: "success",
        MEDIUM: "warning",
        HARD: "danger",
    };
    const topics = $derived(challenge.topics ?? []);
</script>

<a href="/challenges/{challenge.id}" class="challenge-row">
    <div class="col status">
        {#if challenge.isSolved}
            <div class="check-circle" title="Solved">
                <Icon name="check" size={14} />
            </div>
        {:else}
            <div class="dot-placeholder"></div>
        {/if}
    </div>

    <div class="col title">
        <h3 class="challenge-title">{challenge.title}</h3>
        <div class="tag-list">
            {#each topics as topic}
                <Badge color="outline" size="sm">#{topic.name}</Badge>
            {/each}
        </div>
    </div>

    <div class="col difficulty">
        <Badge color={difficultyColor[challenge.difficulty]} size="md">
            {challenge.difficulty}
        </Badge>
    </div>

    <div class="col score">
        <span class="score-val">{challenge.point ?? 0}</span>
        <span class="score-label">pts</span>
    </div>
</a>

<style>
    .challenge-row {
        display: grid;
        grid-template-columns: 60px 1fr 120px 80px;
        gap: 20px;
        align-items: center;
        padding: 16px 20px;
        text-decoration: none;
        color: inherit;
        border-bottom: 1px solid #2a2e36;
        transition: background-color 0.2s ease;
    }

    /* Hiệu ứng hover chuẩn cho List: Chỉ sáng nền lên một chút */
    .challenge-row:hover {
        background-color: #2a2f3b;
    }

    .challenge-row:last-child {
        border-bottom: none;
    }

    /* --- Style cho các thành phần bên trong --- */
    .col {
        display: flex;
        align-items: center;
    }

    .col.status {
        justify-content: center;
    }

    .col.difficulty {
        justify-content: center;
    }

    .check-circle {
        width: 20px;
        height: 20px;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dot-placeholder {
        width: 6px;
        height: 6px;
        background: #374151;
        border-radius: 50%;
    }

    .title {
        flex-direction: column;
        align-items: flex-start;
    }

    .challenge-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #f3f4f6;
    }
    .challenge-row:hover .challenge-title {
        color: #6366f1;
    }

    .tag-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .col.score {
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .score-val {
        font-size: 18px;
        font-weight: 800;
        color: #e5e7eb;
        line-height: 1;
    }
    .score-label {
        font-size: 10px;
        text-transform: uppercase;
        color: #6b7280;
        font-weight: 600;
        letter-spacing: 0.05em;
    }

    @media (max-width: 640px) {
        .challenge-row {
            grid-template-columns: 30px auto 1fr auto;
            grid-template-rows: auto auto;
            gap: 12px 10px;
            padding: 16px;
        }

        .col.status {
            grid-column: 1;
            grid-row: 1;
        }

        .challenge-title {
            grid-column: 2 / 5;
            grid-row: 1;
        }

        .title {
            display: contents;
        }

        .col.difficulty {
            grid-column: 3;
            grid-row: 2;
            justify-content: flex-start;
        }

        .tag-list {
            grid-column: 2;
            grid-row: 2;
        }

        .col.score {
            grid-column: 4;
            grid-row: 2;
            justify-content: flex-end;
            flex-direction: row;
            gap: 4px;
        }
    }
</style>
