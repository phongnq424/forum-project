<script lang="ts">
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import ChallengeModal from "$lib/components/challenge/ChallengeModal.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import type {
        Challenge,
        ChallengeDifficulty,
        ChallengeType,
    } from "$lib/types/challenge.type";

    let challenges = $state<Challenge[]>([]);
    let total = $state(0);
    let page = $state(1);
    let limit = $state(10);
    let search = $state("");
    let typeFilter = $state("");
    let difficultyFilter = $state("");
    let loading = $state(false);
    let error = $state("");

    let showModal = $state(false);
    let isEditMode = $state(false);
    let editingChallenge = $state<Partial<Challenge>>({});

    let totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

    const typeOptions = [
        { value: "", label: "All Types" },
        { value: "DSA", label: "DSA" },
        { value: "SQL", label: "SQL" },
        { value: "BACKEND", label: "Backend" },
    ];

    const difficultyOptions = [
        { value: "", label: "All Difficulties" },
        { value: "EASY", label: "Easy" },
        { value: "MEDIUM", label: "Medium" },
        { value: "HARD", label: "Hard" },
    ];

    onMount(loadChallenges);

    async function loadChallenges() {
        loading = true;
        error = "";

        try {
            const result = await challengeService.listChallenges({
                page,
                limit,
                q: search.trim() || undefined,
                type: typeFilter || undefined,
            });

            let data = result.data ?? [];

            if (difficultyFilter) {
                data = data.filter(
                    (item) => item.difficulty === difficultyFilter,
                );
            }

            challenges = data;
            total = result.pagination?.total ?? data.length;
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
            challenges = [];
            total = 0;
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        page = 1;
        loadChallenges();
    }

    function resetSearch() {
        search = "";
        typeFilter = "";
        difficultyFilter = "";
        page = 1;
        loadChallenges();
    }

    let editingChallengeId = $state<string | null>(null);

    function openCreateModal() {
        isEditMode = false;
        editingChallengeId = null;
        editingChallenge = {
            title: "",
            description: "",
            input: "",
            output: "",
            constraints: "",
            time_limit: 1000,
            memory_limit: 256,
            point: 10,
            difficulty: "EASY",
            type: "DSA",
        };
        showModal = true;
    }

    function openEditModal(challenge: Challenge) {
        isEditMode = true;
        editingChallengeId = challenge.id;
        editingChallenge = {};
        showModal = true;
    }

    async function deleteChallenge(id: string, title: string) {
        if (!confirm(`Delete challenge "${title}"?`)) return;

        loading = true;
        error = "";

        try {
            await challengeService.deleteChallenge(id);

            if (challenges.length === 1 && page > 1) {
                page -= 1;
            }

            await loadChallenges();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            loading = false;
        }
    }

    function difficultyColor(difficulty: ChallengeDifficulty) {
        if (difficulty === "EASY") return "success";
        if (difficulty === "MEDIUM") return "warning";
        return "danger";
    }

    function typeColor(type: ChallengeType) {
        if (type === "DSA") return "info";
        if (type === "SQL") return "warning";
        return "outline";
    }

    function formatDate(value?: string) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString();
    }
</script>

