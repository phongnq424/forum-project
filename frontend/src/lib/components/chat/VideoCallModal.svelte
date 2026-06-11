<script lang="ts">
    import { callSession } from "$lib/services/call-session.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import { authState } from "$lib/states/auth.svelte";

    let localVideo = $state<HTMLVideoElement | null>(null);
    let remoteVideo = $state<HTMLVideoElement | null>(null);
    let hasLocalVideo = $derived(
        !!callSession.localStream &&
            callSession.localStream.getVideoTracks().length > 0,
    );

    let hasRemoteVideo = $derived(
        !!callSession.remoteStream &&
            callSession.remoteStream.getVideoTracks().length > 0,
    );

    let hasRemoteAudio = $derived(
        !!callSession.remoteStream &&
            callSession.remoteStream.getAudioTracks().length > 0,
    );

    let peerName = $derived(
        callSession.currentCall?.caller?.fullname ||
            callSession.currentCall?.caller?.username ||
            callSession.currentCall?.receiver?.fullname ||
            callSession.currentCall?.receiver?.username ||
            callSession.activeConversation?.name ||
            "User",
    );

    let peerAvatar = $derived(
        callSession.activeConversation?.avatar ||
            callSession.currentCall?.caller?.avatar ||
            callSession.currentCall?.receiver?.avatar ||
            null,
    );

    let visible = $derived(callSession.status !== "idle");

    let title = $derived.by(() => {
        if (callSession.status === "setup")
            return "Choose camera and microphone";
        if (callSession.status === "incoming") return "Incoming video call";
        if (callSession.status === "outgoing") return "Calling...";
        if (callSession.status === "connecting") return "Connecting...";
        if (callSession.status === "ongoing") return "Video call";
        if (callSession.status === "ended") return "Call ended";
        if (callSession.status === "error") return "Call error";
        return "";
    });

    $effect(() => {
        if (localVideo && callSession.localStream) {
            localVideo.srcObject = callSession.localStream;
        }
    });

    $effect(() => {
        if (remoteVideo && callSession.remoteStream) {
            remoteVideo.srcObject = callSession.remoteStream;
        }
    });
</script>

