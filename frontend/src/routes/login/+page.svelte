<script lang="ts">
    import AuthLayout from "$lib/components/AuthLayout.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import { authService } from "$lib/services/auth.service";
    import { goto } from "$app/navigation";

    // Dùng $state cho Svelte 5
    let username = $state("");
    let password = $state("");
    let showPassword = $state(false); // State để toggle hiện mật khẩu
    let rememberMe = $state(false); // State cho checkbox
    let loading = $state(false);
    let error = $state("");

    async function handleLogin(e: Event) {
        e.preventDefault();
        loading = true;
        error = "";

        try {
            // Nếu cần xử lý rememberMe, bạn có thể truyền thêm vào đây
            await authService.login({ username, password });
            goto("/");
        } catch (e: any) {
            error = e?.message || "Đăng nhập thất bại";
        } finally {
            loading = false;
        }
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }

    function loginGoogle() {
        window.location.href = "/auth/google";
    }

    // Giả sử bạn muốn giữ Github nhưng style giống nút Apple trong ảnh
    function loginGithub() {
        window.location.href = "/auth/github";
    }
</script>

<AuthLayout title="Welcome back">
    <form onsubmit={handleLogin}>
        <div class="input-group">
            <label for="email">Email</label>
            <Input
                id="email"
                placeholder="name@example.com"
                bind:value={username}
                required
            />
        </div>

        <div class="input-group">
            <label for="password">Password</label>
            <div class="password-wrapper">
                <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    bind:value={password}
                    required
                />
                <button
                    type="button"
                    class="eye-toggle-btn"
                    onclick={togglePasswordVisibility}
                    aria-label="Toggle password visibility"
                >
                    {#if showPassword}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M2.036 10.041a17.59 17.59 0 0 1 3.5-3.931m12 0a17.59 17.59 0 0 1 3.5 3.931M12 21c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 9.164A8.997 8.997 0 0 1 12 21Z"
                            /><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            /></svg
                        >
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                            /></svg
                        >
                    {/if}
                </button>
            </div>
        </div>

        <div class="options-row">
            <label class="remember-me">
                <input type="checkbox" bind:checked={rememberMe} />
                <span>Remember me</span>
            </label>
            <a href="/forgot-password" class="forgot-link">Forgot password?</a>
        </div>

        {#if error}
            <div class="error-box">{error}</div>
        {/if}

        <Button
            type="submit"
            disabled={loading}
            style="width:100%; margin-top: 20px;"
            variant="primary"
        >
            {loading ? "LOGGING IN..." : "LOGIN"}
        </Button>
    </form>

    <div class="divider">or</div>

    <div class="social-buttons">
        <button class="social-btn google" onclick={loginGoogle}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                ><path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                /><path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                /><path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                /><path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                /><path d="M1 1h22v22H1z" fill="none" /></svg
            >
            <span>Continue with Google</span>
        </button>

        <button class="social-btn github" onclick={loginGithub}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#fff"
                ><path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                /></svg
            >
            <span>Continue with GitHub</span>
        </button>
    </div>
    <p class="footer-text">
        Don't have an account? <a href="/register">Register</a>
    </p>
</AuthLayout>

<style>
    /* Nhóm input và label */
    .input-group {
        margin-bottom: 20px;
    }

    .input-group label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #a1a1aa; /* Màu xám nhạt cho label */
    }

    /* Wrapper để đặt icon con mắt đè lên input */
    .password-wrapper {
        position: relative;
    }

    .eye-toggle-btn {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #a1a1aa;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .eye-toggle-btn:hover {
        color: #fff;
    }

    .size-5 {
        width: 20px;
        height: 20px;
    }
    .footer-text {
        text-align: center;
        margin-top: 20px;
        color: #a1a1aa;
        font-size: 14px;
    }
    .footer-text a {
        color: #6366f1;
        text-decoration: none;
        font-weight: 600;
    }

    /* Hàng chứa Remember me và Forgot password */
    .options-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        font-size: 14px;
        color: #a1a1aa;
    }

    .remember-me {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    /* Tùy chỉnh checkbox cho hợp dark mode (cơ bản) */
    .remember-me input[type="checkbox"] {
        accent-color: #6366f1; /* Màu tím khi checked */
        cursor: pointer;
    }

    .forgot-link {
        color: #6366f1; /* Màu tím chủ đạo */
        text-decoration: none;
        font-weight: 600;
    }

    .forgot-link:hover {
        text-decoration: underline;
    }

    /* Divider "or" */
    .divider {
        text-align: center;
        margin: 24px 0;
        color: #52525b;
        font-size: 14px;
        position: relative;
    }

    /* Tạo đường kẻ ngang cho divider (tùy chọn) */
    .divider::before,
    .divider::after {
        content: "";
        position: absolute;
        top: 50%;
        width: 45%;
        height: 1px;
        background: #2a2f3a;
    }
    .divider::before {
        left: 0;
    }
    .divider::after {
        right: 0;
    }

    /* Các nút mạng xã hội */
    .social-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .social-btn {
        width: 100%;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid #2a2f3a;
        background: #22252e;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-weight: 500;
        font-size: 14px;
        font-family: inherit;
        transition: 0.2s ease;
    }

    .social-btn:hover {
        background: #2a2f3a;
        border-color: #3f4451;
    }

    .error-box {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        text-align: center;
        margin-bottom: 20px;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    @media (max-width: 480px) {
        .social-btn {
            padding: 14px; /* Nút to hơn tí cho dễ chạm (Touch target) */
            font-size: 15px;
        }

        .forgot-link,
        .remember-me {
            font-size: 13px; /* Chữ nhỏ lại để không bị nhảy hàng */
        }

        .divider::before,
        .divider::after {
            width: 40%;
        }
    }
</style>