<div class="challenge-page">
    <div class="page-header">
        <div>
            <p class="eyebrow">Coding Practice</p>
            <h1>Challenge Management</h1>
            <p>Create, edit and manage coding challenges for the platform.</p>
        </div>

        <div class="header-actions">
            <Button onclick={openCreateModal}>+ New Challenge</Button>
        </div>
    </div>

    <section class="panel filter-panel">
        <div class="filter-row">
            <Input
                bind:value={search}
                placeholder="Search challenges..."
                onkeydown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") handleSearch();
                }}
            />

            <div class="filter-select">
                <Select
                    bind:value={typeFilter}
                    options={typeOptions}
                    placeholder="All Types"
                />
            </div>

            <div class="filter-select">
                <Select
                    bind:value={difficultyFilter}
                    options={difficultyOptions}
                    placeholder="All Difficulties"
                />
            </div>

            <Button onclick={handleSearch}>Search</Button>
            <Button onclick={resetSearch} variant="secondary">Reset</Button>
        </div>
    </section>

    {#if error}
        <div class="alert error">{error}</div>
    {/if}

    <section class="panel table-panel">
        {#if loading}
            <div class="empty-state">Loading challenges...</div>
        {:else if challenges.length === 0}
            <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <p>No challenges found</p>
                <span>Try changing the search keyword or filters.</span>
            </div>
        {:else}
            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Challenge</th>
                            <th>Type</th>
                            <th>Difficulty</th>
                            <th>Point</th>
                            <th>Limits</th>
                            <th>Submissions</th>
                            <th>Created</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each challenges as challenge (challenge.id)}
                            <tr>
                                <td>
                                    <div class="title-cell">
                                        <div class="challenge-title">
                                            {challenge.title}
                                        </div>
                                        <div class="challenge-desc">
                                            {challenge.description ||
                                                "No description"}
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <Badge
                                        color={typeColor(challenge.type)}
                                        size="sm"
                                    >
                                        {challenge.type}
                                    </Badge>
                                </td>

                                <td>
                                    <Badge
                                        color={difficultyColor(
                                            challenge.difficulty,
                                        )}
                                        size="sm"
                                    >
                                        {challenge.difficulty}
                                    </Badge>
                                </td>

                                <td>
                                    <strong class="point-value">
                                        {challenge.point ?? 0}
                                    </strong>
                                </td>

                                <td>
                                    <div class="limit-cell">
                                        <span>{challenge.time_limit} ms</span>
                                        <span>{challenge.memory_limit} MB</span>
                                    </div>
                                </td>

                                <td>
                                    <span class="submission-count">
                                        {challenge.totalSubmissions ?? 0}
                                    </span>
                                </td>

                                <td>
                                    {formatDate(challenge.created_at)}
                                </td>

                                <td>
                                    <div class="actions">
                                        <button
                                            type="button"
                                            class="icon-btn"
                                            aria-label={`Edit challenge ${challenge.title}`}
                                            title="Edit challenge"
                                            onclick={() =>
                                                openEditModal(challenge)}
                                        >
                                            <Icon name="pencil" size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            class="icon-btn danger"
                                            aria-label={`Delete challenge ${challenge.title}`}
                                            title="Delete challenge"
                                            onclick={() =>
                                                deleteChallenge(
                                                    challenge.id,
                                                    challenge.title,
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
                    )} of {total} challenges
                </p>

                <div class="pagination-actions">
                    <Button
                        variant="secondary"
                        disabled={page === 1}
                        onclick={() => {
                            page = Math.max(1, page - 1);
                            loadChallenges();
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
                            loadChallenges();
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        {/if}
    </section>
</div>

<ChallengeModal
    bind:open={showModal}
    isEdit={isEditMode}
    challengeId={editingChallengeId}
    challenge={editingChallenge}
    onSave={loadChallenges}
/>

<style>
    .challenge-page {
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

    .page-header h1 {
        margin: 0;
        color: #ffffff;
        font-size: 30px;
        font-weight: 800;
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
        grid-template-columns: minmax(240px, 1fr) 160px 180px auto auto;
        gap: 10px;
        align-items: center;
    }

    .select {
        width: 100%;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #111318;
        color: #f9fafb;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
    }

    .select:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
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
        min-width: 1060px;
        border-collapse: collapse;
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
        white-space: nowrap;
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

    .text-right {
        text-align: right;
    }

    .title-cell {
        min-width: 260px;
        max-width: 420px;
    }

    .challenge-title {
        color: #ffffff;
        font-weight: 800;
    }

    .challenge-desc {
        margin-top: 4px;
        color: #9ca3af;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .point-value {
        color: #ffffff;
    }

    .limit-cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: #9ca3af;
        white-space: nowrap;
    }

    .submission-count {
        color: #e5e7eb;
        font-weight: 700;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
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
        }
    }
</style>
