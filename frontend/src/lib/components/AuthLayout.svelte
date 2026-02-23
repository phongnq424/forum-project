<script lang="ts">
    import type { Snippet } from "svelte";

    // Props cho Svelte 5: title để đổi chữ "Welcome back", "Register",...
    let { children, title = "Welcome" }: { children: Snippet; title?: string } =
        $props();
</script>

<div class="page-container">
    <div class="main-card">
        <div class="card-left">
            <img src="/coding.png" alt="Auth background" />
        </div>

        <div class="card-right">
            <div class="form-container">
                <h2>{title}</h2>

                {@render children?.()}
            </div>
        </div>
    </div>
</div>

<style>
    /* Bê toàn bộ CSS Layout vào đây */
    .page-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 180px); /* Đã chỉnh lại cự ly cho ông */
        background-color: #0f1115;
        padding: 20px;
    }

    .main-card {
        display: flex;
        width: 100%;
        max-width: 1000px;
        min-height: 600px;
        height: auto;

        background: #1b1e25;
        border-radius: 32px;
        border: 1px solid #2a2f3a;
        overflow: hidden;
        box-shadow: 0 0 100px -30px rgba(99, 102, 241, 0.7);
        align-items: stretch;
    }

    .card-left {
        flex: 1.2;
        position: relative;
        overflow: hidden;
        background-color: #ffffff;
    }

    .card-left img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.75;
        filter: contrast(1.1) brightness(1.1);
    }

    .card-right {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 48px;
        background: #1b1e25;
    }

    .form-container {
        width: 100%;
        max-width: 360px;
    }

    h2 {
        text-align: center;
        margin-bottom: 32px;
        font-size: 28px;
        font-weight: 700;
        color: #fff;
    }

    @media (max-width: 768px) {
        .page-container {
            padding: 10px;
        }

        .main-card {
            flex-direction: column;
            min-height: unset;
            height: auto;
            max-width: 520px;
            border-radius: 24px;
        }

        .card-left {
            display: none;
        }

        .card-right {
            padding: 40px 24px;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 24px;
        }
    }
</style>
