<script lang="ts">
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { Challenge } from "$lib/types/challenge.type";

    let {
        challenge,
        isBackendChallenge,
    }: {
        challenge: Challenge | null;
        isBackendChallenge: boolean;
    } = $props();
</script>

<header class="page-header">
    <div>
        <button class="back-btn" onclick={() => history.back()}>
            <Icon name="arrow-left" size={16} />
            Back
        </button>

        <h1>
            {#if isBackendChallenge}
                Backend API Testcases
            {:else}
                DSA / SQL Testcases
            {/if}
        </h1>

        <p>
            {#if isBackendChallenge}
                Create scenario-based API tests. Each testcase can contain many
                request steps, and each step has its own score.
            {:else}
                Upload ZIP testcase files for standard input/output or SQL
                challenges.
            {/if}
        </p>

        {#if challenge}
            <p class="challenge-title">
                Challenge: <strong>{challenge.title}</strong>
            </p>
        {/if}
    </div>
</header>

<style>
    .page-header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: flex-start;
        margin-bottom: 24px;
    }

    .back-btn {
        border: none;
        background: transparent;
        color: #9ca3af;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 0;
        margin-bottom: 12px;
    }

    h1 {
        margin: 0;
        color: #f3f4f6;
        font-size: 28px;
    }

    p {
        color: #9ca3af;
        margin: 8px 0 0;
        max-width: 760px;
        line-height: 1.5;
    }

    .challenge-title {
        color: #6b7280;
        font-size: 14px;
    }

    .challenge-title strong {
        color: #d1d5db;
    }
</style>