{#if visible}
    <div class="call-overlay">
        <section class="call-modal">
            <div class="call-topbar">
                <div class="peer-info">
                    <Avatar
                        name={peerName}
                        src={peerAvatar ?? undefined}
                        size="sm"
                    />

                    <div>
                        <strong>{peerName}</strong>
                        <span>{title}</span>
                    </div>
                </div>

                {#if callSession.status !== "incoming"}
                    <button
                        type="button"
                        class="icon-button"
                        onclick={() => callSession.endCurrentCall()}
                        aria-label="Close call"
                    >
                        <Icon name="x" size={18} />
                    </button>
                {/if}
            </div>

            <div class="video-stage">
                {#if hasRemoteVideo}
                    <video
                        bind:this={remoteVideo}
                        class="remote-video"
                        autoplay
                        playsinline
                    ></video>
                {:else}
                    <div class="waiting-panel">
                        <Avatar
                            name={peerName}
                            src={peerAvatar ?? undefined}
                            size="lg"
                        />
                        {#if callSession.status === "setup"}
                            <p>Choose how you want to start this call</p>
                        {:else if callSession.status === "incoming"}
                            <p>Choose how you want to answer this call</p>
                        {:else if hasRemoteAudio}
                            <p>Connected with microphonse only</p>
                        {:else}
                            <p>{title}</p>
                        {/if}
                    </div>
                {/if}

                {#if hasLocalVideo}
                    <video
                        bind:this={localVideo}
                        class="local-video"
                        autoplay
                        playsinline
                        muted
                    ></video>
                {/if}
            </div>

            {#if callSession.error}
                <div class="call-error">
                    {callSession.error}
                </div>
            {/if}

            <div class="call-actions">
                {#if callSession.status === "setup"}
                    <Button
                        variant="primary"
                        onclick={() =>
                            callSession.confirmOutgoingCall("CAMERA_MIC")}
                    >
                        <Icon name="video" size={18} />
                        Camera + Mic
                    </Button>

                    <Button
                        variant="secondary"
                        onclick={() =>
                            callSession.confirmOutgoingCall("MIC_ONLY")}
                    >
                        <Icon name="mic" size={18} />
                        Mic only
                    </Button>

                    <Button
                        variant="secondary"
                        onclick={() =>
                            callSession.confirmOutgoingCall("CAMERA_ONLY")}
                    >
                        <Icon name="camera" size={18} />
                        Camera only
                    </Button>

                    <Button
                        variant="danger"
                        onclick={() => callSession.endCurrentCall()}
                    >
                        Cancel
                    </Button>
                {:else if callSession.status === "incoming"}
                    <Button
                        variant="primary"
                        onclick={() =>
                            callSession.answerIncomingCall("CAMERA_MIC")}
                    >
                        <Icon name="video" size={18} />
                        Camera + Mic
                    </Button>

                    <Button
                        variant="secondary"
                        onclick={() =>
                            callSession.answerIncomingCall("MIC_ONLY")}
                    >
                        <Icon name="mic" size={18} />
                        Mic only
                    </Button>

                    <Button
                        variant="secondary"
                        onclick={() =>
                            callSession.answerIncomingCall("CAMERA_ONLY")}
                    >
                        <Icon name="camera" size={18} />
                        Camera only
                    </Button>

                    <Button
                        variant="danger"
                        onclick={() => callSession.rejectIncomingCall()}
                    >
                        <Icon name="phone-off" size={18} />
                        Decline
                    </Button>
                {:else if callSession.status === "outgoing"}
                    <Button
                        variant="danger"
                        onclick={() => callSession.cancelOutgoingCall()}
                    >
                        <Icon name="phone-off" size={18} />
                        Cancel
                    </Button>
                {:else}
                    <button
                        type="button"
                        class:disabled={!callSession.isMicEnabled}
                        class="round-action"
                        onclick={() => callSession.toggleMic()}
                        aria-label="Toggle microphone"
                    >
                        <Icon
                            name={callSession.isMicEnabled ? "mic" : "mic-off"}
                            size={20}
                        />
                    </button>

                    <button
                        type="button"
                        class:disabled={!callSession.isCameraEnabled}
                        class="round-action"
                        onclick={() => callSession.toggleCamera()}
                        aria-label="Toggle camera"
                    >
                        <Icon
                            name={callSession.isCameraEnabled
                                ? "video"
                                : "video-off"}
                            size={20}
                        />
                    </button>

                    <button
                        type="button"
                        class="round-action danger"
                        onclick={() => callSession.endCurrentCall()}
                        aria-label="End call"
                    >
                        <Icon name="phone-off" size={20} />
                    </button>
                {/if}
            </div>
        </section>
    </div>
{/if}

<style>
    .call-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(0, 0, 0, 0.68);
        backdrop-filter: blur(12px);
    }

    .call-modal {
        width: min(960px, 100%);
        height: min(680px, 92vh);
        display: flex;
        flex-direction: column;
        background: #10131a;
        border: 1px solid #252a33;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
    }

    .call-topbar {
        height: 68px;
        padding: 0 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #171a21;
        border-bottom: 1px solid #252a33;
        color: #f3f4f6;
    }

    .peer-info {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
    }

    .peer-info strong {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #f3f4f6;
    }

    .peer-info span {
        display: block;
        margin-top: 2px;
        font-size: 12px;
        color: #8b949e;
    }

    .icon-button {
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        background: #20242d;
        color: #d1d5db;
        cursor: pointer;
    }

    .icon-button:hover {
        background: #252a33;
    }

    .video-stage {
        position: relative;
        flex: 1;
        min-height: 0;
        background: #05070b;
        overflow: hidden;
    }

    .remote-video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        background: #05070b;
    }

    .local-video {
        position: absolute;
        right: 18px;
        bottom: 18px;
        width: 220px;
        height: 132px;
        object-fit: cover;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: #16191f;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    }

    .waiting-panel {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 14px;
        align-items: center;
        justify-content: center;
        color: #d1d5db;
    }

    .waiting-panel p {
        margin: 0;
        color: #8b949e;
        font-size: 14px;
    }

    .call-error {
        padding: 10px 18px;
        background: rgba(239, 68, 68, 0.1);
        border-top: 1px solid rgba(239, 68, 68, 0.18);
        color: #fca5a5;
        font-size: 13px;
    }

    .call-actions {
        min-height: 78px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        background: #171a21;
        border-top: 1px solid #252a33;
    }

    .round-action {
        width: 48px;
        height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #2a2e36;
        border-radius: 999px;
        background: #20242d;
        color: #f3f4f6;
        cursor: pointer;
        transition:
            background-color 0.16s ease,
            transform 0.16s ease;
    }

    .round-action:hover {
        transform: translateY(-1px);
        background: #252a33;
    }

    .round-action.disabled {
        background: #2a2e36;
        color: #8b949e;
    }

    .round-action.danger {
        border-color: rgba(239, 68, 68, 0.45);
        background: #ef4444;
        color: white;
    }

    @media (max-width: 720px) {
        .call-overlay {
            padding: 0;
        }

        .call-modal {
            width: 100%;
            height: 100%;
            border-radius: 0;
        }

        .local-video {
            width: 128px;
            height: 172px;
            right: 12px;
            bottom: 90px;
        }
    }
</style>
