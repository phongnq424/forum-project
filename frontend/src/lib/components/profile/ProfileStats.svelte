<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";

    let { followerCount, followingCount, userId } = $props<{
        followerCount: number;
        followingCount: number;
        userId?: string;
    }>();

    function connectionHref(tab: "followers" | "following") {
        if (!userId) return "#";
        return `/profile/${userId}/connections?tab=${tab}`;
    }
</script>

<Card variant="elevated" padding="20px">
    <h3 class="sidebar-title">Statistics</h3>
    <div class="stats-list">
        <a class="stat-item clickable" href={connectionHref("followers")}>
            <span class="label">Followers</span>
            <span class="value">{followerCount}</span>
        </a>

        <a class="stat-item clickable" href={connectionHref("following")}>
            <span class="label">Following</span>
            <span class="value">{followingCount}</span>
        </a>

        <div class="stat-item">
            <span class="label">Total Points</span>
            <span class="value">1,240</span>
        </div>
    </div>
</Card>

<style>
    .sidebar-title {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        text-decoration: none;
    }

    .stat-item.clickable {
        cursor: pointer;
        transition:
            background-color 0.16s ease,
            padding-left 0.16s ease,
            padding-right 0.16s ease;
    }

    .stat-item.clickable:hover {
        background: rgba(99, 102, 241, 0.08);
        padding-left: 8px;
        padding-right: 8px;
        border-radius: 8px;
    }

    .stat-item .label {
        font-size: 13px;
        color: #a1a1aa;
    }

    .stat-item .value {
        font-weight: 700;
        color: #6366f1;
    }
</style>
