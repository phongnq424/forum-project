<script lang="ts">
    import OTPInput from "./OTPInput.svelte";
    import Button from "./Button.svelte";

    // Định nghĩa Interface rõ ràng cho Svelte 5 Props
    interface Props {
        email: string;
        loading?: boolean;
        errorMessage?: string;
        onVerify: (code: string) => void;
        onResend: () => void;
        onBack: () => void;
    }

    let {
        email = "",
        loading = false,
        errorMessage = "",
        onVerify,
        onResend,
        onBack,
    }: Props = $props();

    let otpValue = $state("");
    let countdown = $state(60);
    let canResend = $state(false);

    // Logic Countdown
    $effect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => countdown--, 1000);
            return () => clearInterval(timer);
        } else {
            canResend = true;
        }
    });

    function handleResend() {
        if (!canResend) return;
        canResend = false;
        countdown = 60;
        onResend();
    }
</script>

<div class="otp-container">
    <div class="header">
        <div class="icon-circle">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-8"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
            </svg>
        </div>
        <h2>Enter your code</h2>
        <p>
            We've sent a 6-digit code to <span class="email-highlight"
                >{email}</span
            >
        </p>
    </div>

    <div class="otp-content">
        <OTPInput length={6} bind:value={otpValue} />

        {#if errorMessage}
            <div class="error-badge">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="size-4"
                >
                    <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        clip-rule="evenodd"
                    />
                </svg>
                {errorMessage}
            </div>
        {/if}

        <Button
            onclick={() => onVerify(otpValue)}
            disabled={loading || otpValue.length < 6}
            style="width: 100%;"
            variant="primary"
        >
            {loading ? "VERIFYING..." : "VERIFY CODE"}
        </Button>

        <div class="otp-footer">
            <div class="resend-wrapper">
                {#if canResend}
                    <button
                        type="button"
                        class="resend-link"
                        onclick={handleResend}>Resend Code</button
                    >
                {:else}
                    <span class="timer-text">Resend in <b>{countdown}s</b></span
                    >
                {/if}
            </div>

            <button type="button" class="back-link" onclick={onBack}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="size-4"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                </svg>
                Change email address
            </button>
        </div>
    </div>
</div>

<style>
    .otp-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
        padding: 8px 0;
    }

    .header {
        text-align: center;
    }

    .icon-circle {
        width: 60px;
        height: 60px;
        background: rgba(99, 102, 241, 0.1);
        color: #818cf8;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
    }

    h2 {
        color: white;
        font-size: 22px;
        font-weight: 500;
        margin-bottom: 10px;
    }

    p {
        color: #a1a1aa;
        font-size: 14px;
    }

    .email-highlight {
        color: #e4e4e7;
        font-weight: 600;
    }

    .otp-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    /* Error Badge Xịn hơn */
    .error-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #ef4444;
        font-size: 13px;
        background: rgba(239, 68, 68, 0.1);
        padding: 10px;
        border-radius: 8px;
        border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .otp-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin-top: 8px;
    }

    .resend-link {
        background: none;
        border: none;
        color: #6366f1;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: color 0.2s;
    }

    .resend-link:hover {
        color: #818cf8;
    }

    .timer-text {
        color: #71717a;
        font-size: 14px;
    }

    /* Back link nhìn như một action item thực thụ */
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: #a1a1aa;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.2s;
        font-family: inherit;
    }

    .back-link:hover {
        color: #e4e4e7;
        background: rgba(255, 255, 255, 0.05);
    }

    .size-8 {
        width: 32px;
        height: 32px;
    }
    .size-4 {
        width: 16px;
        height: 16px;
    }
</style>
