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

<section class="adm-report-target-card">
    <div class="adm-report-section-header">
        <div>
            <p class="adm-eyebrow">Reported Target</p>
            <h3 class="adm-report-target-title">{title}</h3>
        </div>

        <span class="adm-pill primary">{typeLabel(targetType)}</span>
    </div>

    <div class="adm-report-target-meta-grid">
        <div class="adm-report-target-meta-item">
            <span class="adm-meta-label">Target ID</span>
            <p class="adm-meta-value">{targetId}</p>
        </div>

        <div class="adm-report-target-meta-item">
            <span class="adm-meta-label">Target Type</span>
            <p class="adm-meta-value">{typeLabel(targetType)}</p>
        </div>
    </div>

    {#if owner}
        <div class="adm-report-target-owner-block">
            <span class="adm-meta-label">Owner</span>
            <p class="adm-meta-value">
                {owner.fullname || owner.username || owner.id}
            </p>
        </div>
    {/if}

    {#if content}
        <div class="adm-report-target-content-block">
            {content}
        </div>
    {:else}
        <div class="adm-report-target-empty-content">
            No target content is available from backend.
        </div>
    {/if}
</section>
