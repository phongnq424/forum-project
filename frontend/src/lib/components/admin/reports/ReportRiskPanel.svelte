<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { Report, ReportSeverity } from "$lib/types/report.type";
    import {
        getRiskText,
        severityColor,
        severityLabel,
        shouldShowRecommendedSeverity,
    } from "$lib/utils/report.utils";

    let { report } = $props<{
        report: Report;
    }>();

    function getCountLabel(count?: number) {
        const value = count ?? 0;

        if (value === 1) return "1 report";
        return `${value} reports`;
    }

    function getRecommendationLabel(severity?: ReportSeverity | null) {
        if (!severity) return "-";
        return severityLabel(severity);
    }
</script>

<section class="risk-panel">
    <div class="risk-header">
        <div>
            <p class="eyebrow">Risk Signal</p>
            <h3>Target report frequency</h3>
        </div>

        <div class="count-pill">
            {getCountLabel(report.targetReportCount)}
        </div>
    </div>

    <p class="risk-text">{getRiskText(report)}</p>

    <div class="risk-grid">
        <div class="risk-item">
            <span>Current Severity</span>
            <Badge color={severityColor(report.severity)} size="sm">
                {severityLabel(report.severity)}
            </Badge>
        </div>

        <div class="risk-item">
            <span>Recommended</span>

            {#if report.recommendedSeverity}
                <Badge
                    color={severityColor(report.recommendedSeverity)}
                    size="sm"
                >
                    {getRecommendationLabel(report.recommendedSeverity)}
                </Badge>
            {:else}
                <p>-</p>
            {/if}
        </div>
    </div>

    {#if shouldShowRecommendedSeverity(report)}
        <div class="recommendation-note">
            System signal suggests reviewing severity. Admin should still make
            the final moderation decision.
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
