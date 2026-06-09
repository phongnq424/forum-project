<script lang="ts">
    import { onMount } from "svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import ReportDetailModal from "$lib/components/admin/reports/ReportDetailModal.svelte";
    import ReportFilters from "$lib/components/admin/reports/ReportFilters.svelte";
    import ReportTable from "$lib/components/admin/reports/ReportTable.svelte";
    import { reportService } from "$lib/services/report.service";
    import type {
        ModerationActionType,
        ReportCase,
        ReportCategory,
        ReportResolution,
        ReportSeverity,
        ReportStatus,
        ReportTargetType,
    } from "$lib/types/report.type";

    let cases = $state<ReportCase[]>([]);
    let selectedCase = $state<ReportCase | null>(null);

    let page = $state(1);
    let limit = $state(10);
    let total = $state(0);
    let totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

    let statusFilter = $state<ReportStatus | "">("");
    let severityFilter = $state<ReportSeverity | "">("");
    let targetTypeFilter = $state<ReportTargetType | "">("");
    let categoryFilter = $state<ReportCategory | "">("");

    let loading = $state(false);
    let error = $state("");
    let modalError = $state("");
    let modalLoading = $state(false);
    let showDetailModal = $state(false);
    let note = $state("");

    onMount(loadCases);

    async function loadCases() {
        loading = true;
        error = "";

        try {
            const result = await reportService.listCases({
                page,
                limit,
                status: statusFilter || undefined,
                severity: severityFilter || undefined,
                target_type: targetTypeFilter || undefined,
                category: categoryFilter || undefined,
                sortBy: "priority",
            });

            cases = result.data ?? [];
            total = result.meta?.total ?? 0;
        } catch (e) {
            error =
                e instanceof Error ? e.message : "Failed to load report cases";
            cases = [];
            total = 0;
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        page = 1;
        loadCases();
    }

    function resetFilters() {
        statusFilter = "";
        severityFilter = "";
        targetTypeFilter = "";
        categoryFilter = "";
        page = 1;
        loadCases();
    }

    async function openDetail(reportCase: ReportCase) {
        selectedCase = reportCase;
        modalError = "";
        note = "";
        showDetailModal = true;

        try {
            selectedCase = await reportService.getCaseById(reportCase.id);
        } catch (e) {
            modalError =
                e instanceof Error
                    ? e.message
                    : "Failed to load report case detail";
        }
    }

    async function assignCase() {
        if (!selectedCase) return;

        modalLoading = true;
        modalError = "";

        try {
            selectedCase = await reportService.assignCase(selectedCase.id);
            await loadCases();
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to assign case";
        } finally {
            modalLoading = false;
        }
    }

    async function applyAction(
        action: ModerationActionType,
        actionNote: string,
    ) {
        if (!selectedCase) return;

        modalLoading = true;
        modalError = "";

        try {
            selectedCase = await reportService.applyAction(selectedCase.id, {
                action,
                note: actionNote.trim() || null,
            });

            selectedCase = await reportService.getCaseById(selectedCase.id);
            await loadCases();
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to apply action";
        } finally {
            modalLoading = false;
        }
    }

    async function resolveCase(
        resolution: ReportResolution,
        action: ModerationActionType,
        resolveNote: string,
    ) {
        if (!selectedCase) return;

        modalLoading = true;
        modalError = "";

        try {
            selectedCase = await reportService.resolveCase(selectedCase.id, {
                resolution,
                action,
                note: resolveNote.trim() || null,
            });

            selectedCase = await reportService.getCaseById(selectedCase.id);
            await loadCases();
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to resolve case";
        } finally {
            modalLoading = false;
        }
    }

    async function closeCase(closeNote: string) {
        if (!selectedCase) return;

        modalLoading = true;
        modalError = "";

        try {
            selectedCase = await reportService.closeCase(selectedCase.id, {
                note: closeNote.trim() || null,
            });

            await loadCases();
            closeDetail();
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to close case";
        } finally {
            modalLoading = false;
        }
    }

    function previousPage() {
        if (page <= 1) return;

        page = page - 1;
        loadCases();
    }

    function nextPage() {
        if (page >= totalPages) return;

        page = page + 1;
        loadCases();
    }

    function closeDetail() {
        showDetailModal = false;
        selectedCase = null;
        modalError = "";
        note = "";
    }
</script>

<div class="report-page">
    <header class="page-header">
        <div>
            <p class="eyebrow">Admin Moderation</p>
            <h2>Report Cases</h2>
            <p>
                Review reported users, posts, comments and messages with case
                priority, report signals and moderation history.
            </p>
        </div>
    </header>

    <ReportFilters
        bind:statusFilter
        bind:severityFilter
        bind:targetTypeFilter
        bind:categoryFilter
        {loading}
        onSearch={handleSearch}
        onReset={resetFilters}
    />

    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    <ReportTable
        {cases}
        {loading}
        {page}
        {limit}
        {total}
        {totalPages}
        onView={openDetail}
        onPrevious={previousPage}
        onNext={nextPage}
    />
</div>

<Modal bind:open={showDetailModal} title="Report Case" maxWidth="980px">
    {#if selectedCase}
        <ReportDetailModal
            reportCase={selectedCase}
            loading={modalLoading}
            error={modalError}
            bind:note
            onAssign={assignCase}
            onApplyAction={applyAction}
            onResolve={resolveCase}
            onCloseCase={closeCase}
            onClose={closeDetail}
        />
    {:else}
        <div class="detail-loading">Loading report case detail...</div>
    {/if}
</Modal>

<style>
    .report-page {
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

    .page-header h2 {
        margin: 0;
        color: #f8fafc;
        font-size: 24px;
        line-height: 1.25;
        font-weight: 650;
        letter-spacing: -0.025em;
    }

    .eyebrow {
        margin: 0 0 8px;
        color: #a78bfa;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .page-header p:not(.eyebrow) {
        max-width: 720px;
        margin: 8px 0 0;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.55;
    }

    .alert {
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.22);
    }

    .detail-loading {
        padding: 32px;
        text-align: center;
        color: #94a3b8;
        font-size: 13px;
    }

    @media (max-width: 760px) {
        .page-header {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
