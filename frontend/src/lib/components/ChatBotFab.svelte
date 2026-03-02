<script lang="ts">
    import Icon from "$lib/components/ui/Icon.svelte";
    import { page } from "$app/state"; // Lấy thông tin URL hiện tại

    // Điền các đường dẫn bạn MUỐN ẨN con bot vào đây
    const hiddenRoutes = ["/login", "/register", "/admin", "/forgot-password"];

    // Kiểm tra xem URL hiện tại có khớp với danh sách ẩn không
    // Dùng startsWith để ẩn luôn cả các route con (vd: /admin/users)
    let isHidden = $derived(
        hiddenRoutes.some((route) => page.url.pathname.startsWith(route)),
    );
</script>

{#if !isHidden}
    <button class="chat-fab" title="Chat with AI Assistant">
        <Icon name="bot" size={28} />
        <span class="online-indicator"></span>
    </button>
{/if}

<style>
    .chat-fab {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        border: none;
        color: white;
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100; /* Có thể tăng lên 999 nếu sợ bị đè */
        transition: transform 0.2s;
    }
    .chat-fab:hover {
        transform: scale(1.05);
    }
    .online-indicator {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 14px;
        height: 14px;
        background: #10b981;
        border: 3px solid #14161c; /* Chỉnh màu viền trùng với màu nền app của bạn */
        border-radius: 50%;
    }
</style>
