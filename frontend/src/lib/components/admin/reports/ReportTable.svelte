<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { ReportCase } from "$lib/types/report.type";
    import {
        formatDate,
        severityColor,
        severityLabel,
        statusColor,
        statusLabel,
        typeLabel,
    } from "$lib/utils/report.utils";

    let {
        cases = [],
        loading = false,
        page = 1,
        limit = 10,
        total = 0,
        totalPages = 1,
        onView,
        onPrevious,
        onNext,
    } = $props<{
        cases: ReportCase[];
        loading?: boolean;
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        onView: (reportCase: ReportCase) => void;
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

    function getTargetTitle(reportCase: ReportCase) {
        const target = reportCase.target;

        if (!target) return "Unknown target";

        if (reportCase.target_type === "USER") {
            return target.fullname || target.username || target.id;
        }

        if (reportCase.target_type === "POST") {
            return target.title || target.id;
        }

        if (reportCase.target_type === "COMMENT") {
            return "Comment";
        }

        if (reportCase.target_type === "MESSAGE") {
            return "Message";
        }

        return target.id;
    }

    function getTargetContent(reportCase: ReportCase) {
        const target = reportCase.target;

        if (!target) return "";

        if (reportCase.target_type === "POST") return target.content || "";
        if (reportCase.target_type === "COMMENT")
            return target.comment_detail || "";
        if (reportCase.target_type === "MESSAGE") return target.content || "";

        return "";
    }
</script>

<section class="adm-report-table-panel">
    {#if loading}
        <div class="adm-empty-state">Loading report cases...</div>
    {:else if cases.length === 0}
        <div class="adm-empty-state">
            <div class="adm-empty-pill">Report</div>
            <p>No report cases found</p>
            <span>No case matched the current filters.</span>
        </div>
    {:else}
        <div class="adm-report-table-scroll">
            <table class="adm-report-table">
                <thead>
                    <tr>
                        <th>Case</th>
                        <th>Target</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Severity</th>
                        <th>Reports</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th class="adm-text-right">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {#each cases as reportCase (reportCase.id)}
                        {@const targetContent = getTargetContent(reportCase)}

                        <tr>
                            <td>
                                <div class="adm-report-case-title">
                                    Case #{reportCase.id.slice(0, 8)}
                                </div>
                                <div class="adm-report-case-desc">
                                    {reportCase.is_auto_hidden
                                        ? "Auto-hidden"
                                        : "Manual review"}
                                </div>
                            </td>

                            <td>
                                <div class="adm-report-target-row-title">
                                    {getTargetTitle(reportCase)}
                                </div>

                                {#if targetContent}
                                    <div class="adm-report-target-row-desc">
                                        {targetContent}
                                    </div>
                                {/if}
                            </td>

                            <td>
                                <span class="adm-pill primary">
                                    {typeLabel(reportCase.target_type)}
                                </span>
                            </td>

                            <td>
                                <span class="adm-report-category">
                                    {reportCase.category_main || "-"}
                                </span>
                            </td>

                            <td>
                                <Badge
                                    color={statusColor(reportCase.status)}
                                    size="sm"
                                >
                                    {statusLabel(reportCase.status)}
                                </Badge>
                            </td>

                            <td>
                                <Badge
                                    color={severityColor(reportCase.severity)}
                                    size="sm"
                                >
                                    {severityLabel(reportCase.severity)}
                                </Badge>
                            </td>

                            <td>
                                <div class="adm-count-pill">
                                    {reportCase.report_count}
                                </div>
                            </td>

                            <td>
                                <span class="adm-report-priority-score">
                                    {reportCase.priority_score}
                                </span>
                            </td>

                            <td>{formatDate(reportCase.created_at)}</td>

                            <td>
                                <div class="adm-row-actions">
                                    <button
                                        type="button"
                                        class="adm-icon-btn"
                                        aria-label={`View case ${reportCase.id}`}
                                        title="View case"
                                        onclick={() => onView(reportCase)}
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

        <div class="adm-pagination">
            <p>
                Showing {getShowingStart()}–{getShowingEnd()} of {total} cases
            </p>

            <div class="adm-pagination-actions">
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
