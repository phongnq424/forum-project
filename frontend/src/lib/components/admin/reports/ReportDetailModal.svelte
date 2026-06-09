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

<div class="report-detail">
    {#if error}
        <div class="alert error">
            {error}
        </div>
    {/if}

    <section class="case-header">
        <div>
            <p class="eyebrow">Moderation Case</p>
            <h2>Case #{reportCase.id.slice(0, 8)}</h2>
            <p class="case-description">
                {typeLabel(reportCase.target_type)} · {reportCase.category_main ||
                    "No category"} · {reportCase.report_count} report{reportCase.report_count ===
                1
                    ? ""
                    : "s"}
            </p>
        </div>

        <div class="badge-row">
            <Badge size="sm">{typeLabel(reportCase.target_type)}</Badge>
            <Badge color={statusColor(reportCase.status)} size="sm">
                {statusLabel(reportCase.status)}
            </Badge>
            <Badge color={severityColor(reportCase.severity)} size="sm">
                {severityLabel(reportCase.severity)}
            </Badge>
        </div>
    </section>

    <div class="detail-grid">
        <ReportTargetCard
            target={reportCase.target}
            targetType={reportCase.target_type}
            targetId={reportCase.target_id}
        />

        <section class="reporter-card">
            <p class="eyebrow">First Reporter</p>

            {#if firstReporter}
                <h3>
                    {firstReporter.fullname ||
                        firstReporter.username ||
                        firstReporter.id}
                </h3>

                {#if firstReporter.username}
                    <p>@{firstReporter.username}</p>
                {/if}
            {:else}
                <h3>Unknown</h3>
                <p>No reporter data available</p>
            {/if}

            <div class="meta-block">
                <span>Total Reports</span>
                <p>{reportCase.report_count}</p>
            </div>
        </section>
    </div>

    <ReportRiskPanel {reportCase} />

    <section class="decision-section">
        <div class="section-title-row">
            <div>
                <p class="eyebrow">Decision</p>
                <h3>Moderation handling</h3>
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

        <div class="control-grid">
            <div class="control-field">
                <span>Action</span>

                <Select
                    bind:value={actionValue}
                    options={actionOptions}
                    placeholder="Select action"
                    disabled={loading || reportCase.status === "CLOSED"}
                />
            </div>

            <div class="control-field">
                <span>Resolution</span>

                <Select
                    bind:value={resolutionValue}
                    options={resolutionOptions}
                    placeholder="Select resolution"
                    disabled={loading || reportCase.status === "CLOSED"}
                />
            </div>
        </div>

        <div class="reply-box">
            <textarea
                bind:value={note}
                disabled={loading || reportCase.status === "CLOSED"}
                placeholder="Add moderation note..."
            ></textarea>

            <div class="reply-actions">
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
    </section>

    <section class="meta-section">
        <div>
            <span>Case ID</span>
            <p>{reportCase.id}</p>
        </div>

        <div>
            <span>Created</span>
            <p>{formatDateTime(reportCase.created_at)}</p>
        </div>

        <div>
            <span>Updated</span>
            <p>{formatDateTime(reportCase.updated_at)}</p>
        </div>
    </section>

    <section class="history-section">
        <div class="section-title-row">
            <div>
                <p class="eyebrow">Reports</p>
                <h3>User-submitted reports</h3>
            </div>
        </div>

        {#if reportCase.Reports && reportCase.Reports.length > 0}
            <div class="timeline">
                {#each reportCase.Reports as report (report.id)}
                    <article class="timeline-item">
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
            <div class="empty-history">No reports available.</div>
        {/if}
    </section>

    <section class="history-section">
        <div class="section-title-row">
            <div>
                <p class="eyebrow">Action Log</p>
                <h3>Moderation history</h3>
            </div>
        </div>

        {#if reportCase.ActionLogs && reportCase.ActionLogs.length > 0}
            <div class="timeline">
                {#each reportCase.ActionLogs as log (log.id)}
                    <article class="timeline-item">
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
            <div class="empty-history">No moderation actions yet.</div>
        {/if}
    </section>

    <div class="modal-footer">
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

<style>
    .report-detail {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .case-header,
    .decision-section,
    .meta-section,
    .history-section,
    .reporter-card {
        border: 1px solid rgba(148, 163, 184, 0.12);
        background: #111318;
        border-radius: 14px;
        padding: 16px;
    }

    .case-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #a78bfa;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h2,
    h3,
    p {
        margin: 0;
    }

    h2 {
        color: #f8fafc;
        font-size: 18px;
        font-weight: 650;
        line-height: 1.35;
        letter-spacing: -0.02em;
    }

    h3 {
        color: #f8fafc;
        font-size: 14px;
        font-weight: 650;
        line-height: 1.4;
    }

    .case-description {
        margin-top: 8px;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.55;
    }

    .badge-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: 1.25fr 0.75fr;
        gap: 14px;
    }

    .reporter-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .reporter-card p {
        color: #94a3b8;
        font-size: 13px;
    }

    .meta-block {
        padding: 10px;
        border-radius: 12px;
        background: #0f1218;
        border: 1px solid rgba(148, 163, 184, 0.08);
    }

    .meta-block span {
        display: block;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .meta-block p {
        margin-top: 6px;
        color: #e5e7eb;
    }

    .section-title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
    }

    .control-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    .control-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .control-field span {
        color: #94a3b8;
        font-size: 12px;
        font-weight: 650;
    }

    .meta-section {
        display: grid;
        grid-template-columns: 1.4fr repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    .meta-section div {
        min-width: 0;
    }

    .meta-section span {
        display: block;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .meta-section p {
        margin-top: 6px;
        color: #e5e7eb;
        font-size: 13px;
        line-height: 1.45;
        word-break: break-word;
    }

    .timeline {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .timeline-item {
        padding: 12px;
        border-radius: 12px;
        background: #0f1218;
        border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .timeline-item p {
        color: #e5e7eb;
        font-size: 13px;
        line-height: 1.5;
    }

    .timeline-item small {
        display: block;
        margin-top: 6px;
        color: #cbd5e1;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
    }

    .timeline-item span {
        display: block;
        margin-top: 6px;
        color: #64748b;
        font-size: 12px;
    }

    .empty-history {
        padding: 14px;
        border-radius: 12px;
        background: #0f1218;
        border: 1px solid rgba(148, 163, 184, 0.08);
        color: #64748b;
        font-size: 13px;
        text-align: center;
    }

    .reply-box {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    textarea {
        width: 100%;
        min-height: 90px;
        resize: vertical;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: #0f1218;
        color: #e5e7eb;
        padding: 12px;
        font-size: 13px;
        line-height: 1.55;
        outline: none;
        font-family: inherit;
    }

    textarea::placeholder {
        color: #64748b;
    }

    textarea:focus {
        border-color: rgba(139, 92, 246, 0.55);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.14);
    }

    .reply-actions,
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
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

    @media (max-width: 760px) {
        .case-header,
        .detail-grid,
        .control-grid,
        .meta-section {
            grid-template-columns: 1fr;
            display: grid;
        }

        .badge-row {
            justify-content: flex-start;
        }
    }
</style>
