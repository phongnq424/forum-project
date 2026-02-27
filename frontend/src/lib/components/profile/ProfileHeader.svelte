<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import type { Profile } from "$lib/types/profile.type";

    let { profile, onEdit, onLogout } = $props<{
        profile: Profile;
        onEdit: () => void;
        onLogout: () => void;
    }>();

    function getInitial(name?: string) {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
    }

    function formatGender(gender?: string) {
        if (gender === "MALE") return "Male";
        if (gender === "FEMALE") return "Female";
        if (gender === "OTHER") return "Other";
        return "";
    }
</script>

<Card padding="0" variant="default" hover={false}>
    <div class="cover-wrapper">
        <div
            class="cover-bg"
            style="background-image: url({profile.cover ||
                'https://i.pinimg.com/originals/a0/0a/73/a00a73646536551b9e6ec567f52f3607.jpg'})"
        ></div>
        <div class="avatar-overlap">
            {#if profile.User.avatar}
                <img
                    src={profile.User.avatar}
                    alt="avatar"
                    class="profile-avatar"
                />
            {:else}
                <div class="default-avatar">
                    {getInitial(profile.User.fullname || profile.User.username)}
                </div>
            {/if}
        </div>
    </div>

    <div class="profile-header-info">
        <div class="name-box">
            <div class="flex-row">
                <h1>{profile.User.fullname || profile.User.username}</h1>
                {#if profile.User.role === "ADMIN"}
                    <Badge color="danger" size="sm">STAFF</Badge>
                {/if}
            </div>
            <span class="username">@{profile.User.username}</span>
        </div>

        <div class="actions" style="gap: 8px; display: flex;">
            <Button variant="primary" onclick={onEdit}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    style="margin-right: 6px;"
                    ><path
                        d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                    /></svg
                >
                Edit Profile
            </Button>
            <Button
                variant="danger"
                style="background-color: #ef4444; color: white; border: none;"
                onclick={onLogout}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    style="margin-right: 6px;"
                    ><path
                        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                    /><polyline points="16 17 21 12 16 7" /><line
                        x1="21"
                        y1="12"
                        x2="9"
                        y2="12"
                    /></svg
                >
                Logout
            </Button>
        </div>
    </div>

    <div class="bio-container">
        <p class="bio-text">{profile.bio || "No bio yet."}</p>
        <div class="meta-info">
            {#if profile.location}<span class="meta-item"
                    >📍 {profile.location}</span
                >{/if}
            {#if profile.gender}<span class="meta-item"
                    >👤 {formatGender(profile.gender)}</span
                >{/if}
            {#if profile.dob}<span class="meta-item"
                    >🎂 {new Date(profile.dob).toLocaleDateString()}</span
                >{/if}
            <span class="meta-item"
                >📅 Joined {new Date(
                    profile.User.created_at,
                ).toLocaleDateString()}</span
            >
        </div>
    </div>
</Card>

<style>
    /* Styles cho Cover, Avatar, Header Info, Bio (Giữ nguyên từ code gốc của ông) */
    .cover-wrapper {
        position: relative;
        height: 180px;
        border-radius: 18px 18px 0 0;
    }
    .cover-bg {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-color: #2a2e36;
        border-radius: 18px 18px 0 0;
    }
    .avatar-overlap {
        position: absolute;
        bottom: -50px;
        left: 24px;
        padding: 4px;
        background: #14161c;
        border-radius: 24px;
    }
    .profile-avatar {
        width: 100px;
        height: 100px;
        border-radius: 20px;
        object-fit: cover;
    }
    .default-avatar {
        width: 100px;
        height: 100px;
        border-radius: 20px;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 44px;
        font-weight: 700;
        color: white;
    }
    .profile-header-info {
        padding: 60px 24px 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
    .name-box h1 {
        font-size: 22px;
        font-weight: 700;
        margin: 0;
        color: #fff;
    }
    .username {
        color: #6b7280;
        font-size: 14px;
    }
    .bio-container {
        padding: 0 24px 24px;
    }
    .bio-text {
        font-size: 14px;
        line-height: 1.6;
        color: #d1d5db;
        margin-bottom: 16px;
    }
    .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        font-size: 13px;
        color: #9ca3af;
    }
    .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .flex-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>
