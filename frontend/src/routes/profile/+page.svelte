<script lang="ts">
    import { onMount } from "svelte";
    import { profileService } from "$lib/services/profile.service";
    import { postService } from "$lib/services/post.service";
    import { authService } from "$lib/services/auth.service";
    import { user, updateUser } from "$lib/stores/auth.store";
    import type { Profile, UpdateProfileDTO } from "$lib/types/profile.type";

    // Components
    import Card from "$lib/components/Card.svelte";
    import Badge from "$lib/components/Badge.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import Select from "$lib/components/Select.svelte";

    let profile = $state<Profile | null>(null);
    let posts = $state<any[]>([]);
    let pagination = $state<any>(null);
    let isEditModalOpen = $state(false);
    let loading = $state(false);
    let isLogoutModalOpen = $state(false);

    // --- State cho Upload Ảnh ---
    let avatarFile = $state<File | null>(null);
    let coverFile = $state<File | null>(null);
    let avatarPreview = $state<string | null>(null);
    let coverPreview = $state<string | null>(null);

    let formData = $state<Omit<UpdateProfileDTO, "avatar" | "cover">>({
        fullname: "",
        bio: "",
        location: "",
        gender: "",
        dob: "",
    });

    onMount(async () => {
        const userId = $user?.id;
        if (!userId) return;

        const [profData, postsData] = await Promise.all([
            profileService.getMyProfile(),
            postService.getByUser(userId, { page: 1, limit: 10 }),
        ]);

        profile = profData;

        posts = postsData?.data || [];
        pagination = postsData?.pagination || null;

        if (profile) {
            formData.fullname = profile.User.fullname || "";
            formData.bio = profile.bio || "";
            formData.location = profile.location || "";
            formData.gender = profile.gender || "";

            if (profile.dob) {
                formData.dob = new Date(profile.dob)
                    .toISOString()
                    .split("T")[0];
            } else {
                formData.dob = "";
            }
        }
    });

    // Xử lý khi user chọn file
    function handleImageChange(event: Event, type: "avatar" | "cover") {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        // Tạo URL tạm thời để hiển thị preview
        const previewUrl = URL.createObjectURL(file);

        if (type === "avatar") {
            avatarFile = file;
            avatarPreview = previewUrl;
        } else {
            coverFile = file;
            coverPreview = previewUrl;
        }
    }

    async function handleSave() {
        if (!profile) return;
        loading = true;
        try {
            // Chuyển Data sang FormData để đính kèm file
            const submitData = new FormData();

            submitData.append("fullname", formData.fullname || "");
            submitData.append("bio", formData.bio || "");
            submitData.append("location", formData.location || "");
            submitData.append("gender", formData.gender || "");
            submitData.append("dob", formData.dob || "");

            // Nếu có chọn ảnh mới thì đính kèm file vào
            if (avatarFile) submitData.append("avatar", avatarFile);
            if (coverFile) submitData.append("cover", coverFile);

            // Gửi FormData lên service (đảm bảo profileService.updateProfile nhận FormData)
            const updatedProfile =
                await profileService.updateProfile(submitData);

            // Cập nhật lại UI sau khi save thành công
            profile.User.fullname = formData.fullname || "";
            profile.bio = formData.bio || "";
            profile.location = formData.location || "";

            if (formData.gender)
                profile.gender = formData.gender as "MALE" | "FEMALE" | "OTHER";
            if (formData.dob) profile.dob = formData.dob;

            updateUser({
                avatar:
                    updatedProfile?.User?.avatar ||
                    avatarPreview ||
                    $user?.avatar,
            });
            // Nếu BE trả về link ảnh mới thì update, không thì dùng tạm ảnh preview
            if (avatarPreview)
                profile.User.avatar =
                    updatedProfile?.User?.avatar || avatarPreview;
            if (coverPreview)
                profile.cover = updatedProfile?.cover || coverPreview;

            isEditModalOpen = false;
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            loading = false;
        }
    }

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

    async function handleLogout() {
        try {
            loading = true;
            await authService.logout();

            window.location.href = "/login";
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        } finally {
            loading = false;
            isLogoutModalOpen = false;
        }
    }
</script>

