<script lang="ts">
    import { onMount } from "svelte";
    import { categoryService } from "$lib/services/category.service";
    import { adminTopicService } from "$lib/services/topic.service";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";

    import type { Category } from "$lib/types/category.type";
    import type { Topic } from "$lib/types/topic.type";

    type TopicForm = {
        id?: string;
        name: string;
        category_id: string;
        description: string;
    };

    let topics = $state<Topic[]>([]);
    let categories = $state<Category[]>([]);

    let total = $state(0);
    let page = $state(1);
    let limit = $state(10);
    let search = $state("");

    let loading = $state(false);
    let error = $state("");

    let showModal = $state(false);
    let isEditMode = $state(false);
    let editingTopic = $state<TopicForm>({
        name: "",
        category_id: "",
        description: "",
    });

    let modalError = $state("");
    let modalLoading = $state(false);

    let totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

    onMount(async () => {
        await loadInitialData();
    });

    async function loadInitialData() {
        await Promise.all([loadCategories(), loadTopics()]);
    }

    async function loadCategories() {
        try {
            const result = await categoryService.listCategories({
                page: 1,
                limit: 999,
            });

            categories = result.data ?? [];
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        }
    }

    async function loadTopics() {
        loading = true;
        error = "";

        try {
            const result = await adminTopicService.listTopics({
                page,
                limit,
                q: search.trim() || undefined,
            });

            topics = result.data ?? [];
            total = result.pagination?.total ?? 0;
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
            topics = [];
            total = 0;
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        page = 1;
        loadTopics();
    }

    function resetSearch() {
        search = "";
        page = 1;
        loadTopics();
    }

    function openCreateModal() {
        isEditMode = false;
        modalError = "";

        editingTopic = {
            name: "",
            category_id: categories[0]?.id ?? "",
            description: "",
        };

        showModal = true;
    }

    function openEditModal(topic: Topic) {
        isEditMode = true;
        modalError = "";

        editingTopic = {
            id: topic.id,
            name: topic.name,
            category_id: topic.category_id,
            description: topic.description ?? "",
        };

        showModal = true;
    }

    async function saveTopic() {
        const name = editingTopic.name.trim();
        const categoryId = editingTopic.category_id;
        const description = editingTopic.description?.trim() ?? "";

        if (!name) {
            modalError = "Topic name is required";
            return;
        }

        if (!categoryId) {
            modalError = "Category is required";
            return;
        }

        modalLoading = true;
        modalError = "";

        try {
            if (isEditMode && editingTopic.id) {
                await adminTopicService.updateTopic(editingTopic.id, {
                    name,
                    category_id: categoryId,
                    description,
                });
            } else {
                await adminTopicService.createTopic({
                    name,
                    category_id: categoryId,
                    description,
                });
            }

            showModal = false;
            await loadTopics();
        } catch (e) {
            modalError = e instanceof Error ? e.message : String(e);
        } finally {
            modalLoading = false;
        }
    }

    async function deleteTopic(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete topic "${name}"?`)) {
            return;
        }

        loading = true;
        error = "";

        try {
            await adminTopicService.deleteTopic(id);

            if (topics.length === 1 && page > 1) {
                page -= 1;
            }

            await loadTopics();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            loading = false;
        }
    }

    function getCategoryName(topic: Topic) {
        return (
            topic.Category?.name ||
            categories.find((category) => category.id === topic.category_id)
                ?.name ||
            "Unknown"
        );
    }

    function formatDate(value?: string) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString();
    }
</script>

<div class="page">
    <div class="page-header">
        <div>
            <h1>Topic Management</h1>
            <p>Create and manage discussion topics</p>
        </div>

        <div class="header-actions">
            <Button onclick={openCreateModal}>+ New Topic</Button>
        </div>
    </div>

    <div class="search-box">
        <div class="search-row">
            <Input
                bind:value={search}
                placeholder="Search topics..."
                onkeydown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") handleSearch();
                }}
            />
            <Button onclick={handleSearch}>Search</Button>
            <Button variant="secondary" onclick={resetSearch}>Reset</Button>
        </div>
    </div>

    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    <div class="table-wrapper">
        {#if loading}
            <div class="empty-state">Loading topics...</div>
        {:else if topics.length === 0}
            <div class="empty-state">No topics found</div>
        {:else}
            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th class="col-name">Name</th>
                            <th class="col-category">Category</th>
                            <th class="col-description">Description</th>
                            <th class="col-created">Created</th>
                            <th class="col-actions">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each topics as topic (topic.id)}
                            <tr>
                                <td>
                                    <div class="topic-name">
                                        {topic.name}
                                    </div>
                                </td>

                                <td>
                                    <span class="category-pill">
                                        {getCategoryName(topic)}
                                    </span>
                                </td>

                                <td>
                                    <div class="description">
                                        {topic.description || "-"}
                                    </div>
                                </td>

                                <td>
                                    <div class="row-actions">
                                        <button
                                            type="button"
                                            class="link-button"
                                            onclick={() => openEditModal(topic)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            class="link-button danger"
                                            onclick={() =>
                                                deleteTopic(
                                                    topic.id,
                                                    topic.name,
                                                )}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <div class="pagination-info">
                    Showing {(page - 1) * limit + 1} to {Math.min(
                        page * limit,
                        total,
                    )} of {total} topics
                </div>

                <div class="pagination-actions">
                    <Button
                        variant="secondary"
                        disabled={page === 1}
                        onclick={() => {
                            page = Math.max(1, page - 1);
                            loadTopics();
                        }}
                    >
                        Previous
                    </Button>

                    <div class="page-indicator">
                        Page {page} of {totalPages}
                    </div>

                    <Button
                        variant="secondary"
                        disabled={page >= totalPages}
                        onclick={() => {
                            page = Math.min(totalPages, page + 1);
                            loadTopics();
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        {/if}
    </div>
</div>

<Modal
    bind:open={showModal}
    title={isEditMode ? "Edit Topic" : "Create Topic"}
    maxWidth="560px"
>
    <div class="modal-content">
        {#if modalError}
            <div class="alert error">
                {modalError}
            </div>
        {/if}

        <div class="form-group">
            <label for="topic-name">Topic Name *</label>
            <Input
                id="topic-name"
                bind:value={editingTopic.name}
                placeholder="Enter topic name"
            />
        </div>

        <div class="form-group">
            <label for="topic-category">Category *</label>
            <select
                id="topic-category"
                bind:value={editingTopic.category_id}
                class="select"
            >
                <option value="">Select a category</option>
                {#each categories as category (category.id)}
                    <option value={category.id}>{category.name}</option>
                {/each}
            </select>
        </div>

        <div class="form-group">
            <label for="topic-description">Description</label>
            <textarea
                id="topic-description"
                bind:value={editingTopic.description}
                placeholder="Enter description"
                class="textarea"
                rows="4"
            />
        </div>

        <div class="modal-actions">
            <Button
                variant="secondary"
                disabled={modalLoading}
                onclick={() => (showModal = false)}
            >
                Cancel
            </Button>

            <Button disabled={modalLoading} onclick={saveTopic}>
                {modalLoading ? "Saving..." : "Save"}
            </Button>
        </div>
    </div>
</Modal>

<style>
    .page {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
    }

    .page-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #111827;
    }

    .page-header p {
        margin: 6px 0 0;
        color: #666;
    }

    .header-actions {
        display: flex;
        gap: 10px;
    }

    .search-box,
    .table-wrapper {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
    }

    .search-box {
        padding: 16px;
    }

    .search-row {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .search-row :global(input) {
        flex: 1;
    }

    .alert {
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 14px;
    }

    .alert.error {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
    }

    .table-scroll {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        background: #f8fafc;
    }

    th,
    td {
        padding: 14px 16px;
        border-bottom: 1px solid #e5e7eb;
        text-align: left;
        vertical-align: top;
        font-size: 14px;
    }

    th {
        font-weight: 600;
        color: #111827;
    }

    .col-name {
        min-width: 180px;
    }

    .col-category {
        min-width: 160px;
    }

    .col-description {
        min-width: 260px;
    }

    .col-created {
        min-width: 120px;
    }

    .col-actions {
        min-width: 130px;
    }

    .topic-name {
        font-weight: 600;
        color: #111827;
    }

    .description {
        color: #4b5563;
        line-height: 1.5;
    }

    .category-pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 4px 10px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 12px;
        font-weight: 600;
    }

    .row-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .link-button {
        border: none;
        background: transparent;
        cursor: pointer;
        color: #2563eb;
        padding: 0;
        font-size: 14px;
    }

    .link-button.danger {
        color: #dc2626;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 16px;
    }

    .pagination-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .pagination-info,
    .page-indicator {
        font-size: 14px;
        color: #4b5563;
    }

    .empty-state {
        padding: 40px 20px;
        text-align: center;
        color: #6b7280;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
    }

    .select,
    .textarea {
        width: 100%;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
        background: #fff;
        color: #111827;
    }

    .select:focus,
    .textarea:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .textarea {
        resize: vertical;
        min-height: 96px;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 8px;
    }

    @media (max-width: 768px) {
        .page-header,
        .search-row,
        .pagination {
            flex-direction: column;
            align-items: stretch;
        }

        .pagination-actions {
            justify-content: space-between;
        }
    }
</style>
