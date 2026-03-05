<script lang="ts">
    import Modal from "$lib/components/ui/Modal.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import DatePicker from "$lib/components/ui/DatePicker.svelte";
    import { profileService } from "$lib/services/profile.service";
    import { authState } from "$lib/states/auth.svelte";
    import type { Profile } from "$lib/types/profile.type";
    import Icon from "$lib/components/ui/Icon.svelte";

    let {
        open = $bindable(),
        profile,
        onUpdated,
    } = $props<{
        open: boolean;
        profile: Profile;
        onUpdated: (updatedProfile: any) => void;
    }>();

    let loading = $state(false);
    let avatarFile = $state<File | null>(null);
    let coverFile = $state<File | null>(null);
    let avatarPreview = $state<string | null>(null);
    let coverPreview = $state<string | null>(null);

    let formData = $state({
        fullname: profile.User.fullname || "",
        bio: profile.bio || "",
        location: profile.location || "",
        gender: profile.gender || "",
        dob: profile.dob
            ? new Date(profile.dob).toISOString().split("T")[0]
            : "",
    });

    function getInitial(name?: string) {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
    }

    function handleImageChange(event: Event, type: "avatar" | "cover") {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

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
        loading = true;
        try {
            const submitData = new FormData();
            submitData.append("fullname", formData.fullname);
            submitData.append("bio", formData.bio);
            submitData.append("location", formData.location);
            submitData.append("gender", formData.gender);
            submitData.append("dob", formData.dob);

            if (avatarFile) submitData.append("avatar", avatarFile);
            if (coverFile) submitData.append("cover", coverFile);

            const updated = await profileService.updateProfile(submitData);

            // Cập nhật store với tất cả thông tin user (avatar, fullname, v.v)
            authState.updateUser({
                avatar:
                    updated?.User?.avatar ||
                    avatarPreview ||
                    profile.User.avatar,
            });

            onUpdated({
                ...formData,
                avatar: updated?.User?.avatar || avatarPreview,
                cover: updated?.cover || coverPreview,
            });
            open = false;
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            loading = false;
        }
    }
</script>

<Modal bind:open title="Edit Profile" maxWidth="600px">
    <div class="edit-media-section">
        <div class="edit-cover-wrapper">
            <div
                class="cover-bg"
                style="background-image: url({coverPreview ||
                    profile.cover ||
                    'https://i.pinimg.com/originals/a0/0a/73/a00a73646536551b9e6ec567f52f3607.jpg'})"
            ></div>
            <div class="overlay">
                <label class="camera-btn" for="cover-upload">
                    <Icon name="camera" size={20} />
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
            {#if avatarPreview || profile.User.avatar}
                <img
                    src={avatarPreview || profile.User.avatar}
                    alt="avatar"
                    class="profile-avatar edit-avatar"
                />
            {:else}
                <div class="default-avatar edit-avatar">
                    {getInitial(formData.fullname || profile.User.username)}
                </div>
            {/if}
            <div class="overlay avatar-overlay">
                <label class="camera-btn" for="avatar-upload">
                    <Icon name="camera" size={20} />
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

    <div class="input-row">
        <Input
            label="Location"
            bind:value={formData.location}
            placeholder="Vietnam, Earth..."
        />
        <DatePicker label="Date of Birth" bind:value={formData.dob} />
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

<style>
    /* Paste toàn bộ CSS phần Form và Modal từ code gốc của ông vào đây */
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
    .custom-input {
        background: #14161c;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        padding: 12px 14px;
        color: #e5e7eb;
        width: 100%;
        box-sizing: border-box;
        font-family: inherit;
    }
    .edit-media-section {
        position: relative;
        margin-bottom: 50px;
    }
    .edit-cover-wrapper {
        position: relative;
        height: 140px;
        border-radius: 12px 12px 0 0;
        overflow: hidden;
    }
    .edit-avatar-wrapper {
        position: absolute;
        bottom: 0;
        left: 20px;
        transform: translateY(50%);
        width: 80px;
        height: 80px;
        border: 4px solid #1c1f26;
        border-radius: 50%;
        z-index: 10;
        overflow: hidden;
    }
    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .edit-cover-wrapper:hover .overlay,
    .edit-avatar-wrapper:hover .overlay {
        opacity: 1;
    }
    .camera-btn {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        padding: 8px;
        color: white;
        cursor: pointer;
        display: flex;
    }
    .hidden-input {
        display: none;
    }
    .profile-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }
    .cover-bg {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
    }
</style>
