<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import type {
        ModerationActionType,
        ReportCase,
        ReportResolution,
    } from "$lib/types/report.type";
    import ReportRiskPanel from "./ReportRiskPanel.svelte";
    import ReportTargetCard from "./ReportTargetCard.svelte";
    import {
        formatDateTime,
        severityColor,
        severityLabel,
        statusColor,
        statusLabel,
        typeLabel,
    } from "$lib/utils/report.utils";

    let {
        reportCase,
        loading = false,
        error = "",
        note = $bindable(""),
        onAssign,
        onApplyAction,
        onResolve,
        onCloseCase,
        onClose,
    } = $props<{
        reportCase: ReportCase;
        loading?: boolean;
        error?: string;
        note: string;
        onAssign: () => void;
        onApplyAction: (action: ModerationActionType, note: string) => void;
        onResolve: (
            resolution: ReportResolution,
            action: ModerationActionType,
            note: string,
        ) => void;
        onCloseCase: (note: string) => void;
        onClose: () => void;
    }>();

    let actionValue = $state<ModerationActionType>("NONE");
    let resolutionValue = $state<ReportResolution>("VALID");

    const actionOptions: { value: ModerationActionType; label: string }[] = [
        { value: "NONE", label: "No Action" },
        { value: "HIDE_CONTENT", label: "Hide Content" },
        { value: "RESTORE_CONTENT", label: "Restore Content" },
        { value: "DELETE_CONTENT", label: "Delete Content" },
        { value: "LOCK_CONTENT", label: "Lock Content" },
        { value: "WARN_USER", label: "Warn User" },
        { value: "LIMIT_USER", label: "Limit User" },
        { value: "TEMP_BAN_USER", label: "Temporary Ban User" },
        { value: "PERMANENT_BAN_USER", label: "Permanent Ban User" },
        { value: "DISMISS_REPORT", label: "Dismiss Report" },
    ];

    const resolutionOptions: { value: ReportResolution; label: string }[] = [
        { value: "VALID", label: "Valid" },
        { value: "INVALID", label: "Invalid" },
        { value: "DUPLICATE", label: "Duplicate" },
        { value: "NOT_ENOUGH_EVIDENCE", label: "Not Enough Evidence" },
        { value: "AUTO_RESOLVED", label: "Auto Resolved" },
    ];

    const firstReporter = $derived(reportCase.Reports?.[0]?.Reporter || null);
</script>

