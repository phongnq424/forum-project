<script lang="ts">
    import type {
        ReportTargetPreview,
        ReportTargetType,
    } from "$lib/types/report.type";
    import { typeLabel } from "$lib/utils/report.utils";

    let { target, targetType, targetId } = $props<{
        target?: ReportTargetPreview | null;
        targetType: ReportTargetType;
        targetId: string;
    }>();

    const title = $derived.by(() => {
        if (!target) return "Unknown target";

        if (targetType === "USER") {
            return target.fullname || target.username || target.id;
        }

        if (targetType === "POST") {
            return target.title || target.id;
        }

        if (targetType === "COMMENT") {
            return "Comment";
        }

        if (targetType === "MESSAGE") {
            return "Message";
        }

        return "Unknown target";
    });

    const content = $derived.by(() => {
        if (!target) return null;

        if (targetType === "POST") return target.content || null;
        if (targetType === "COMMENT") return target.comment_detail || null;
        if (targetType === "MESSAGE") return target.content || null;

        return null;
    });

    const owner = $derived.by(() => {
        if (!target) return null;

        if (target.User) return target.User;
        if (target.Sender) return target.Sender;

        if (targetType === "USER") {
            return {
                id: target.id,
                username: target.username,
                fullname: target.fullname,
                avatar: target.avatar,
                status: target.status,
            };
        }

        return null;
    });
</script>

<section class="target-card">
    <div class="section-header">
        <div>
            <p class="eyebrow">Reported Target</p>
            <h3>{title}</h3>
        </div>

        <span class="type-pill">{typeLabel(targetType)}</span>
    </div>

    <div class="meta-grid">
        <div>
            <span>Target ID</span>
            <p>{targetId}</p>
        </div>

        <div>
            <span>Target Type</span>
            <p>{typeLabel(targetType)}</p>
        </div>
    </div>

    {#if owner}
        <div class="owner-block">
            <span>Owner</span>
            <p>
                {owner.fullname || owner.username || owner.id}
            </p>
        </div>
    {/if}

    {#if content}
        <div class="content-block">
            {content}
        </div>
    {:else}
        <div class="empty-content">
            No target content is available from backend.
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

    @media (max-width: 640px) {
        .section-header,
        .meta-grid {
            grid-template-columns: 1fr;
            display: grid;
        }
    }
</style>
