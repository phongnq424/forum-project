<script lang="ts">
    // 1. Định nghĩa Type rõ ràng để TS biết 'size' chỉ có 3 giá trị này
    type AvatarSize = "sm" | "md" | "lg";

    let {
        src,
        name,
        size = "md",
    } = $props<{
        src?: string;
        name?: string;
        size?: AvatarSize;
    }>();

    const initial = $derived(name ? name.charAt(0).toUpperCase() : "?");

    // 2. Dùng Record để định nghĩa sizeMap, chặn đứng lỗi "Element implicitly has any type"
    const sizeMap: Record<AvatarSize, string> = {
        sm: "32px",
        md: "45px",
        lg: "100px",
    };
</script>

<div
    class="avatar-container {size}"
    style="--avatar-size: {sizeMap[size as AvatarSize]}"
>
    {#if src}
        <img {src} alt={name} class="avatar-img" />
    {:else}
        <div class="default-avatar">
            {initial}
        </div>
    {/if}
</div>

<style>
    .avatar-container {
        width: var(--avatar-size);
        height: var(--avatar-size);
        flex-shrink: 0;
        display: inline-block; /* Đảm bảo không bị vỡ layout */
    }

    .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        object-fit: cover;
        display: block;
    }

    .default-avatar {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: white;
        /* Font size tự nhảy theo size của container */
        font-size: calc(var(--avatar-size) / 2.2);
    }

    /* Bo góc riêng cho size lớn (lg) theo ý ông */
    .lg,
    .lg .avatar-img,
    .lg .default-avatar {
        border-radius: 20px;
    }
</style>
