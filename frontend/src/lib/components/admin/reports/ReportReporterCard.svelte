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

<section class="reporter-card">
    <p class="eyebrow">Reporter</p>

    <div class="reporter-main">
        <Avatar src={reporter?.avatar} name={displayName} size="md" />

        <div>
            <h3>{displayName}</h3>

            {#if reporter?.username}
                <p>@{reporter.username}</p>
            {:else}
                <p>No username available</p>
            {/if}
        </div>
    </div>

    <div class="meta-block">
        <span>Reporter ID</span>
        <p>{reporter?.id || "-"}</p>
    </div>
</section>

<style>
    .reporter-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.12);
        background: #111318;
    }

    .eyebrow {
        margin: 0;
        color: #a78bfa;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .reporter-main {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    h3 {
        margin: 0;
        color: #f8fafc;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 650;
    }

    p {
        margin: 4px 0 0;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.45;
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
        color: #e5e7eb;
        word-break: break-word;
    }
</style>
