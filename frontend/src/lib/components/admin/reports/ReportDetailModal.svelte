<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import type {
        Report,
        ReportSeverity,
        ReportStatus,
    } from "$lib/types/report.type";
    import ReportReporterCard from "./ReportReporterCard.svelte";
    import ReportRiskPanel from "./ReportRiskPanel.svelte";
    import ReportTargetCard from "./ReportTargetCard.svelte";
    import {
        formatDateTime,
        getTargetFromReport,
        severityColor,
        severityLabel,
        statusColor,
        statusLabel,
        typeLabel,
    } from "$lib/utils/report.utils";

    let {
        report,
        loading = false,
        error = "",
        replyMessage = $bindable(""),
        onStatusChange,
        onSeverityChange,
        onReply,
        onClose,
    } = $props<{
        report: Report;
        loading?: boolean;
        error?: string;
        replyMessage: string;
        onStatusChange: (status: ReportStatus) => void;
        onSeverityChange: (severity: ReportSeverity) => void;
        onReply: () => void;
        onClose: () => void;
    }>();

    let statusValue = $state<ReportStatus>(report.status);
    let severityValue = $state<ReportSeverity>(report.severity);

    const statusOptions: { value: ReportStatus; label: string }[] = [
        { value: "OPEN", label: "Open" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "RESOLVED", label: "Resolved" },
        { value: "CLOSED", label: "Closed" },
    ];

    const severityOptions: { value: ReportSeverity; label: string }[] = [
        { value: "LOW", label: "Low" },
        { value: "MEDIUM", label: "Medium" },
        { value: "HIGH", label: "High" },
        { value: "CRITICAL", label: "Critical" },
    ];

    $effect(() => {
        statusValue = report.status;
        severityValue = report.severity;
    });

    $effect(() => {
        if (statusValue !== report.status) {
            onStatusChange(statusValue);
        }
    });

    $effect(() => {
        if (severityValue !== report.severity) {
            onSeverityChange(severityValue);
        }
    });

    const target = $derived(getTargetFromReport(report));
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
            <h2>{report.title}</h2>
            <p class="case-description">
                {report.description || "No description provided."}
            </p>
        </div>

        <div class="badge-row">
            <Badge size="sm">{typeLabel(report.type)}</Badge>
            <Badge color={statusColor(report.status)} size="sm">
                {statusLabel(report.status)}
            </Badge>
            <Badge color={severityColor(report.severity)} size="sm">
                {severityLabel(report.severity)}
            </Badge>
        </div>
    </section>

    <div class="detail-grid">
        <ReportTargetCard {target} />

        <ReportReporterCard
            reporter={report.reporter}
            fallbackName={report.reportedBy}
        />
    </div>

    <ReportRiskPanel {report} />

    <section class="decision-section">
        <div class="section-title-row">
            <div>
                <p class="eyebrow">Decision</p>
                <h3>Moderation handling</h3>
            </div>
        </div>

        <div class="control-grid">
            <div class="control-field">
                <span>Status</span>

                <Select
                    bind:value={statusValue}
                    options={statusOptions}
                    placeholder="Select status"
                    disabled={loading}
                />
            </div>

            <div class="control-field">
                <span>Severity</span>

                <Select
                    bind:value={severityValue}
                    options={severityOptions}
                    placeholder="Select severity"
                    disabled={loading}
                />
            </div>
        </div>

        <div class="severity-help">
            <p>
                <strong>Low:</strong> minor issue or low-risk report.
            </p>
            <p>
                <strong>Medium:</strong> clear violation but not urgent.
            </p>
            <p>
                <strong>High:</strong> repeated reports or harmful behavior.
            </p>
            <p>
                <strong>Critical:</strong> urgent safety, privacy, security or severe
                abuse concern.
            </p>
        </div>
    </section>

    <section class="meta-section">
        <div>
            <span>Report ID</span>
            <p>{report.id}</p>
        </div>

        <div>
            <span>Created</span>
            <p>{formatDateTime(report.createdAt)}</p>
        </div>

        <div>
            <span>Updated</span>
            <p>{formatDateTime(report.updatedAt)}</p>
        </div>
    </section>

    <section class="history-section">
        <div class="section-title-row">
            <div>
                <p class="eyebrow">History</p>
                <h3>Notes and replies</h3>
            </div>
        </div>

        {#if report.replies && report.replies.length > 0}
            <div class="timeline">
                {#each report.replies as reply (reply.id)}
                    <article class="timeline-item">
                        <p>{reply.message}</p>
                        <span>{formatDateTime(reply.created_at)}</span>
                    </article>
                {/each}
            </div>
        {:else}
            <div class="empty-history">No moderation notes yet.</div>
        {/if}

        <div class="reply-box">
            <textarea
                bind:value={replyMessage}
                disabled={loading}
                placeholder="Add a moderation note or reply..."
            ></textarea>

            <div class="reply-actions">
                <Button
                    variant="secondary"
                    type="button"
                    disabled={loading || !replyMessage.trim()}
                    onclick={onReply}
                >
                    Add Note
                </Button>
            </div>
        </div>
    </section>

    <div class="modal-footer">
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
    .history-section {
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

    textarea:focus {
        border-color: rgba(139, 92, 246, 0.55);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.14);
    }

    textarea:focus {
        border-color: rgba(139, 92, 246, 0.55);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.14);
    }

    .severity-help {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin-top: 12px;
    }

    .severity-help p {
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.5;
        padding: 10px;
        border-radius: 10px;
        background: #0f1218;
        border: 1px solid rgba(148, 163, 184, 0.08);
    }

    .severity-help strong {
        color: #e5e7eb;
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
        .severity-help,
        .meta-section {
            grid-template-columns: 1fr;
            display: grid;
        }

        .badge-row {
            justify-content: flex-start;
        }
    }
</style>
