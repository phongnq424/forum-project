<script lang="ts">
    import { onMount, untrack } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import CategoryModal from "$lib/components/admin/category/CategoryModal.svelte";
    import AddTopicModal from "$lib/components/admin/category/AddTopicModal.svelte";
    import EditTopicModal from "$lib/components/admin/category/EditTopicModal.svelte";
    import TopicTreeNode from "$lib/components/admin/category/TopicTreeNode.svelte";
    import { categoryService } from "$lib/services/category.service";
    import { adminTopicService } from "$lib/services/topic.service";
    import type { Category } from "$lib/types/category.type";
    import type { Topic } from "$lib/types/topic.type";

    interface CategoryRow extends Category {
        topics: Topic[];
        topicCount: number;
    }

    const limitOptions = [
        { label: "10 / page", value: 10 },
        { label: "20 / page", value: 20 },
        { label: "50 / page", value: 50 },
    ];

    let rows = $state<CategoryRow[]>([]);
    let categories = $state<Category[]>([]);
    let topics = $state<Topic[]>([]);

    let total = $state(0);
    let page = $state(1);
    let limit = $state(10);
    let previousLimit = 10;
    let mounted = $state(false);

    let search = $state("");
    let loading = $state(false);
    let error = $state("");

    let showCategoryModal = $state(false);
    let isEditCategoryMode = $state(false);
    let editingCategory = $state<Partial<Category>>({});

    let showAddTopicsModal = $state(false);
    let selectedCategory = $state<Category | null>(null);
    let selectedParentTopicId = $state<string | null>(null);

    let showEditTopicModal = $state(false);
    let editingTopic = $state<Partial<Topic>>({});

    let totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

    onMount(() => {
        mounted = true;
        loadData();
    });

    $effect(() => {
        if (!mounted) return;
        if (limit === previousLimit) return;

        previousLimit = limit;
        page = 1;

        untrack(() => {
            void loadData();
        });
    });

    function buildTopicTree(topicList: Topic[]): Topic[] {
        const map = new Map<string, Topic>();
        const roots: Topic[] = [];

        topicList.forEach((topic) => {
            map.set(topic.id, {
                ...topic,
                children: [],
            });
        });

        map.forEach((topic) => {
            if (topic.parent_id && map.has(topic.parent_id)) {
                map.get(topic.parent_id)?.children?.push(topic);
            } else {
                roots.push(topic);
            }
        });

        const sortTree = (items: Topic[]) => {
            items.sort((a, b) => a.name.localeCompare(b.name));
            items.forEach((item) => sortTree(item.children ?? []));
        };

        sortTree(roots);
        return roots;
    }

    function countTree(items: Topic[]): number {
        return items.reduce(
            (sum, item) => sum + 1 + countTree(item.children ?? []),
            0,
        );
    }

    function mergeData(
        categoryList: Category[],
        topicList: Topic[],
    ): CategoryRow[] {
        return categoryList.map((category) => {
            const categoryTopics = topicList.filter(
                (topic) => topic.category_id === category.id,
            );

            const tree = buildTopicTree(categoryTopics);

            return {
                ...category,
                topics: tree,
                topicCount: countTree(tree),
            };
        });
    }

    async function loadData() {
        loading = true;
        error = "";

        try {
            const [categoryResult, topicResult] = await Promise.all([
                categoryService.listCategories({
                    page,
                    limit,
                    q: search || undefined,
                }),
                adminTopicService.listTopics({
                    page: 1,
                    limit: 999,
                }),
            ]);

            categories = categoryResult.data ?? [];
            topics = topicResult.data ?? [];
            total = categoryResult.pagination?.total ?? 0;
            rows = mergeData(categories, topics);
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
            rows = [];
            categories = [];
            topics = [];
            total = 0;
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        page = 1;
        loadData();
    }

    function resetSearch() {
        search = "";
        page = 1;
        loadData();
    }

    function openCreateCategoryModal() {
        isEditCategoryMode = false;
        editingCategory = {
            name: "",
            description: "",
        };
        showCategoryModal = true;
    }

    function openEditCategoryModal(category: Category) {
        isEditCategoryMode = true;
        editingCategory = { ...category };
        showCategoryModal = true;
    }

    async function deleteCategory(id: string, name: string) {
        if (!confirm(`Delete category "${name}"?`)) return;

        loading = true;
        error = "";

        try {
            await categoryService.deleteCategory(id);

            if (rows.length === 1 && page > 1) {
                page -= 1;
            }

            await loadData();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            loading = false;
        }
    }

    function openAddTopicsModal(
        category: Category,
        parentTopicId: string | null = null,
    ) {
        selectedCategory = category;
        selectedParentTopicId = parentTopicId;
        showAddTopicsModal = true;
    }

    async function deleteTopic(id: string, name: string) {
        if (
            !confirm(
                `Delete topic "${name}"? Child topics may also be affected.`,
            )
        ) {
            return;
        }

        loading = true;
        error = "";

        try {
            await adminTopicService.deleteTopic(id);
            await loadData();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            loading = false;
        }
    }

    function openEditTopicModal(topic: Topic) {
        editingTopic = { ...topic };
        showEditTopicModal = true;
    }
</script>

<div class="category-page">
    <div class="page-header">
        <div>
            <p class="eyebrow">Forum Structure</p>
            <h2>Category & Topic Management</h2>
            <p>
                Manage high-level categories and organize their discussion
                topics.
            </p>
        </div>

        <div class="header-actions">
            <Button onclick={openCreateCategoryModal}>+ New Category</Button>
        </div>
    </div>

    <section class="panel filter-panel">
        <div class="filter-row">
            <Input
                bind:value={search}
                placeholder="Search categories..."
                onkeydown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") handleSearch();
                }}
            />

            <Button onclick={handleSearch}>Search</Button>
            <Button variant="secondary" onclick={resetSearch}>Reset</Button>
        </div>
    </section>

    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    <section class="panel table-panel">
        {#if loading}
            <div class="empty-state">Loading categories...</div>
        {:else if rows.length === 0}
            <div class="empty-state">
                <div class="empty-icon">🗂️</div>
                <p>No categories found</p>
                <span>
                    Try changing the search keyword or create a new category.
                </span>
            </div>
        {:else}
            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th class="col-name">Category</th>
                            <th class="col-description">Description</th>
                            <th class="col-topics">Topics</th>
                            <th class="col-actions">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each rows as row (row.id)}
                            <tr>
                                <td>
                                    <div class="category-name">{row.name}</div>
                                </td>

                                <td>
                                    <div class="description">
                                        {row.description || "-"}
                                    </div>
                                </td>

                                <td>
                                    <div class="topics-cell">
                                        <div class="topics-header-row">
                                            <span class="topic-count">
                                                {row.topicCount} topic{row.topicCount ===
                                                1
                                                    ? ""
                                                    : "s"}
                                            </span>

                                            <button
                                                type="button"
                                                class="add-topic-button"
                                                onclick={() =>
                                                    openAddTopicsModal(
                                                        row,
                                                        null,
                                                    )}
                                            >
                                                <Icon name="plus" size={14} />
                                                Add root topic
                                            </button>
                                        </div>

                                        {#if row.topics.length > 0}
                                            <div class="topic-tree">
                                                {#each row.topics as topic (topic.id)}
                                                    <TopicTreeNode
                                                        {topic}
                                                        category={row}
                                                        {openAddTopicsModal}
                                                        {openEditTopicModal}
                                                        {deleteTopic}
                                                    />
                                                {/each}
                                            </div>
                                        {:else}
                                            <div class="empty-topic-box">
                                                <span>No topics yet</span>
                                                <button
                                                    type="button"
                                                    onclick={() =>
                                                        openAddTopicsModal(
                                                            row,
                                                            null,
                                                        )}
                                                >
                                                    Create first topic
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                </td>
                                <td>
                                    <div class="row-actions">
                                        <button
                                            type="button"
                                            class="icon-btn"
                                            aria-label={`Edit category ${row.name}`}
                                            title="Edit category"
                                            onclick={() =>
                                                openEditCategoryModal(row)}
                                        >
                                            <Icon name="pencil" size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            class="icon-btn danger"
                                            aria-label={`Delete category ${row.name}`}
                                            title="Delete category"
                                            onclick={() =>
                                                deleteCategory(
                                                    row.id,
                                                    row.name,
                                                )}
                                        >
                                            <Icon name="trash" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <p>
                    Showing {(page - 1) * limit + 1}–{Math.min(
                        page * limit,
                        total,
                    )} of {total} categories
                </p>

                <div class="pagination-actions">
                    <div class="limit-select">
                        <Select
                            bind:value={limit}
                            options={limitOptions}
                            placeholder="Rows per page"
                        />
                    </div>

                    <Button
                        variant="secondary"
                        disabled={page === 1}
                        onclick={() => {
                            page = Math.max(1, page - 1);
                            loadData();
                        }}
                    >
                        Previous
                    </Button>

                    <span>Page {page} of {totalPages}</span>

                    <Button
                        variant="secondary"
                        disabled={page >= totalPages}
                        onclick={() => {
                            page = Math.min(totalPages, page + 1);
                            loadData();
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        {/if}
    </section>
</div>

{#if showCategoryModal}
    <CategoryModal
        bind:open={showCategoryModal}
        isEdit={isEditCategoryMode}
        category={editingCategory}
        onSave={loadData}
    />
{/if}

{#if showAddTopicsModal}
    <AddTopicModal
        bind:open={showAddTopicsModal}
        category={selectedCategory}
        topics={selectedCategory
            ? (rows.find((row) => row.id === selectedCategory?.id)?.topics ??
              [])
            : []}
        defaultParentId={selectedParentTopicId}
        onSave={loadData}
    />
{/if}

{#if showEditTopicModal}
    <EditTopicModal
        bind:open={showEditTopicModal}
        topic={editingTopic}
        topics={editingTopic.category_id
            ? (rows.find((row) => row.id === editingTopic.category_id)
                  ?.topics ?? [])
            : []}
        onSave={loadData}
    />
{/if}

<style>
    .category-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #a78bfa;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .page-header p:not(.eyebrow) {
        margin: 8px 0 0;
        color: #9ca3af;
        font-size: 14px;
    }

    .header-actions {
        display: flex;
        gap: 10px;
    }

    .panel {
        background: #181b22;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
    }

    .filter-panel {
        padding: 16px;
    }

    .filter-row {
        display: grid;
        grid-template-columns: minmax(240px, 1fr) auto auto;
        gap: 10px;
        align-items: center;
    }

    .alert {
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 14px;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.12);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.28);
    }

    .table-panel {
        overflow: hidden;
    }

    .table-scroll {
        overflow-x: auto;
        scrollbar-color: #2a2e36 #111318;
        scrollbar-width: thin;
    }

    .table-scroll::-webkit-scrollbar {
        height: 10px;
    }

    .table-scroll::-webkit-scrollbar-track {
        background: #111318;
        border-radius: 999px;
    }

    .table-scroll::-webkit-scrollbar-thumb {
        background: #2a2e36;
        border-radius: 999px;
        border: 2px solid #111318;
    }

    .table-scroll::-webkit-scrollbar-thumb:hover {
        background: #3a3f4c;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 980px;
    }

    thead {
        background: #20232b;
    }

    th,
    td {
        padding: 15px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
        vertical-align: top;
        font-size: 14px;
    }

    th {
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    td {
        color: #d1d5db;
    }

    tbody tr {
        transition: background-color 0.2s ease;
    }

    tbody tr:hover {
        background: rgba(139, 92, 246, 0.06);
    }

    .col-name {
        min-width: 180px;
    }

    .col-description {
        min-width: 260px;
    }

    .col-topics {
        min-width: 380px;
    }

    .col-actions {
        width: 100px;
        text-align: right;
    }

    .category-name {
        color: #ffffff;
        font-weight: 800;
    }

    .description {
        color: #9ca3af;
        line-height: 1.5;
    }

    .topics-cell {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .add-topic-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        width: fit-content;
        border: none;
        background: transparent;
        color: #a78bfa;
        cursor: pointer;
        padding: 0;
        font-size: 13px;
        font-weight: 700;
    }

    .add-topic-button:hover {
        color: #c4b5fd;
    }

    .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 11px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #111318;
        color: #cbd5e1;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
    }

    .icon-btn:hover {
        background: rgba(139, 92, 246, 0.14);
        border-color: rgba(139, 92, 246, 0.32);
        color: #ffffff;
        transform: translateY(-1px);
    }

    .icon-btn.danger:hover {
        background: rgba(239, 68, 68, 0.16);
        border-color: rgba(239, 68, 68, 0.3);
        color: #fca5a5;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px 18px;
        color: #9ca3af;
        font-size: 14px;
    }

    .pagination p {
        margin: 0;
    }

    .pagination-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .pagination-actions span {
        color: #cbd5e1;
        white-space: nowrap;
    }

    .limit-select {
        width: 140px;
    }

    .empty-state {
        padding: 48px 20px;
        text-align: center;
        color: #9ca3af;
    }

    .empty-state p {
        margin: 10px 0 4px;
        color: #ffffff;
        font-weight: 700;
    }

    .empty-state span {
        font-size: 14px;
    }

    .empty-icon {
        font-size: 36px;
    }

    .topics-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
    }

    .topic-count {
        color: #6b7280;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .topic-tree {
        display: flex;
        flex-direction: column;
        gap: 7px;
        max-width: 640px;
    }

    .empty-topic-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 14px;
        background: #111318;
        border: 1px dashed rgba(148, 163, 184, 0.22);
        color: #6b7280;
        font-size: 13px;
    }

    .empty-topic-box button {
        border: none;
        background: transparent;
        color: #a78bfa;
        cursor: pointer;
        font-weight: 800;
    }

    @media (max-width: 900px) {
        .page-header,
        .pagination {
            flex-direction: column;
            align-items: stretch;
        }

        .filter-row {
            grid-template-columns: 1fr;
        }

        .pagination-actions {
            justify-content: space-between;
            flex-wrap: wrap;
        }

        .limit-select {
            width: 100%;
        }
    }
</style>
