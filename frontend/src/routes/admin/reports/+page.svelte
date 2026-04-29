<script lang="ts">
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import { reportService } from "$lib/services/report.service";
    import type {
        Report,
        ReportSeverity,
        ReportStatus,
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

    let loading = $state(false);
    let error = $state("");
    let modalError = $state("");
    let modalLoading = $state(false);
    let showDetailModal = $state(false);

    const statusOptions: { value: "" | ReportStatus; label: string }[] = [
        { value: "", label: "All Status" },
        { value: "OPEN", label: "Open" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "RESOLVED", label: "Resolved" },
        { value: "CLOSED", label: "Closed" },
    ];

    const severityOptions: { value: "" | ReportSeverity; label: string }[] = [
        { value: "", label: "All Severity" },
        { value: "LOW", label: "Low" },
        { value: "MEDIUM", label: "Medium" },
        { value: "HIGH", label: "High" },
        { value: "CRITICAL", label: "Critical" },
    ];

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
        page = 1;
        loadReports();
    }

    function openDetail(report: Report) {
        selectedReport = report;
        modalError = "";
        showDetailModal = true;
    }

    async function updateStatus(status: ReportStatus) {
        if (!selectedReport) return;

        modalLoading = true;
        modalError = "";

        try {
            const updated = await reportService.updateStatus(
                selectedReport.id,
                status,
            );

            selectedReport = updated;
            showDetailModal = false;
            await loadReports();
        } catch (e) {
            modalError =
                e instanceof Error ? e.message : "Failed to update report";
        } finally {
            modalLoading = false;
        }
    }

    function statusColor(status: ReportStatus) {
        if (status === "OPEN") return "danger";
        if (status === "IN_PROGRESS") return "warning";
        if (status === "RESOLVED") return "success";
        return "default";
    }

    function severityColor(severity: ReportSeverity) {
        if (severity === "LOW") return "info";
        if (severity === "MEDIUM") return "warning";
        if (severity === "HIGH") return "warning";
        return "danger";
    }

    function formatDate(value?: string) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString();
    }

    function formatDateTime(value?: string) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleString();
    }
</script>

