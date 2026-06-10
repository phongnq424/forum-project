<script lang="ts">
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import type { ReportUserSummary } from "$lib/types/report.type";

    let { reporter = null, fallbackName = "Unknown" } = $props<{
        reporter?: ReportUserSummary | null;
        fallbackName?: string;
    }>();

    const displayName = $derived(
        reporter?.fullname || reporter?.username || fallbackName || "Unknown",
    );
</script>

<section class="adm-detail-section">
    <p class="adm-eyebrow">Reporter</p>

    <div class="adm-summary-row">
        <Avatar src={reporter?.avatar} name={displayName} size="md" />

        <div class="adm-summary-text">
            <h3 class="adm-section-title">{displayName}</h3>

            {#if reporter?.username}
                <p class="adm-row-muted">@{reporter.username}</p>
            {:else}
                <p class="adm-row-muted">No username available</p>
            {/if}
        </div>
    </div>

    <div class="adm-meta-item">
        <span class="adm-meta-label">Reporter ID</span>
        <p class="adm-meta-value">{reporter?.id || "-"}</p>
    </div>
</section>
