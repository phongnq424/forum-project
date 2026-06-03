<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import type { ReportTarget } from "$lib/types/report.type";
    import { typeLabel } from "$lib/utils/report.utils";

    let { target } = $props<{
        target: ReportTarget;
    }>();
</script>

<section class="target-card">
    <div class="section-header">
        <div>
            <p class="eyebrow">Reported Target</p>
            <h3>{target.title || "Unknown target"}</h3>
        </div>

        <span class="type-pill">{typeLabel(target.type)}</span>
    </div>

    <div class="meta-grid">
        <div>
            <span>Target ID</span>
            <p>{target.id || "-"}</p>
        </div>

        <div>
            <span>Target Type</span>
            <p>{typeLabel(target.type)}</p>
        </div>
    </div>

    {#if target.owner}
        <div class="owner-block">
            <span>Owner</span>
            <p>
                {target.owner.fullname ||
                    target.owner.username ||
                    target.owner.id}
            </p>
        </div>
    {/if}

    {#if target.content}
        <div class="content-block">
            {target.content}
        </div>
    {:else}
        <div class="empty-content">
            No target content is available from backend.
        </div>
    {/if}

    {#if target.url}
        <div class="footer">
            <Button
                variant="secondary"
                type="button"
                onclick={() => {
                    window.open(
                        target.url || "",
                        "_blank",
                        "noopener,noreferrer",
                    );
                }}
            >
                Open Target
            </Button>
        </div>
    {/if}
</section>

<style>
    .target-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.12);
        background: #111318;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #a78bfa;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h3 {
        margin: 0;
        color: #f8fafc;
        font-size: 15px;
        line-height: 1.45;
        font-weight: 650;
        letter-spacing: -0.01em;
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
        white-space: nowrap;
    }

    .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    .meta-grid div,
    .owner-block {
        padding: 10px;
        border-radius: 12px;
        background: #0f1218;
        border: 1px solid rgba(148, 163, 184, 0.08);
        min-width: 0;
    }

    span {
        display: block;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    p {
        margin: 5px 0 0;
        color: #e5e7eb;
        font-size: 13px;
        line-height: 1.45;
        word-break: break-word;
    }

    .content-block,
    .empty-content {
        padding: 14px;
        border-radius: 12px;
        background: #0f1218;
        border: 1px solid rgba(148, 163, 184, 0.08);
        color: #d1d5db;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 220px;
        overflow: auto;
    }

    .empty-content {
        color: #64748b;
        font-style: italic;
    }

    .footer {
        display: flex;
        justify-content: flex-end;
    }

    @media (max-width: 640px) {
        .section-header,
        .meta-grid {
            grid-template-columns: 1fr;
            display: grid;
        }
    }
</style>
