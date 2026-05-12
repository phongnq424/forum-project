<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import type {
        Challenge,
        ChallengeDifficulty,
    } from "$lib/types/challenge.type";

    let { challenge, difficultyColor } = $props<{
        challenge: Challenge;
        difficultyColor: Record<ChallengeDifficulty, string>;
    }>();
</script>

<header class="challenge-header">
    <Button variant="secondary" size="sm" onclick={() => history.back()}>
        <Icon name="arrow-left" size={18} />
    </Button>

    <div class="title-section">
        <div class="title-row">
            <h1>{challenge.title}</h1>
            {#if challenge.isSolved}
                <div class="solved-icon" title="You have solved this challenge">
                    <Icon name="check" size={20} />
                </div>
            {/if}
        </div>

        <div class="meta">
            <Badge color={difficultyColor[challenge.difficulty]} size="md">
                {challenge.difficulty}
            </Badge>

            <span class="dot">•</span>

            <div class="score-display">
                <span class="label">Your score:</span>
                <span class="value"
                    >{challenge.userStats?.highestScore || 0}</span
                >
            </div>
        </div>
    </div>
</header>

<style>
    .challenge-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .solved-icon {
        color: #10b981; /* Màu xanh success */
        display: flex;
        align-items: center;
        background: rgba(16, 185, 129, 0.1);
        padding: 4px;
        border-radius: 50%;
    }

    .title-section h1 {
        font-size: 24px;
        margin: 0;
        color: #f3f4f6;
    }

    .meta {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #9ca3af;
        font-size: 14px;
        margin-top: 4px;
    }

    .score-display {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .score-display .value {
        color: #6366f1; /* Màu highlight */
        font-weight: 700;
    }

    .dot {
        color: #4b5563;
    }
</style>
