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

<header class="adm-testcase-page-header">
    <div>
        <button
            type="button"
            class="adm-testcase-back-btn"
            onclick={() => history.back()}
        >
            <Icon name="arrow-left" size={16} />
            Back
        </button>

        <h1 class="adm-testcase-page-title">
            {#if isBackendChallenge}
                Backend API Testcases
            {:else}
                DSA / SQL Testcases
            {/if}
        </h1>

        <p class="adm-testcase-page-description">
            {#if isBackendChallenge}
                Create scenario-based API tests. Each testcase can contain many
                request steps, and each step has its own score.
            {:else}
                Upload ZIP testcase files for standard input/output or SQL
                challenges.
            {/if}
        </p>

        {#if challenge}
            <p class="adm-testcase-challenge-title">
                Challenge: <strong>{challenge.title}</strong>
            </p>
        {/if}
    </div>
</header>
