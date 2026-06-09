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

<div class="adm-tree-node" style:--level={level}>
    <div class="adm-tree-line">
        <div class="adm-tree-indent">
            {#each Array(level) as _}
                <span></span>
            {/each}
        </div>

        <button
            type="button"
            class="adm-tree-toggle"
            class:invisible={!hasChildren}
            onclick={() => (expanded = !expanded)}
            aria-label="Toggle topic"
        >
            <Icon name="arrow-right" size={13} />
        </button>

        <div class="adm-tree-card">
            <div class="adm-tree-main">
                <div class="adm-tree-icon">
                    <Icon name="folder" size={14} />
                </div>

                <div class="adm-tree-info">
                    <div class="adm-tree-title-row">
                        <span class="adm-tree-title">{topic.name}</span>

                        {#if topic.slug}
                            <span class="adm-tree-slug">/{topic.slug}</span>
                        {/if}
                    </div>

                    {#if topic.description}
                        <p class="adm-tree-description">
                            {topic.description}
                        </p>
                    {/if}
                </div>
            </div>

            <div class="adm-tree-actions">
                <button
                    type="button"
                    class="adm-icon-btn sm"
                    title="Add child topic"
                    onclick={() => openAddTopicsModal(category, topic.id)}
                >
                    <Icon name="plus" size={13} />
                </button>

                <button
                    type="button"
                    class="adm-icon-btn sm"
                    title="Edit topic"
                    onclick={() => openEditTopicModal(topic)}
                >
                    <Icon name="pencil" size={13} />
                </button>

                <button
                    type="button"
                    class="adm-icon-btn sm danger"
                    title="Delete topic"
                    onclick={() => deleteTopic(topic.id, topic.name)}
                >
                    <Icon name="trash" size={13} />
                </button>
            </div>
        </div>
    </div>

    {#if expanded && hasChildren}
        <div class="adm-tree-children">
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
