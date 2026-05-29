<script lang="ts">
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { Category } from "$lib/types/category.type";
    import type { Topic } from "$lib/types/topic.type";
    import TopicTreeNode from "./TopicTreeNode.svelte";

    let {
        topic,
        category,
        level = 0,
        openAddTopicsModal,
        openEditTopicModal,
        deleteTopic,
    }: {
        topic: Topic;
        category: Category;
        level?: number;
        openAddTopicsModal: (
            category: Category,
            parentTopicId: string | null,
        ) => void;
        openEditTopicModal: (topic: Topic) => void;
        deleteTopic: (id: string, name: string) => Promise<void>;
    } = $props();

    let expanded = $state(true);
    let hasChildren = $derived((topic.children?.length ?? 0) > 0);
</script>

<div class="tree-node" style:--level={level}>
    <div class="node-line">
        <div class="indent-guides">
            {#each Array(level) as _}
                <span></span>
            {/each}
        </div>

        <button
            type="button"
            class="expand-btn"
            class:invisible={!hasChildren}
            onclick={() => (expanded = !expanded)}
            aria-label="Toggle topic"
        >
            <Icon name="arrow-right" size={13} />
        </button>

        <div class="topic-card">
            <div class="topic-main">
                <div class="topic-icon">
                    <Icon name="folder" size={14} />
                </div>

                <div class="topic-info">
                    <div class="topic-name-row">
                        <span class="topic-name">{topic.name}</span>

                        {#if topic.slug}
                            <span class="topic-slug">/{topic.slug}</span>
                        {/if}
                    </div>

                    {#if topic.description}
                        <p class="topic-description">{topic.description}</p>
                    {/if}
                </div>
            </div>

            <div class="topic-actions">
                <button
                    type="button"
                    class="topic-action child"
                    title="Add child topic"
                    onclick={() => openAddTopicsModal(category, topic.id)}
                >
                    <Icon name="plus" size={13} />
                </button>

                <button
                    type="button"
                    class="topic-action"
                    title="Edit topic"
                    onclick={() => openEditTopicModal(topic)}
                >
                    <Icon name="pencil" size={13} />
                </button>

                <button
                    type="button"
                    class="topic-action danger"
                    title="Delete topic"
                    onclick={() => deleteTopic(topic.id, topic.name)}
                >
                    <Icon name="trash" size={13} />
                </button>
            </div>
        </div>
    </div>

    {#if expanded && hasChildren}
        <div class="children">
            {#each topic.children ?? [] as child (child.id)}
                <TopicTreeNode
                    topic={child}
                    {category}
                    level={level + 1}
                    {openAddTopicsModal}
                    {openEditTopicModal}
                    {deleteTopic}
                />
            {/each}
        </div>
    {/if}
</div>

<style>
    .tree-node {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .node-line {
        display: grid;
        grid-template-columns: auto 24px minmax(0, 1fr);
        align-items: start;
        gap: 6px;
    }

    .indent-guides {
        display: flex;
        height: 42px;
    }

    .indent-guides span {
        width: 20px;
        border-right: 1px dashed rgba(148, 163, 184, 0.18);
    }

    .expand-btn {
        width: 24px;
        height: 32px;
        margin-top: 5px;
        border: none;
        background: transparent;
        color: #9ca3af;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .expand-btn:hover {
        color: #ffffff;
    }

    .expand-btn.invisible {
        visibility: hidden;
    }

    .topic-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 42px;
        padding: 8px 10px;
        border-radius: 14px;
        background: linear-gradient(135deg, #111318, #151924);
        border: 1px solid rgba(255, 255, 255, 0.07);
        transition:
            border-color 0.2s ease,
            background-color 0.2s ease,
            transform 0.2s ease;
    }

    .topic-card:hover {
        border-color: rgba(139, 92, 246, 0.35);
        transform: translateY(-1px);
    }

    .topic-main {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .topic-icon {
        width: 28px;
        height: 28px;
        border-radius: 10px;
        background: rgba(99, 102, 241, 0.13);
        color: #a78bfa;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .topic-info {
        min-width: 0;
    }

    .topic-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    .topic-name {
        color: #f3f4f6;
        font-weight: 750;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .topic-slug {
        color: #6b7280;
        font-size: 11px;
        white-space: nowrap;
    }

    .topic-description {
        margin: 3px 0 0;
        color: #7b8494;
        font-size: 12px;
        line-height: 1.35;
        max-width: 360px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .topic-actions {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
    }

    .topic-action {
        width: 27px;
        height: 27px;
        border-radius: 9px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background: rgba(255, 255, 255, 0.03);
        color: #cbd5e1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .topic-action:hover {
        background: rgba(139, 92, 246, 0.14);
        border-color: rgba(139, 92, 246, 0.35);
        color: #ffffff;
    }

    .topic-action.child {
        color: #a78bfa;
    }

    .topic-action.danger:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.32);
        color: #fca5a5;
    }

    .children {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
</style>
