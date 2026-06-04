<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    import Card from "$lib/components/ui/Card.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";

    import { followService } from "$lib/services/follow.service";
    import { profileService } from "$lib/services/profile.service";
    import type {
        FollowUser,
        FollowerItem,
        FollowingItem,
    } from "$lib/types/follow.type";

    type TabType = "followers" | "following";

    type NormalizedConnection = {
        id: string;
        username: string;
        fullname?: string | null;
        avatar?: string | null;
    };

    let userId = $derived(String(page.params.id));

    let activeTab = $state<TabType>("followers");
    let search = $state("");
    let loading = $state(true);
    let errorMessage = $state("");

    let followers = $state<NormalizedConnection[]>([]);
    let following = $state<NormalizedConnection[]>([]);

    let followersTotal = $state(0);
    let followingTotal = $state(0);

    let currentResultTotal = $state(0);

    let pageNumber = $state(1);
    let limit = $state(20);
    let totalPages = $state(1);

    let searchTimer: ReturnType<typeof setTimeout> | null = null;

    function getAvatar(user: FollowUser) {
        return user.avatar || user.Profile?.avatar || null;
    }

    function normalizeFollower(item: FollowerItem): NormalizedConnection {
        return {
            id: item.follower.id,
            username: item.follower.username,
            fullname: item.follower.fullname,
            avatar: getAvatar(item.follower),
        };
    }

    function normalizeFollowing(item: FollowingItem): NormalizedConnection {
        return {
            id: item.followed.id,
            username: item.followed.username,
            fullname: item.followed.fullname,
            avatar: getAvatar(item.followed),
        };
    }

    function currentList() {
        return activeTab === "followers" ? followers : following;
    }

    async function loadProfileStats() {
        if (!userId) return;

        try {
            const profile = await profileService.getProfileById(userId);

            followersTotal = profile.followerCount || 0;
            followingTotal = profile.followingCount || 0;
        } catch (error) {
            console.error("Failed to load profile stats:", error);
        }
    }

    function currentTotal() {
        return activeTab === "followers" ? followersTotal : followingTotal;
    }

    async function loadConnections(nextPage = 1) {
        if (!userId) return;

        loading = true;
        errorMessage = "";

        try {
            const params = {
                page: nextPage,
                limit,
                search: search.trim() || undefined,
            };

            if (activeTab === "followers") {
                const res = await followService.getFollowers(userId, params);

                followers = res.data.map(normalizeFollower);
                currentResultTotal = res.pagination.total;
                totalPages = res.pagination.totalPages;

                if (!search.trim()) {
                    followersTotal = res.pagination.total;
                }
            } else {
                const res = await followService.getFollowing(userId, params);

                following = res.data.map(normalizeFollowing);
                currentResultTotal = res.pagination.total;
                totalPages = res.pagination.totalPages;

                if (!search.trim()) {
                    followingTotal = res.pagination.total;
                }
            }

            pageNumber = nextPage;
        } catch (error) {
            console.error("Failed to load connections:", error);
            errorMessage = "Failed to load users.";
        } finally {
            loading = false;
        }
    }

    function switchTab(tab: TabType) {
        if (activeTab === tab) return;

        activeTab = tab;
        pageNumber = 1;
        loadConnections(1);
    }

    function handleSearchInput() {
        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        searchTimer = setTimeout(() => {
            pageNumber = 1;
            loadConnections(1);
        }, 350);
    }

    function openProfile(id: string) {
        goto(`/profile/${id}`);
    }

    onMount(() => {
        const tab = page.url.searchParams.get("tab");

        if (tab === "following") {
            activeTab = "following";
        } else {
            activeTab = "followers";
        }

        loadProfileStats();
        loadConnections(1);

        return () => {
            if (searchTimer) {
                clearTimeout(searchTimer);
            }
        };
    });
</script>

<svelte:head>
    <title>Connections | Profile</title>
</svelte:head>

