<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import { interestedTopicService } from "$lib/services/interested-topic.service";
    import type { Topic } from "$lib/types/topic.type";

    type Props = {
        topics?: Topic[];
        selectedTopicIds: string[];
        loading?: boolean;
    };

    let {
        topics = [],
        selectedTopicIds = $bindable(),
        loading = false,
    }: Props = $props();

    let savingTopicId = $state<string | null>(null);

    function isSelected(topicId: string) {
        return selectedTopicIds.includes(topicId);
    }

    async function toggleTopic(topicId: string) {
        if (savingTopicId) return;

        savingTopicId = topicId;

        try {
            if (isSelected(topicId)) {
                await interestedTopicService.unfollow(topicId);

                selectedTopicIds = selectedTopicIds.filter(
                    (id) => id !== topicId,
                );
            } else {
                await interestedTopicService.follow({ topic_id: topicId });

                selectedTopicIds = [...selectedTopicIds, topicId];
            }
        } catch (error) {
            console.error("Failed to update interested topic:", error);
        } finally {
            savingTopicId = null;
        }
    }
</script>

<Card variant="default" padding="20px" hover={false}>
    <div class="topic-section">
        <div class="topic-header">
            <div>
                <p class="label">Interested Topics</p>
                <p class="hint">
                    Select topics you are interested in. These topics help
                    personalize your feed and recommendations.
                </p>
            </div>
        </div>

        {#if loading}
            <div class="topic-loading">
                <Loading size="sm" message="Loading topics..." />
            </div>
        {:else}
            <div class="topic-chip-list">
                {#each topics as topic (topic.id)}
                    <div
                        class="topic-chip"
                        class:selected={isSelected(topic.id)}
                    >
                        <button
                            type="button"
                            class="chip-main"
                            disabled={savingTopicId === topic.id}
                            onclick={() => toggleTopic(topic.id)}
                        >
                            #{topic.name}

                            {#if savingTopicId === topic.id}
                                <span class="chip-status">...</span>
                            {:else if isSelected(topic.id)}
                                <span class="chip-status">✓</span>
                            {/if}
                        </button>
                    </div>
                {:else}
                    <p class="empty-topic">No topics available.</p>
                {/each}
            </div>
        {/if}

        {#if selectedTopicIds.length > 0}
            <p class="selected-summary">
                Selected {selectedTopicIds.length} topic{selectedTopicIds.length ===
                1
                    ? ""
                    : "s"}.
            </p>
        {/if}
    </div>
</Card>

<style>
    .topic-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .topic-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .label {
        font-size: 14px;
        color: #d1d5db;
        margin: 0 0 4px;
        display: block;
        font-weight: 700;
        text-transform: uppercase;
    }

    .hint {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
        line-height: 1.5;
    }

    .topic-loading {
        padding: 12px;
        border: 1px solid #2a2e36;
        border-radius: 14px;
        background: #111318;
    }

    .topic-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px;
        border: 1px solid #2a2e36;
        border-radius: 14px;
        background: #111318;
        max-height: 180px;
        overflow-y: auto;
    }

    .topic-chip {
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        border: 1px solid #2a2e36;
        border-radius: 999px;
        background: #171b24;
        color: #9ca3af;
        transition: all 0.2s ease;
    }

    .topic-chip.selected {
        border-color: rgba(99, 102, 241, 0.45);
        background: rgba(99, 102, 241, 0.14);
        color: #e5e7eb;
    }

    .chip-main {
        border: none;
        background: transparent;
        color: inherit;
        padding: 7px 10px;
        font-size: 13px;
        font-weight: 400;
        cursor: pointer;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .topic-chip.selected .chip-main {
        font-weight: 600;
    }

    .chip-main:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .chip-status {
        color: #10b981;
        font-weight: 700;
        font-size: 12px;
    }

    .selected-summary {
        margin: 0;
        color: #9ca3af;
        font-size: 12px;
    }

    .empty-topic {
        margin: 0;
        color: #6b7280;
        font-size: 13px;
    }
</style>
