<script lang="ts">
    import { onMount } from "svelte";
    import { profileService } from "$lib/services/profile.service";
    import { postService } from "$lib/services/post.service";
    import { authService } from "$lib/services/auth.service";
    import { authState } from "$lib/states/auth.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import { interestedTopicService } from "$lib/services/interested-topic.service";

    import ProfileHeader from "$lib/components/profile/ProfileHeader.svelte";
    import ProfileStats from "$lib/components/profile/ProfileStats.svelte";
    import ProfilePost from "$lib/components/profile/ProfilePost.svelte";
    import ProfileInterestedTopics from "$lib/components/profile/ProfileInterestedTopics.svelte";
    import EditProfileModal from "$lib/components/profile/EditProfileModal.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    import type { Topic } from "$lib/types/topic.type";

    let profile = $state<any>(null);
    let posts = $state<any[]>([]);
    let topics = $state<Topic[]>([]);
    let selectedTopicIds = $state<string[]>([]);
    let isEditModalOpen = $state(false);
    let isLogoutModalOpen = $state(false);
    let loading = $state(true);
    let currentUserId = $state<string | null>(null);
    onMount(async () => {
        const userId = authState.user?.id;
        if (!userId) {
            loading = false;
            return;
        }

        currentUserId = userId;

        try {
            const [profData, postsData, topicsData, myTopicsData] =
                await Promise.all([
                    profileService.getMyProfile(),
                    postService.getByUser(userId, { page: 1, limit: 10 }),
                    adminTopicService.listTopics({ page: 1, limit: 100 }),
                    interestedTopicService.getMyTopics(),
                ]);

            profile = profData;
            posts = postsData?.data || [];
            topics = topicsData?.data || [];
            selectedTopicIds = myTopicsData.map((item) => item.topic_id);
        } catch (e) {
            console.error("Error:", e);
        } finally {
            loading = false;
        }
    });

    function handleUpdated(data: any) {
        profile.User.fullname = data.fullname;
        profile.bio = data.bio;
        profile.location = data.location;
        profile.gender = data.gender;
        profile.dob = data.dob;
        if (data.avatar) profile.User.avatar = data.avatar;
        if (data.cover) profile.cover = data.cover;
    }

    async function handleLogout() {
        loading = true;
        await authService.logout();
        window.location.href = "/login";
    }
</script>

{#if loading}
    <Loading message="Loading profiles..." size="md" />
{:else if profile}
    <div class="profile-layout">
        <div class="main-content">
            <ProfileHeader
                {profile}
                onEdit={() => (isEditModalOpen = true)}
                onLogout={() => (isLogoutModalOpen = true)}
            />
            <ProfilePost {posts} postCount={profile.postCount} />
        </div>

        <aside class="sidebar">
            <ProfileStats
                followerCount={profile.followerCount}
                followingCount={profile.followingCount}
                userId={profile.User?.id || currentUserId || undefined}
            />

            <ProfileInterestedTopics {topics} bind:selectedTopicIds />

            <Card variant="default" padding="20px" hover={false}>
                <h3 class="sidebar-title">Recent Contests</h3>
                <div class="contest-mini">
                    <div class="contest-icon">
                        <Icon name="trophy" size={20} />
                    </div>
                    <div class="contest-info">
                        <p class="c-name">Windflow Pro #2</p>
                        <p class="c-rank">Ranked #12</p>
                    </div>
                </div>
            </Card>
        </aside>
    </div>

    <EditProfileModal
        bind:open={isEditModalOpen}
        {profile}
        onUpdated={handleUpdated}
    />

    <Modal
        bind:open={isLogoutModalOpen}
        title="Confirm Logout"
        maxWidth="400px"
    >
        <div style="padding: 10px 0; color: #d1d5db; font-size: 15px;">
            Are you sure you want to log out?
        </div>
        {#snippet footer()}
            <div
                style="display: flex; gap: 12px; justify-content: flex-end; width: 100%;"
            >
                <Button
                    variant="secondary"
                    onclick={() => (isLogoutModalOpen = false)}>CANCEL</Button
                >
                <Button
                    variant="danger"
                    onclick={handleLogout}
                    disabled={loading}
                >
                    {loading ? "LOGGING OUT..." : "LOGOUT"}
                </Button>
            </div>
        {/snippet}
    </Modal>
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
    .contest-mini {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .c-name {
        margin: 0;
        font-size: 14px;
        color: #e5e7eb;
        font-weight: 500;
    }
    .c-rank {
        margin: 4px 0 0;
        font-size: 12px;
        color: #10b981;
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
