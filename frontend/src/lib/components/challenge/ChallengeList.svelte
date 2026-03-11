<script lang="ts">
    import ChallengeCard from "./ChallengeCard.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let { challenges, isLoading, searchQuery, activeTab } = $props();
</script>

<div class="challenge-list">
    <div class="list-header">
        <div class="h-status">STATUS</div>
        <div class="h-title">CHALLENGE TITLE</div>
        <div class="h-difficulty">DIFFICULTY</div>
        <div class="h-score">SCORE</div>
    </div>

    {#if isLoading}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading challenges...</p>
        </div>
    {:else}
        {#each challenges as item (item.id)}
            <ChallengeCard challenge={item} />
        {:else}
            <div class="empty-state">
                <Icon name="folder" size={40} />
                <p>No {activeTab} challenges found matching</p>
            </div>
        {/each}
    {/if}
</div>

<style>
    .challenge-list {
        background: #1e222b;
        border-radius: 12px;
        border: 1px solid #2a2e36;
        overflow: hidden;
    }

    .list-header {
        display: grid;
        grid-template-columns: 60px 1fr 120px 80px;
        gap: 20px;
        padding: 14px 20px;
        background: #252a35;
        font-size: 12px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #2a2e36;
    }
    .h-status {
        text-align: right;
    }
    .h-title {
        text-align: left;
    }
    .h-difficulty {
        text-align: center;
    }
    .h-score {
        text-align: center;
    }

    .loading-state,
    .empty-state {
        padding: 60px;
        text-align: center;
        color: #6b7280;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #2a2e36;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    @media (max-width: 640px) {
        .list-header {
            display: none;
        }
    }
</style>