<div class="report-page">
    <div class="page-header">
        <div>
            <p class="eyebrow">Admin Moderation</p>
            <h1>Reports & Complaints</h1>
            <p>
                Review reported users, posts, comments and messages in one
                moderation queue.
            </p>
        </div>
    </div>

    <section class="panel filter-panel">
        <div class="filter-row">
            <Input
                bind:value={search}
                placeholder="Search reports..."
                onkeydown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") handleSearch();
                }}
            />

            <div class="filter-select">
                <Select
                    bind:value={statusFilter}
                    options={statusOptions}
                    placeholder="All Status"
                />
            </div>

            <div class="filter-select">
                <Select
                    bind:value={severityFilter}
                    options={severityOptions}
                    placeholder="All Severity"
                />
            </div>

            <Button onclick={handleSearch}>Search</Button>
            <Button variant="secondary" onclick={resetFilters}>Reset</Button>
        </div>
    </section>

    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    <section class="panel table-panel">
        {#if loading}
            <div class="empty-state">Loading reports...</div>
        {:else if reports.length === 0}
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No reports found</p>
                <span>No report matched the current filters.</span>
            </div>
        {:else}
            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Report</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Severity</th>
                            <th>Reported By</th>
                            <th>Created</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each reports as report (report.id)}
                            <tr>
                                <td>
                                    <div class="report-title">
                                        {report.title}
                                    </div>
                                    <div class="report-desc">
                                        {report.description || "No description"}
                                    </div>
                                </td>

                                <td>
                                    <span class="type-text">{report.type}</span>
                                </td>

                                <td>
                                    <Badge
                                        color={statusColor(report.status)}
                                        size="sm"
                                    >
                                        {report.status}
                                    </Badge>
                                </td>

                                <td>
                                    <Badge
                                        color={severityColor(report.severity)}
                                        size="sm"
                                    >
                                        {report.severity}
                                    </Badge>
                                </td>

                                <td>
                                    <span class="reporter"
                                        >{report.reportedBy}</span
                                    >
                                </td>

                                <td>{formatDate(report.createdAt)}</td>

                                <td>
                                    <div class="actions">
                                        <button
                                            type="button"
                                            class="icon-btn"
                                            aria-label={`View report ${report.title}`}
                                            title="View report"
                                            onclick={() => openDetail(report)}
                                        >
                                            <Icon name="search" size={16} />
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
                    )}
                    of {total} reports
                </p>

                <div class="pagination-actions">
                    <Button
                        variant="secondary"
                        disabled={page === 1}
                        onclick={() => {
                            page = Math.max(1, page - 1);
                            loadReports();
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
                            loadReports();
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        {/if}
    </section>
</div>

<Modal bind:open={showDetailModal} title="Report Details" maxWidth="720px">
    {#if selectedReport}
        <div class="modal-content">
            {#if modalError}
                <div class="alert error">
                    {modalError}
                </div>
            {/if}

            <div class="grid-2">
                <div class="form-group">
                    <label for="report-status">Status</label>
                    <select
                        id="report-status"
                        class="select"
                        value={selectedReport.status}
                        disabled={modalLoading}
                        onchange={(e) =>
                            updateStatus(e.currentTarget.value as ReportStatus)}
                    >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div class="detail-block">
                    <span class="detail-label">Severity</span>
                    <Badge
                        color={severityColor(selectedReport.severity)}
                        size="sm"
                    >
                        {selectedReport.severity}
                    </Badge>
                </div>
            </div>

            <div class="detail-block">
                <span class="detail-label">Title</span>
                <p class="detail-value strong">{selectedReport.title}</p>
            </div>

            <div class="detail-block">
                <span class="detail-label">Description</span>
                <p class="detail-value multiline">
                    {selectedReport.description || "-"}
                </p>
            </div>

            <div class="grid-2">
                <div class="detail-block">
                    <span class="detail-label">Type</span>
                    <p class="detail-value">{selectedReport.type}</p>
                </div>

                <div class="detail-block">
                    <span class="detail-label">Reported By</span>
                    <p class="detail-value">{selectedReport.reportedBy}</p>
                </div>
            </div>

            {#if selectedReport.reportedUser}
                <div class="detail-block">
                    <span class="detail-label">Reported User</span>
                    <p class="detail-value">{selectedReport.reportedUser}</p>
                </div>
            {/if}

            {#if selectedReport.reportedContent}
                <div class="detail-block">
                    <span class="detail-label">Reported Content</span>
                    <div class="reported-content">
                        {selectedReport.reportedContent}
                    </div>
                </div>
            {/if}

            <div class="grid-2">
                <div class="detail-block">
                    <span class="detail-label">Created</span>
                    <p class="detail-value">
                        {formatDateTime(selectedReport.createdAt)}
                    </p>
                </div>

                <div class="detail-block">
                    <span class="detail-label">Updated</span>
                    <p class="detail-value">
                        {formatDateTime(selectedReport.updatedAt)}
                    </p>
                </div>
            </div>
        </div>
    {/if}

    {#snippet footer()}
        <div class="modal-footer">
            <Button
                variant="secondary"
                disabled={modalLoading}
                onclick={() => (showDetailModal = false)}
            >
                Close
            </Button>
        </div>
    {/snippet}
</Modal>

<style>
    .report-page {
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
        grid-template-columns: minmax(240px, 1fr) 170px 170px auto auto;
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
        min-width: 980px;
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

    .report-title {
        color: #ffffff;
        font-weight: 800;
    }

    .report-desc {
        max-width: 340px;
        margin-top: 4px;
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.45;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .type-text,
    .reporter {
        color: #e5e7eb;
        font-weight: 600;
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

    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }

    .form-group,
    .detail-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label,
    .detail-label {
        color: #9ca3af;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .detail-value {
        margin: 0;
        color: #d1d5db;
        font-size: 14px;
        line-height: 1.5;
    }

    .detail-value.strong {
        color: #ffffff;
        font-weight: 800;
    }

    .detail-value.multiline {
        white-space: pre-wrap;
    }

    .reported-content {
        padding: 14px;
        border-radius: 14px;
        background: #111318;
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #d1d5db;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-wrap;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        width: 100%;
    }

    @media (max-width: 900px) {
        .page-header,
        .pagination {
            flex-direction: column;
            align-items: stretch;
        }

        .filter-row,
        .grid-2 {
            grid-template-columns: 1fr;
        }

        .pagination-actions {
            justify-content: space-between;
        }
    }
</style>
