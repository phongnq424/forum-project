<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    import { profileService } from "$lib/services/profile.service";
    import { postService } from "$lib/services/post.service";
    import { reportService } from "$lib/services/report.service";
    import { followService } from "$lib/services/follow.service";
    import { authState } from "$lib/states/auth.svelte";

    import PublicProfileHeader from "$lib/components/profile/PublicProfileHeader.svelte";
    import ProfileStats from "$lib/components/profile/ProfileStats.svelte";
    import ProfilePost from "$lib/components/profile/ProfilePost.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    import type { Profile } from "$lib/types/profile.type";
    import type { Post } from "$lib/types/post.type";

    let profile = $state<Profile | null>(null);
    let posts = $state<Post[]>([]);
    let loading = $state(true);
    let errorMessage = $state("");
    let isFollowing = $state(false);
    let followLoading = $state(false);

    let userId = $derived(String(page.params.id));

    onMount(async () => {
        if (!userId) {
            loading = false;
            errorMessage = "User not found.";
            return;
        }

        if (authState.user?.id === userId) {
            goto("/profile");
            return;
        }

        try {
            const [profileData, postsData] = await Promise.all([
                profileService.getProfileById(userId),
                postService.getByUser(userId, { page: 1, limit: 10 }),
            ]);

            profile = profileData;
            posts = postsData?.data || [];
            isFollowing = Boolean(profileData.isFollowing);
        } catch (error) {
            console.error("Failed to load public profile:", error);
            errorMessage = "Failed to load this profile.";
        } finally {
            loading = false;
        }
    });

    async function handleFollow() {
        if (!profile || followLoading) return;

        const previousFollowing = isFollowing;
        const previousFollowerCount = profile.followerCount || 0;

        followLoading = true;
        isFollowing = !isFollowing;
        profile.followerCount = isFollowing
            ? previousFollowerCount + 1
            : Math.max(previousFollowerCount - 1, 0);

        try {
            const result = await followService.toggleFollow(profile.User.id);

            isFollowing = result.followed;
            profile.followerCount = result.followed
                ? previousFollowerCount + 1
                : Math.max(previousFollowerCount - 1, 0);
        } catch (error) {
            console.error("Follow failed:", error);

            isFollowing = previousFollowing;
            profile.followerCount = previousFollowerCount;
        } finally {
            followLoading = false;
        }
    }

    function handleMessage() {
        if (!profile) return;

        // Tùy route chat của bạn, sửa lại cho đúng.
        goto(`/messages?userId=${profile.User.id}`);
    }

    async function handleReportUser() {
        if (!profile) return;

        try {
            await reportService.create({
                type: "USER",
                targetId: profile.User.id,
                title: `Report user: ${profile.User.username}`,
                reason: "This user was reported by another user.",
                severity: "MEDIUM",
            });

            console.log("Report submitted");
        } catch (error) {
            console.error("Report user failed:", error);
        }
    }
</script>

<svelte:head>
    <title>
        {profile
            ? `${profile.User.fullname || profile.User.username} | Profile`
            : "User Profile"}
    </title>
</svelte:head>

{#if loading}
    <Loading message="Loading profile..." size="md" />
{:else if errorMessage}
    <div class="profile-error">
        <Card variant="default" padding="24px" hover={false}>
            <div class="error-content">
                <Icon name="help-circle" size={28} />
                <h3>{errorMessage}</h3>
                <p>This user may not exist or the profile is unavailable.</p>
            </div>
        </Card>
    </div>
{:else if profile}
    <div class="profile-layout">
        <div class="main-content">
            <PublicProfileHeader
                {profile}
                {isFollowing}
                {followLoading}
                onFollow={handleFollow}
                onMessage={handleMessage}
                onReport={handleReportUser}
            />

            <ProfilePost {posts} postCount={profile.postCount} />
        </div>

        <aside class="sidebar">
            <ProfileStats
                followerCount={profile.followerCount}
                followingCount={profile.followingCount}
            />

            <Card variant="default" padding="20px" hover={false}>
                <h3 class="sidebar-title">About</h3>

                <div class="about-list">
                    <div class="about-item">
                        <span class="label">Username</span>
                        <span class="value">@{profile.User.username}</span>
                    </div>

                    <div class="about-item">
                        <span class="label">Role</span>
                        <span class="value">{profile.User.role || "USER"}</span>
                    </div>

                    <div class="about-item">
                        <span class="label">Joined</span>
                        <span class="value">
                            {new Date(
                                profile.User.created_at,
                            ).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </Card>
        </aside>
    </div>
{/if}

<style>
    .profile-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 24px;
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 20px;
    }

    .sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .sidebar-title {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 16px;
        text-transform: uppercase;
    }

    .about-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .about-item {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .about-item .label {
        font-size: 13px;
        color: #a1a1aa;
    }

    .about-item .value {
        font-size: 13px;
        color: #e5e7eb;
        font-weight: 600;
        text-align: right;
    }

    .profile-error {
        max-width: 560px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    .error-content {
        text-align: center;
        color: #d1d5db;
    }

    .error-content h3 {
        color: #fff;
        margin: 12px 0 8px;
        font-size: 18px;
    }

    .error-content p {
        margin: 0;
        color: #9ca3af;
        font-size: 14px;
    }

    @media (max-width: 850px) {
        .profile-layout {
            grid-template-columns: 1fr;
        }

        .sidebar {
            order: -1;
        }
    }
</style>