<div class="adm-detail">
    {#if error}
        <div class="adm-alert-error">
            {error}
        </div>
    {/if}

    <section class="adm-detail-section">
        <div class="adm-detail-header">
            <div class="adm-summary-text">
                <p class="adm-eyebrow">Moderation Case</p>
                <h2 class="adm-title-sm">Case #{reportCase.id.slice(0, 8)}</h2>
                <p class="adm-description">
                    {typeLabel(reportCase.target_type)} · {reportCase.category_main ||
                        "No category"} · {reportCase.report_count} report{reportCase.report_count ===
                    1
                        ? ""
                        : "s"}
                </p>
            </div>

            <div class="adm-actions">
                <Badge size="sm">{typeLabel(reportCase.target_type)}</Badge>
                <Badge color={statusColor(reportCase.status)} size="sm">
                    {statusLabel(reportCase.status)}
                </Badge>
                <Badge color={severityColor(reportCase.severity)} size="sm">
                    {severityLabel(reportCase.severity)}
                </Badge>
            </div>
        </div>
    </section>

    <div class="adm-form-grid">
        <ReportTargetCard
            target={reportCase.target}
            targetType={reportCase.target_type}
            targetId={reportCase.target_id}
        />

        <section class="adm-detail-section adm-form">
            <div>
                <p class="adm-eyebrow">First Reporter</p>

                {#if firstReporter}
                    <h3 class="adm-section-title">
                        {firstReporter.fullname ||
                            firstReporter.username ||
                            firstReporter.id}
                    </h3>

                    {#if firstReporter.username}
                        <p class="adm-row-muted">@{firstReporter.username}</p>
                    {/if}
                {:else}
                    <h3 class="adm-section-title">Unknown</h3>
                    <p class="adm-row-muted">No reporter data available</p>
                {/if}
            </div>

            <div class="adm-meta-item">
                <span class="adm-meta-label">Total Reports</span>
                <p class="adm-meta-value">{reportCase.report_count}</p>
            </div>
        </section>
    </div>

    <ReportRiskPanel {reportCase} />

    <section class="adm-detail-section">
        <div class="adm-detail-header">
            <div>
                <p class="adm-eyebrow">Decision</p>
                <h3 class="adm-section-title">Moderation handling</h3>
            </div>

            <Button
                variant="secondary"
                type="button"
                disabled={loading || reportCase.status === "CLOSED"}
                onclick={onAssign}
            >
                Assign to Me
            </Button>
        </div>

        <div class="adm-form">
            <div class="adm-form-grid">
                <div class="adm-form-group">
                    <span class="adm-label-sm">Action</span>

                    <Select
                        bind:value={actionValue}
                        options={actionOptions}
                        placeholder="Select action"
                        disabled={loading || reportCase.status === "CLOSED"}
                    />
                </div>

                <div class="adm-form-group">
                    <span class="adm-label-sm">Resolution</span>

                    <Select
                        bind:value={resolutionValue}
                        options={resolutionOptions}
                        placeholder="Select resolution"
                        disabled={loading || reportCase.status === "CLOSED"}
                    />
                </div>
            </div>

            <div class="adm-form-group">
                <textarea
                    class="adm-textarea"
                    bind:value={note}
                    disabled={loading || reportCase.status === "CLOSED"}
                    placeholder="Add moderation note..."
                ></textarea>

                <div class="adm-actions">
                    <Button
                        variant="secondary"
                        type="button"
                        disabled={loading || reportCase.status === "CLOSED"}
                        onclick={() => onApplyAction(actionValue, note)}
                    >
                        Apply Action
                    </Button>

                    <Button
                        type="button"
                        disabled={loading || reportCase.status === "CLOSED"}
                        onclick={() =>
                            onResolve(resolutionValue, actionValue, note)}
                    >
                        Resolve Case
                    </Button>
                </div>
            </div>
        </div>
    </section>

    <section class="adm-detail-section">
        <div class="adm-meta-grid cols-3">
            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Case ID</span>
                <p class="adm-meta-value">{reportCase.id}</p>
            </div>

            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Created</span>
                <p class="adm-meta-value">
                    {formatDateTime(reportCase.created_at)}
                </p>
            </div>

            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Updated</span>
                <p class="adm-meta-value">
                    {formatDateTime(reportCase.updated_at)}
                </p>
            </div>
        </div>
    </section>

    <section class="adm-detail-section">
        <div class="adm-detail-header">
            <div>
                <p class="adm-eyebrow">Reports</p>
                <h3 class="adm-section-title">User-submitted reports</h3>
            </div>
        </div>

        {#if reportCase.Reports && reportCase.Reports.length > 0}
            <div class="adm-timeline">
                {#each reportCase.Reports as report (report.id)}
                    <article class="adm-timeline-item">
                        <p>{report.reason}</p>

                        {#if report.evidence}
                            <small>{report.evidence}</small>
                        {/if}

                        <span>
                            {report.category} · {formatDateTime(
                                report.created_at,
                            )}
                        </span>
                    </article>
                {/each}
            </div>
        {:else}
            <div class="adm-alert info">No reports available.</div>
        {/if}
    </section>

    <section class="adm-detail-section">
        <div class="adm-detail-header">
            <div>
                <p class="adm-eyebrow">Action Log</p>
                <h3 class="adm-section-title">Moderation history</h3>
            </div>
        </div>

        {#if reportCase.ActionLogs && reportCase.ActionLogs.length > 0}
            <div class="adm-timeline">
                {#each reportCase.ActionLogs as log (log.id)}
                    <article class="adm-timeline-item">
                        <p>{log.action}</p>

                        {#if log.reason}
                            <small>{log.reason}</small>
                        {/if}

                        <span>
                            {log.previous_status || "-"} → {log.new_status ||
                                "-"} · {formatDateTime(log.created_at)}
                        </span>
                    </article>
                {/each}
            </div>
        {:else}
            <div class="adm-alert info">No moderation actions yet.</div>
        {/if}
    </section>

    <div class="adm-modal-footer">
        {#if reportCase.status === "RESOLVED"}
            <Button
                variant="secondary"
                disabled={loading}
                onclick={() => onCloseCase(note)}
            >
                Close Case
            </Button>
        {/if}

        <Button variant="secondary" disabled={loading} onclick={onClose}>
            Close
        </Button>
    </div>
</div>