{#if profile}
    <div class="profile-layout">
        <div class="main-content">
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
                                {getInitial(
                                    profile.User.fullname ||
                                        profile.User.username,
                                )}
                            </div>
                        {/if}
                    </div>
                </div>

                <div class="profile-header-info">
                    <div class="name-box">
                        <div class="flex-row">
                            <h1>
                                {profile.User.fullname || profile.User.username}
                            </h1>
                            {#if profile.User.role === "ADMIN"}
                                <Badge color="danger" size="sm">STAFF</Badge>
                            {/if}
                        </div>
                        <span class="username">@{profile.User.username}</span>
                    </div>

                    <div class="actions" style="gap: 8px; display: flex;">
                        <Button
                            variant="primary"
                            onclick={() => (isEditModalOpen = true)}
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
                            >
                                <path
                                    d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                                />
                            </svg>
                            Edit Profile
                        </Button>
                        <Button
                            variant="danger"
                            style="background-color: #ef4444; color: white; border: none;"
                            onclick={() => (isLogoutModalOpen = true)}
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
                            >
                                <path
                                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                ></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </Button>
                    </div>
                </div>

                <div class="bio-container">
                    <p class="bio-text">{profile.bio || "No bio yet."}</p>
                    <div class="meta-info">
                        {#if profile.location}
                            <span class="meta-item">📍 {profile.location}</span>
                        {/if}
                        {#if profile.gender}
                            <span class="meta-item"
                                >👤 {formatGender(profile.gender)}</span
                            >
                        {/if}
                        {#if profile.dob}
                            <span class="meta-item"
                                >🎂 {new Date(
                                    profile.dob,
                                ).toLocaleDateString()}</span
                            >
                        {/if}
                        <span class="meta-item">
                            📅 Joined {new Date(
                                profile.User.created_at,
                            ).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </Card>

            <div class="section-title">
                <h3>POSTS</h3>
                <Badge color="info" size="sm">{profile.postCount}</Badge>
            </div>

            <div class="posts-grid">
                {#each posts as post}
                    <Card variant="default" hover={true} padding="16px">
                        <div class="post-card-content">
                            <h4>{post.title}</h4>
                            <div class="post-footer">
                                <span class="post-date">
                                    {new Date(
                                        post.created_at,
                                    ).toLocaleDateString()}
                                </span>
                                <div class="post-stats">
                                    <span>💬 {post.commentCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                {:else}
                    <div class="empty-state">No posts yet.</div>
                {/each}
            </div>
        </div>

        <aside class="sidebar">
            <Card variant="elevated" padding="20px">
                <h3 class="sidebar-title">Statistics</h3>
                <div class="stats-list">
                    <div class="stat-item">
                        <span class="label">Followers</span>
                        <span class="value">{profile.followerCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Following</span>
                        <span class="value">{profile.followingCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Total Points</span>
                        <span class="value">1,240</span>
                    </div>
                </div>
            </Card>

            <Card variant="default" padding="20px" hover={false}>
                <h3 class="sidebar-title">Recent Contests</h3>
                <div class="contest-mini">
                    <div class="contest-icon">🏆</div>
                    <div class="contest-info">
                        <p class="c-name">Windflow Pro #2</p>
                        <p class="c-rank">Ranked #12</p>
                    </div>
                </div>
            </Card>
        </aside>
    </div>

    <Modal bind:open={isEditModalOpen} title="Edit Profile" maxWidth="600px">
        <div class="edit-media-section">
            <div class="edit-cover-wrapper">
                <div
                    class="cover-bg"
                    style="background-image: url({coverPreview ||
                        profile?.cover ||
                        'https://i.pinimg.com/originals/a0/0a/73/a00a73646536551b9e6ec567f52f3607.jpg'})"
                ></div>
                <div class="overlay">
                    <label class="camera-btn" for="cover-upload">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                            ></path><circle cx="12" cy="13" r="4"></circle></svg
                        >
                    </label>
                    <input
                        type="file"
                        id="cover-upload"
                        accept="image/*"
                        class="hidden-input"
                        onchange={(e) => handleImageChange(e, "cover")}
                    />
                </div>
            </div>

            <div class="edit-avatar-wrapper">
                {#if avatarPreview || profile?.User?.avatar}
                    <img
                        src={avatarPreview || profile?.User?.avatar}
                        alt="avatar preview"
                        class="profile-avatar edit-avatar"
                    />
                {:else}
                    <div class="default-avatar edit-avatar">
                        {getInitial(
                            formData.fullname || profile?.User?.username,
                        )}
                    </div>
                {/if}
                <div class="overlay avatar-overlay">
                    <label class="camera-btn" for="avatar-upload">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                            ></path><circle cx="12" cy="13" r="4"></circle></svg
                        >
                    </label>
                    <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        class="hidden-input"
                        onchange={(e) => handleImageChange(e, "avatar")}
                    />
                </div>
            </div>
        </div>

        <div class="input-row">
            <Input
                label="Full Name"
                bind:value={formData.fullname}
                placeholder="Your display name"
            />

            <div style="margin-top: 0;">
                <Select
                    label="Gender"
                    bind:value={formData.gender}
                    options={[
                        { label: "Prefer not to say", value: "" },
                        { label: "Male", value: "MALE" },
                        { label: "Female", value: "FEMALE" },
                        { label: "Other", value: "OTHER" },
                    ]}
                />
            </div>
        </div>

        <div class="input-row">
            <Input
                label="Location"
                bind:value={formData.location}
                placeholder="Vietnam, Earth..."
            />

            <div class="input-group" style="margin-top: 0;">
                <label class="label" for="dob">Date of Birth</label>
                <input
                    type="date"
                    class="custom-input"
                    bind:value={formData.dob}
                />
            </div>
        </div>

        <div class="input-group">
            <label class="label" for="bio">Bio</label>
            <textarea
                class="custom-input custom-textarea"
                bind:value={formData.bio}
                rows="2"
                placeholder="Tell us about yourself..."
            ></textarea>
        </div>

        {#snippet footer()}
            <Button
                variant="primary"
                onclick={handleSave}
                disabled={loading}
                style="width: 100%;"
            >
                {loading ? "SAVING..." : "SAVE CHANGES"}
            </Button>
        {/snippet}
    </Modal>
    <Modal
        bind:open={isLogoutModalOpen}
        title="Confirm Logout"
        maxWidth="400px"
    >
        <div style="padding: 10px 0; color: #d1d5db; font-size: 15px;">
            Are you sure you want to log out of this account?
        </div>

        {#snippet footer()}
            <div
                style="display: flex; gap: 12px; width: 100%; justify-content: flex-end;"
            >
                <Button
                    variant="secondary"
                    onclick={() => (isLogoutModalOpen = false)}
                    disabled={loading}
                >
                    CANCEL
                </Button>

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
        margin: 0px auto;
        padding: 0 20px;
    }
    .sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .cover-wrapper {
        position: relative;
        height: 180px;
        border-radius: 18px 18px 0 0;
        overflow: visible;
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
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.2);
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
    }
    .stat-item .label {
        font-size: 13px;
        color: #a1a1aa;
    }
    .stat-item .value {
        font-weight: 700;
        color: #6366f1;
    }
    .contest-mini {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .contest-icon {
        font-size: 24px;
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
    .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 32px 0 16px;
    }
    .section-title h3 {
        font-size: 14px;
        letter-spacing: 1px;
    }
    .posts-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .post-card-content h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #fff;
    }
    .post-footer {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #6b7280;
    }
    .empty-state {
        color: #6b7280;
        font-size: 14px;
        padding: 20px 0;
        text-align: center;
        background: #14161c;
        border-radius: 12px;
        border: 1px dashed #2a2e36;
    }

    /* Form Styles (Bổ sung class custom-input cho select và date) */
    .input-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 16px;
        align-items: end;
    }
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 16px;
    }
    .label {
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 500;
    }

    /* Gộp style dùng chung cho input, select, textarea để đồng bộ màu nền, viền */
    .custom-input {
        background: #14161c;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        padding: 12px 14px;
        color: #e5e7eb;
        font-size: 14px;
        width: 100%;
        outline: none;
        font-family: inherit;
        transition: 0.2s ease;
        box-sizing: border-box; /* Fix lỗi tràn layout */
    }
    .custom-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }
    /* Fix icon lịch cho dark theme */
    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        opacity: 0.6;
        cursor: pointer;
    }
    .custom-textarea {
        resize: vertical;
    }

    .flex-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .edit-media-section {
        position: relative;
        margin-bottom: 50px;
    }

    .edit-avatar-wrapper {
        position: absolute;
        bottom: 0;
        left: 20px;
        transform: translateY(50%);
        width: 80px;
        height: 80px;
        border: 4px solid #1c1f26; /* Màu viền tệp với màu nền modal của bạn */
        border-radius: 50%;
        z-index: 10;
        background: #1c1f26;
        box-sizing: border-box; /* Giữ viền không làm phình kích thước */
    }
    .edit-cover-wrapper {
        position: relative;
        height: 140px; /* Thêm chiều cao cụ thể để ảnh bìa hiển thị */
        border-radius: 12px 12px 0 0; /* Bo góc ăn khớp với form */
        overflow: hidden; /* Tránh ảnh nền tràn ra ngoài */
    }

    .edit-cover-wrapper .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .edit-cover-wrapper:hover .overlay {
        opacity: 1;
    }
    .edit-avatar {
        width: 100%; /* Cho chiếm trọn container cha */
        height: 100%;
        border-radius: 50%;
        object-fit: cover; /* Cực kỳ quan trọng: Giúp ảnh không bị méo khi tỷ lệ không chuẩn */
    }
    .avatar-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .edit-avatar-wrapper:hover .avatar-overlay {
        opacity: 1;
    }
    .camera-btn {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(4px);
        border-radius: 50%;
        padding: 8px;
        color: white;
        cursor: pointer;
        display: flex;
        transition: 0.2s;
    }
    .camera-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    .hidden-input {
        display: none;
    }

    @media (max-width: 850px) {
        .profile-layout {
            grid-template-columns: 1fr;
        }
        .sidebar {
            order: -1;
        }
        .input-row {
            grid-template-columns: 1fr;
        }
    }
</style>
