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

    type TopicGroup = {
        name: string;
        topics: Topic[];
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

    function getTopicGroupName(topic: Topic) {
        const item = topic as any;

        return (
            item.Category?.name ||
            item.category?.name ||
            item.category_name ||
            item.categoryName ||
            item.CategoryName ||
            item.group_name ||
            item.groupName ||
            "Other"
        );
    }

    const topicGroups = $derived.by<TopicGroup[]>(() => {
        const map = new Map<string, Topic[]>();

        for (const topic of topics) {
            const groupName = getTopicGroupName(topic);

            if (!map.has(groupName)) {
                map.set(groupName, []);
            }

            map.get(groupName)?.push(topic);
        }

        return Array.from(map.entries()).map(([name, groupTopics]) => ({
            name,
            topics: groupTopics,
        }));
    });

    function getSelectedCount(group: TopicGroup) {
        return group.topics.filter((topic) => isSelected(topic.id)).length;
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
            <div class="category-filter-box">
                {#each topicGroups as group (group.name)}
                    <div class="filter-group">
                        <div class="group-row">
                            <span class="group-label">{group.name}</span>

                            {#if getSelectedCount(group) > 0}
                                <span class="group-selected">
                                    {getSelectedCount(group)}/{group.topics
                                        .length}
                                </span>
                            {/if}
                        </div>

                        <div class="topic-chips">
                            {#each group.topics as topic (topic.id)}
                                <button
                                    type="button"
                                    class="topic-chip"
                                    class:selected={isSelected(topic.id)}
                                    disabled={savingTopicId === topic.id}
                                    onclick={() => toggleTopic(topic.id)}
                                >
                                    <span class="topic-name">#{topic.name}</span
                                    >

                                    {#if savingTopicId === topic.id}
                                        <span class="chip-status">...</span>
                                    {:else if isSelected(topic.id)}
                                        <span class="chip-status">✓</span>
                                    {/if}
                                </button>
                            {/each}
                        </div>
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
        gap: 14px;
        min-width: 0;
    }

    .topic-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        min-width: 0;
    }

    .label {
        display: block;
        margin: 0 0 4px;
        color: #d1d5db;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .hint {
        max-width: 760px;
        margin: 0;
        color: #6b7280;
        font-size: 12px;
        line-height: 1.5;
    }

    .topic-loading {
        padding: 12px 0;
    }

    .category-filter-box {
        display: flex;
        flex-direction: column;
        gap: 18px;
        min-width: 0;
    }

    .filter-group {
        min-width: 0;
        margin: 0;
    }

    .group-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-width: 0;
        margin-bottom: 8px;
    }

    .group-label {
        display: block;
        min-width: 0;
        color: #6366f1;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .group-selected {
        flex: 0 0 auto;
        color: #10b981;
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        padding: 4px 8px;
        border: 1px solid rgba(16, 185, 129, 0.28);
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.08);
    }

    .topic-chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    .topic-chip {
        max-width: 100%;
        min-width: 0;
        border: 1px solid #2a2e36;
        border-radius: 999px;
        background: #171b24;
        color: #9ca3af;
        padding: 7px 11px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition:
            background 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease;
    }

    .topic-chip:hover {
        color: #e5e7eb;
        border-color: rgba(99, 102, 241, 0.5);
        background: rgba(99, 102, 241, 0.1);
    }

    .topic-chip.selected {
        color: #e5e7eb;
        border-color: rgba(99, 102, 241, 0.55);
        background: rgba(99, 102, 241, 0.16);
        font-weight: 700;
    }

    .topic-chip:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .topic-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .chip-status {
        flex: 0 0 auto;
        color: #10b981;
        font-size: 12px;
        font-weight: 800;
        line-height: 1;
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

    @media (max-width: 640px) {
        .category-filter-box {
            gap: 16px;
        }

        .topic-chips {
            gap: 7px;
        }

        .topic-chip {
            padding: 7px 10px;
            font-size: 12px;
        }
    }
</style>
