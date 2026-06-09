<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { ReportCase } from "$lib/types/report.type";
    import { severityColor, severityLabel } from "$lib/utils/report.utils";

    let { reportCase } = $props<{
        reportCase: ReportCase;
    }>();

    function getCountLabel(count: number) {
        if (count === 1) return "1 report";
        return `${count} reports`;
    }

    const riskText = $derived.by(() => {
        if (reportCase.priority_score >= 90) {
            return "This case has a critical priority score and should be reviewed immediately.";
        }

        if (reportCase.priority_score >= 65) {
            return "This case has strong moderation signals and should be prioritized.";
        }

        if (reportCase.priority_score >= 35) {
            return "This case has moderate signals and should be reviewed normally.";
        }

        return "This case currently has low risk signals.";
    });
</script>

<section class="risk-panel">
    <div class="risk-header">
        <div>
            <p class="eyebrow">Risk Signal</p>
            <h3>Case priority and report frequency</h3>
        </div>

        <div class="count-pill">
            {getCountLabel(reportCase.report_count)}
        </div>
    </div>

    <p class="risk-text">{riskText}</p>

    <div class="risk-grid">
        <div class="risk-item">
            <span>Severity</span>
            <Badge color={severityColor(reportCase.severity)} size="sm">
                {severityLabel(reportCase.severity)}
            </Badge>
        </div>

        <div class="risk-item">
            <span>Priority Score</span>
            <p>{reportCase.priority_score}</p>
        </div>

        <div class="risk-item">
            <span>Main Category</span>
            <p>{reportCase.category_main || "-"}</p>
        </div>

        <div class="risk-item">
            <span>Auto Hidden</span>
            <p>{reportCase.is_auto_hidden ? "Yes" : "No"}</p>
        </div>
    </div>

    {#if reportCase.is_auto_hidden}
        <div class="recommendation-note">
            This target was automatically hidden because the case reached the
            auto-action threshold. Admin should still make the final decision.
        </div>
    {/if}
</section>

<style>
    .risk-panel {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
        border-radius: 14px;
        border: 1px solid rgba(245, 158, 11, 0.18);
        background: rgba(245, 158, 11, 0.055);
    }

    .risk-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #fbbf24;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h3 {
        margin: 0;
        color: #f8fafc;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 650;
    }

    .count-pill {
        display: inline-flex;
        align-items: center;
        height: 26px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(245, 158, 11, 0.14);
        color: #fbbf24;
        font-size: 12px;
        font-weight: 650;
        white-space: nowrap;
    }

    .risk-text {
        margin: 0;
        color: #d1d5db;
        font-size: 13px;
        line-height: 1.55;
    }

    .risk-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    .risk-item {
        padding: 10px;
        border-radius: 12px;
        background: rgba(15, 18, 24, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.08);
    }

    .risk-item span {
        display: block;
        margin-bottom: 8px;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .risk-item p {
        margin: 0;
        color: #e5e7eb;
        font-size: 13px;
    }

    .recommendation-note {
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(245, 158, 11, 0.1);
        color: #fde68a;
        font-size: 12px;
        line-height: 1.5;
    }

    @media (max-width: 640px) {
        .risk-header,
        .risk-grid {
            grid-template-columns: 1fr;
            display: grid;
        }
    }
</style>
