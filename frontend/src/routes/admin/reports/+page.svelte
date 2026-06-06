<script lang="ts">
    import { onMount } from "svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import ReportDetailModal from "$lib/components/admin/reports/ReportDetailModal.svelte";
    import ReportFilters from "$lib/components/admin/reports/ReportFilters.svelte";
    import ReportTable from "$lib/components/admin/reports/ReportTable.svelte";
    import { reportService } from "$lib/services/report.service";
    import type {
        Report,
        ReportSeverity,
        ReportStatus,
        ReportType,
    } from "$lib/types/report.type";

    let reports = $state<Report[]>([]);
    let selectedReport = $state<Report | null>(null);

    let page = $state(1);
    let limit = $state(10);
    let total = $state(0);
    let totalPages = $derived(Math.max(1, Math.ceil(total / limit)));

    let search = $state("");
    let statusFilter = $state<ReportStatus | "">("");
    let severityFilter = $state<ReportSeverity | "">("");
    let typeFilter = $state<Exclude<ReportType, "UNKNOWN"> | "">("");

    let loading = $state(false);
    let error = $state("");
    let modalError = $state("");
    let modalLoading = $state(false);
    let showDetailModal = $state(false);
    let replyMessage = $state("");

    onMount(loadReports);

    async function loadReports() {
        loading = true;
        error = "";

        try {
            const result = await reportService.list({
                page,
                limit,
                q: search.trim() || undefined,
                status: statusFilter || undefined,
                severity: severityFilter || undefined,
                type: typeFilter || undefined,
            });

            reports = result.data ?? [];
            total = result.pagination?.total ?? 0;
        } catch (e) {
            error = e instanceof Error ? e.message : "Failed to load reports";
            reports = [];
            total = 0;
        } finally {
            loading = false;
        }
    }

    function handleSearch() {
        page = 1;
        loadReports();
    }

    function resetFilters() {
        search = "";
        statusFilter = "";
        severityFilter = "";
        typeFilter = "";
        page = 1;
        loadReports();
    }

    async function openDetail(report: Report) {
        selectedReport = report;
        modalError = "";
        replyMessage = "";
        showDetailModal = true;

        try {
            selectedReport = await reportService.getById(report.id);
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to load report detail";
        }
    }

    async function updateStatus(status: ReportStatus) {
        if (!selectedReport) return;
        if (selectedReport.status === status) return;

        modalLoading = true;
        modalError = "";

        try {
            const updated = await reportService.updateStatus(
                selectedReport.id,
                status,
            );

            selectedReport = updated;
            await loadReports();
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to update status";
        } finally {
            modalLoading = false;
        }
    }

    async function updateSeverity(severity: ReportSeverity) {
        if (!selectedReport) return;
        if (selectedReport.severity === severity) return;

        modalLoading = true;
        modalError = "";

        try {
            const updated = await reportService.updateSeverity(
                selectedReport.id,
                severity,
            );

            selectedReport = updated;
            await loadReports();
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to update severity";
        } finally {
            modalLoading = false;
        }
    }

    async function addReply() {
        if (!selectedReport) return;

        const message = replyMessage.trim();

        if (!message) return;

        modalLoading = true;
        modalError = "";

        try {
            await reportService.reply(selectedReport.id, message);
            selectedReport = await reportService.getById(selectedReport.id);
            replyMessage = "";
        } catch (e) {
            modalError = e instanceof Error ? e.message : "Failed to add note";
        } finally {
            modalLoading = false;
        }
    }

    function previousPage() {
        if (page <= 1) return;

        page = page - 1;
        loadReports();
    }

    function nextPage() {
        if (page >= totalPages) return;

        page = page + 1;
        loadReports();
    }

    function closeDetail() {
        showDetailModal = false;
        selectedReport = null;
        modalError = "";
        replyMessage = "";
    }
</script>

<div class="report-page">
    <header class="page-header">
        <div>
            <p class="eyebrow">Admin Moderation</p>
            <h2>Reports & Complaints</h2>
            <p>
                Review reported users, posts, comments and messages with target
                context, risk signals and moderation notes.
            </p>
        </div>
    </header>

    <ReportFilters
        bind:search
        bind:statusFilter
        bind:severityFilter
        bind:typeFilter
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
        {reports}
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
    {#if selectedReport}
        <ReportDetailModal
            report={selectedReport}
            loading={modalLoading}
            error={modalError}
            bind:replyMessage
            onStatusChange={updateStatus}
            onSeverityChange={updateSeverity}
            onReply={addReply}
            onClose={closeDetail}
        />
    {:else}
        <div class="detail-loading">Loading report detail...</div>
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

    .eyebrow {
        margin: 0 0 8px;
        color: #a78bfa;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
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
