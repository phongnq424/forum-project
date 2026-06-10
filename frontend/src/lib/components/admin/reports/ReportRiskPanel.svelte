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

<section class="adm-risk-panel">
    <div class="adm-risk-header">
        <div>
            <p class="adm-eyebrow">Risk Signal</p>
            <h3 class="adm-section-title">
                Case priority and report frequency
            </h3>
        </div>

        <div class="adm-count-pill">
            {getCountLabel(reportCase.report_count)}
        </div>
    </div>

    <p class="adm-risk-text">{riskText}</p>

    <div class="adm-risk-grid">
        <div class="adm-risk-item">
            <span>Severity</span>
            <Badge color={severityColor(reportCase.severity)} size="sm">
                {severityLabel(reportCase.severity)}
            </Badge>
        </div>

        <div class="adm-risk-item">
            <span>Priority Score</span>
            <p>{reportCase.priority_score}</p>
        </div>

        <div class="adm-risk-item">
            <span>Main Category</span>
            <p>{reportCase.category_main || "-"}</p>
        </div>

        <div class="adm-risk-item">
            <span>Auto Hidden</span>
            <p>{reportCase.is_auto_hidden ? "Yes" : "No"}</p>
        </div>
    </div>

    {#if reportCase.is_auto_hidden}
        <div class="adm-note-warning">
            This target was automatically hidden because the case reached the
            auto-action threshold. Admin should still make the final decision.
        </div>
    {/if}
</section>