<div class="connections-page">
    <Card variant="default" padding="0" hover={false}>
        <div class="page-header">
            <div>
                <p class="eyebrow">Profile</p>
                <h1>Connections</h1>
                <p class="subtitle">
                    View followers and following users in one place.
                </p>
            </div>

            <Button
                variant="secondary"
                onclick={() => goto(`/profile/${userId}`)}
            >
                Back to Profile
            </Button>
        </div>

        <div class="tabs">
            <button
                type="button"
                class:active={activeTab === "followers"}
                onclick={() => switchTab("followers")}
            >
                Followers
                <span>{followersTotal}</span>
            </button>

            <button
                type="button"
                class:active={activeTab === "following"}
                onclick={() => switchTab("following")}
            >
                Following
                <span>{followingTotal}</span>
            </button>
        </div>

        <div class="toolbar">
            <Input
                bind:value={search}
                placeholder={activeTab === "followers"
                    ? "Search followers..."
                    : "Search following..."}
                oninput={handleSearchInput}
            >
                {#snippet icon()}
                    <Icon name="search" size={18} />
                {/snippet}
            </Input>
        </div>

        {#if errorMessage}
            <div class="error-box">{errorMessage}</div>
        {/if}

        <div class="list-area">
            {#if loading}
                <div class="loading-state">
                    <Loading size="md" message="Loading users..." />
                </div>
            {:else if currentList().length === 0}
                <div class="empty-state">
                    <Icon name="user" size={34} />
                    <p>
                        {activeTab === "followers"
                            ? "No followers found."
                            : "No following users found."}
                    </p>
                </div>
            {:else}
                <div class="user-list">
                    {#each currentList() as user (user.id)}
                        <a class="user-row" href={`/profile/${user.id}`}>
                            <Avatar
                                name={user.fullname || user.username}
                                src={user.avatar ?? undefined}
                                size="md"
                            />

                            <div class="user-info">
                                <span class="name">
                                    {user.fullname || user.username}
                                </span>
                                <span class="username">@{user.username}</span>
                            </div>

                            <Icon name="arrow-right" size={18} />
                        </a>
                    {/each}
                </div>
            {/if}
        </div>

        {#if !loading && totalPages > 1}
            <div class="pagination">
                <Button
                    variant="secondary"
                    disabled={pageNumber <= 1}
                    onclick={() => loadConnections(Math.max(1, pageNumber - 1))}
                >
                    Previous
                </Button>

                <span>Page {pageNumber} of {totalPages}</span>

                <Button
                    variant="secondary"
                    disabled={pageNumber >= totalPages}
                    onclick={() =>
                        loadConnections(Math.min(totalPages, pageNumber + 1))}
                >
                    Next
                </Button>
            </div>
        {/if}
    </Card>
</div>

<style>
    .connections-page {
        max-width: 860px;
        margin: 0 auto;
        padding: 0 20px;
    }

    .page-header {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .eyebrow {
        margin: 0 0 6px;
        color: #a78bfa;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .page-header h1 {
        margin: 0;
        color: #fff;
        font-size: 24px;
        font-weight: 800;
    }

    .subtitle {
        margin: 8px 0 0;
        color: #9ca3af;
        font-size: 14px;
    }

    .tabs {
        display: flex;
        gap: 8px;
        padding: 16px 24px 0;
    }

    .tabs button {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #111318;
        color: #9ca3af;
        padding: 9px 14px;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
    }

    .tabs button.active {
        color: #fff;
        background: rgba(99, 102, 241, 0.16);
        border-color: rgba(99, 102, 241, 0.45);
    }

    .tabs span {
        color: #c4b5fd;
        font-size: 12px;
    }

    .toolbar {
        padding: 16px 24px;
    }

    .error-box {
        margin: 0 24px 16px;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(239, 68, 68, 0.12);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.28);
        font-size: 14px;
    }

    .list-area {
        padding: 0 24px 24px;
        min-height: 260px;
    }

    .loading-state,
    .empty-state {
        min-height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .empty-state {
        flex-direction: column;
        gap: 10px;
        color: #6b7280;
    }

    .empty-state p {
        margin: 0;
        color: #9ca3af;
        font-size: 14px;
    }

    .user-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .user-row {
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: #111318;
        border-radius: 14px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #d1d5db;
        text-align: left;
        cursor: pointer;
        text-decoration: none;
        transition:
            background-color 0.16s ease,
            border-color 0.16s ease,
            transform 0.16s ease;
    }

    .user-row:hover {
        background: #171b24;
        border-color: rgba(99, 102, 241, 0.35);
        transform: translateY(-1px);
    }

    .user-info {
        flex: 1;
        min-width: 0;
    }

    .name {
        display: block;
        color: #f3f4f6;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .username {
        display: block;
        margin-top: 3px;
        color: #8b949e;
        font-size: 13px;
    }

    .pagination {
        padding: 16px 24px 24px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        color: #9ca3af;
        font-size: 13px;
    }

    @media (max-width: 650px) {
        .connections-page {
            padding: 0 10px;
        }

        .page-header {
            flex-direction: column;
        }

        .tabs,
        .toolbar,
        .list-area,
        .pagination {
            padding-left: 16px;
            padding-right: 16px;
        }

        .pagination {
            justify-content: space-between;
        }
    }
</style>
