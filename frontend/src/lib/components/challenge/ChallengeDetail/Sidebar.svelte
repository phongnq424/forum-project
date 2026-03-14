<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { Challenge } from "$lib/types/challenge.type";

    // Khai báo rõ ràng để không bị lỗi TypeScript "known properties"
    let { challenge } = $props<{ challenge: Challenge }>();
</script>

<aside class="sidebar">
    <Card padding="20px">
        <h3 class="sidebar-title">Challenge Info</h3>

        <div class="info-row">
            <span>Submissions</span>
            <span class="val">{challenge.totalSubmissions || 0}</span>
        </div>

        <div class="info-row">
            <span>Points</span>
            <span class="val highlight">{challenge.score || 0}</span>
        </div>

        <div class="info-row">
            <span>Time Limit</span>
            <span class="val">{challenge.time_limit} ms</span>
        </div>

        <div class="info-row">
            <span>Memory Limit</span>
            <span class="val">{challenge.memory_limit} MB</span>
        </div>

        <div class="info-row">
            <span>Type</span>
            <span class="val">{challenge.type}</span>
        </div>

        {#if challenge.tags && challenge.tags.length > 0}
            <div class="tags-section">
                <span>Tags</span>
                <div class="tags-list">
                    {#each challenge.tags as tag}
                        <Badge color="outline" size="sm">{tag}</Badge>
                    {/each}
                </div>
            </div>
        {/if}
    </Card>
</aside>

<style>
    /* CSS giữ nguyên như cũ, tui đã check, nó cover đủ các class trên */
    .sidebar-title {
        font-size: 16px;
        margin-bottom: 16px;
        color: #f3f4f6;
    }
    .info-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #2a2e36;
    }
    .info-row:last-child {
        border-bottom: none;
    }
    .info-row .val {
        color: #f9fafb;
        font-weight: 600;
    }
    .highlight {
        color: #6366f1 !important;
    }
    .tags-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #2a2e36;
    }
    .tags-section span {
        display: block;
        margin-bottom: 8px;
        color: #9ca3af;
    }
    .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
</style>
