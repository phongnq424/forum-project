<script lang="ts">
    import AuthLayout from "$lib/components/auth/AuthLayout.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import PasswordInput from "$lib/components/auth/PasswordInput.svelte";
    import ErrorMessage from "$lib/components/ui/ErrorMessage.svelte";
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

        <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            bind:value={password}
            required
        />

        <div class="options-row">
            <label class="remember-me">
                <input type="checkbox" bind:checked={rememberMe} />
                <span>Remember me</span>
            </label>
            <a href="/forgot-password" class="forgot-link">Forgot password?</a>
        </div>

        <ErrorMessage {error} />

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
