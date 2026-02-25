<script lang="ts">
    import AuthLayout from "$lib/components/AuthLayout.svelte";
    import Input from "$lib/components/Input.svelte";
    import Button from "$lib/components/Button.svelte";
    import { authService } from "$lib/services/auth.service";
    import { goto } from "$app/navigation";
    import OTPVerification from "$lib/components/OTPVerification.svelte";

    let username = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");

    let showPassword = $state(false);
    let showConfirmPassword = $state(false);

    let loading = $state(false);
    let error = $state("");
    let otpCode = $state("");
    let step = $state(1);

    async function handleStartRegistration(e: Event) {
        e.preventDefault();
        error = "";

        if (password !== confirmPassword) {
            error = "Passwords do not match";
            return;
        }

        loading = true;
        try {
            // BE của ông có hàm checkExistUser, gọi nó trước cho chắc
            await authService.checkExistUser({ email, username });

            // Nếu không trùng thì gửi mã
            await authService.sendOtp(email);
            step = 2; // Chuyển sang giao diện OTP
        } catch (e: any) {
            error = e?.message || "Something went wrong";
        } finally {
            loading = false;
        }
    }

    // BƯỚC 2: Xác thực OTP và Hoàn tất đăng ký
    async function handleVerifyAndRegister(e?: Event) {
        e?.preventDefault();
        if (otpCode.length < 6) {
            error = "Please enter full 6-digit code";
            return;
        }

        loading = true;
        error = "";
        try {
            await authService.verifyOtp(email, otpCode);

            await authService.register({ username, email, password });

            goto("/profile");
        } catch (e: any) {
            error = e?.message || "Verification or registration failed";
        } finally {
            loading = false;
        }
    }

    async function handleResendOtp() {
        error = "";
        try {
            await authService.resendOtp(email);
        } catch (e: any) {
            error = e?.message || "Could not resend code";
        }
    }
</script>

<AuthLayout title={step === 1 ? "Create your account" : "Verify your email"}>
    {#if step === 1}
        <form onsubmit={handleStartRegistration}>
            <div class="input-group">
                <label for="username">Username</label>
                <Input
                    id="username"
                    placeholder="yourusername"
                    bind:value={username}
                    required
                />
            </div>

            <div class="input-group">
                <label for="email">Email</label>
                <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    bind:value={email}
                    required
                />
            </div>

            <div class="input-group">
                <label for="password">Password</label>
                <div class="password-wrapper">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        bind:value={password}
                        required
                    />
                    <button
                        type="button"
                        class="eye-toggle-btn"
                        onclick={() => (showPassword = !showPassword)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d={showPassword
                                    ? "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                    : "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"}
                            />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="input-group">
                <label for="confirm">Confirm Password</label>
                <div class="password-wrapper">
                    <Input
                        id="confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        bind:value={confirmPassword}
                        required
                    />
                    <button
                        type="button"
                        class="eye-toggle-btn"
                        onclick={() =>
                            (showConfirmPassword = !showConfirmPassword)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d={showPassword
                                    ? "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                    : "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"}
                            />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {#if error}
                <div class="error-box">{error}</div>
            {/if}

            <Button
                type="submit"
                disabled={loading}
                style="width:100%; margin-top: 10px;"
                variant="primary"
            >
                {loading ? "SENDING CODE..." : "REGISTER"}
            </Button>
        </form>

        <div class="divider">or</div>
        <div class="social-buttons">
            <button
                class="social-btn"
                onclick={() => (window.location.href = "/auth/google")}
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    width="18"
                />
                <span>Continue with Google</span>
            </button>
            <button
                class="social-btn"
                onclick={() => (window.location.href = "/auth/github")}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    ><path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    /></svg
                >
                <span>Continue with GitHub</span>
            </button>
        </div>
        <p class="footer-text">
            Already have an account? <a href="/login">Login</a>
        </p>
    {:else}
        <OTPVerification
            {email}
            {loading}
            errorMessage={error}
            onVerify={(code: string) => {
                otpCode = code;
                handleVerifyAndRegister();
            }}
            onResend={handleResendOtp}
            onBack={() => (step = 1)}
        />
    {/if}
</AuthLayout>

<style>
    .input-group {
        margin-bottom: 20px;
    }

    .input-group label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #a1a1aa;
    }

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

    .divider {
        text-align: center;
        margin: 24px 0;
        color: #52525b;
        font-size: 14px;
        position: relative;
    }

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

    .social-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid #2a2f3a;
        background: #22252e;
        color: white;
        cursor: pointer;
        transition: 0.2s ease;
        font-weight: 500;
        font-family: inherit;
    }

    .social-btn:hover {
        background: #2a2f3a;
        border-color: #3f4451;
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
    @media (max-width: 480px) {
        .social-btn {
            padding: 14px; /* Nút to hơn tí cho dễ chạm (Touch target) */
            font-size: 15px;
        }

        .divider::before,
        .divider::after {
            width: 40%;
        }
    }
</style>
