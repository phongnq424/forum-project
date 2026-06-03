<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { Report } from "$lib/types/report.type";
    import {
        formatDate,
        getTargetFromReport,
        severityColor,
        severityLabel,
        statusColor,
        statusLabel,
        typeLabel,
    } from "$lib/utils/report.utils";

    let {
        reports = [],
        loading = false,
        page = 1,
        limit = 10,
        total = 0,
        totalPages = 1,
        onView,
        onPrevious,
        onNext,
    } = $props<{
        reports: Report[];
        loading?: boolean;
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        onView: (report: Report) => void;
        onPrevious: () => void;
        onNext: () => void;
    }>();

    function getShowingStart() {
        if (total === 0) return 0;
        return (page - 1) * limit + 1;
    }

    function getShowingEnd() {
        return Math.min(page * limit, total);
    }
</script>

<section class="report-table-panel">
    {#if loading}
        <div class="empty-state">Loading reports...</div>
    {:else if reports.length === 0}
        <div class="empty-state">
            <div class="empty-icon">Report</div>
            <p>No reports found</p>
            <span>No report matched the current filters.</span>
        </div>
    {:else}
        <div class="table-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Case</th>
                        <th>Target</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Severity</th>
                        <th>Reporter</th>
                        <th>Created</th>
                        <th class="text-right">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {#each reports as report (report.id)}
                        {@const target = getTargetFromReport(report)}

                        <tr>
                            <td>
                                <div class="case-title">{report.title}</div>
                                <div class="case-desc">
                                    {report.description || "No description"}
                                </div>
                            </td>

                            <td>
                                <div class="target-title">
                                    {target.title || "Unknown target"}
                                </div>

                                {#if target.content}
                                    <div class="target-desc">
                                        {target.content}
                                    </div>
                                {/if}

                                {#if report.targetReportCount}
                                    <div class="report-count">
                                        {report.targetReportCount} report{report.targetReportCount ===
                                        1
                                            ? ""
                                            : "s"} on this target
                                    </div>
                                {/if}
                            </td>

                            <td>
                                <span class="type-pill">
                                    {typeLabel(report.type)}
                                </span>
                            </td>

                            <td>
                                <Badge
                                    color={statusColor(report.status)}
                                    size="sm"
                                >
                                    {statusLabel(report.status)}
                                </Badge>
                            </td>

                            <td>
                                <Badge
                                    color={severityColor(report.severity)}
                                    size="sm"
                                >
                                    {severityLabel(report.severity)}
                                </Badge>
                            </td>

                            <td>
                                <span class="reporter">
                                    {report.reporter?.fullname ||
                                        report.reporter?.username ||
                                        report.reportedBy ||
                                        "Unknown"}
                                </span>
                            </td>

                            <td>{formatDate(report.createdAt)}</td>

                            <td>
                                <div class="actions">
                                    <button
                                        type="button"
                                        class="icon-btn"
                                        aria-label={`View report ${report.title}`}
                                        title="View report"
                                        onclick={() => onView(report)}
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
                Showing {getShowingStart()}–{getShowingEnd()} of {total} reports
            </p>

            <div class="pagination-actions">
                <Button
                    variant="secondary"
                    disabled={page === 1}
                    onclick={onPrevious}
                >
                    Previous
                </Button>

                <span>Page {page} of {totalPages}</span>

                <Button
                    variant="secondary"
                    disabled={page >= totalPages}
                    onclick={onNext}
                >
                    Next
                </Button>
            </div>
        </div>
    {/if}
</section>

<style>
    .report-table-panel {
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 16px;
        background: linear-gradient(180deg, #171a21 0%, #14171d 100%);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
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
    }

    .table-scroll::-webkit-scrollbar-thumb {
        background: #2a2e36;
        border-radius: 999px;
        border: 2px solid #111318;
    }

    table {
        width: 100%;
        min-width: 1120px;
        border-collapse: collapse;
    }

    thead {
        background: rgba(15, 18, 24, 0.82);
    }

    th,
    td {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        text-align: left;
        vertical-align: top;
        font-size: 13px;
    }

    th {
        color: #94a3b8;
        font-size: 11px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        white-space: nowrap;
    }

    td {
        color: #d1d5db;
    }

    tbody tr {
        transition: background-color 0.16s ease;
    }

    tbody tr:hover {
        background: rgba(139, 92, 246, 0.055);
    }

    .case-title,
    .target-title {
        color: #f8fafc;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.45;
    }

    .case-desc,
    .target-desc {
        max-width: 320px;
        margin-top: 4px;
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.45;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .report-count {
        width: fit-content;
        margin-top: 8px;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.1);
        color: #fbbf24;
        font-size: 11px;
        font-weight: 600;
    }

    .type-pill {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding: 0 9px;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.11);
        color: #c4b5fd;
        font-size: 12px;
        font-weight: 600;
    }

    .reporter {
        color: #e5e7eb;
        font-size: 13px;
        font-weight: 500;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .text-right {
        text-align: right;
    }

    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.12);
        background: #111318;
        color: #cbd5e1;
        cursor: pointer;
        transition:
            background-color 0.16s ease,
            border-color 0.16s ease,
            color 0.16s ease;
    }

    .icon-btn:hover {
        background: rgba(139, 92, 246, 0.12);
        border-color: rgba(139, 92, 246, 0.28);
        color: #ffffff;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 14px 16px;
        color: #94a3b8;
        font-size: 13px;
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
        font-size: 13px;
    }

    .empty-state {
        padding: 48px 20px;
        text-align: center;
        color: #94a3b8;
    }

    .empty-state p {
        margin: 10px 0 4px;
        color: #f8fafc;
        font-weight: 650;
    }

    .empty-state span {
        font-size: 13px;
    }

    .empty-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 34px;
        padding: 0 12px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.08);
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    @media (max-width: 760px) {
        .pagination {
            flex-direction: column;
            align-items: stretch;
        }

        .pagination-actions {
            justify-content: space-between;
        }
    }
</style>
