import { browser } from "$app/environment";
import { socketService } from "$lib/services/socket.svelte";
import { callService } from "$lib/services/call.service";
import { authState } from "$lib/states/auth.svelte";
import type { ChatConversation } from "$lib/types/chat.type";
import type { CallApiItem, CallType } from "$lib/types/call.type";

type CallUiStatus =
    | "idle"
    | "setup"
    | "incoming"
    | "outgoing"
    | "connecting"
    | "ongoing"
    | "ended"
    | "error";

export type LocalMediaMode = "CAMERA_MIC" | "MIC_ONLY" | "CAMERA_ONLY";

type SignalPayload = {
    callId: string;
    conversationId?: string;
    fromUserId?: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
};

const ICE_SERVERS: RTCIceServer[] = [
    {
        urls: "stun:stun.l.google.com:19302",
    },
];

function getCallFromPayload(payload: any): CallApiItem | null {
    return payload?.call || payload || null;
}

class CallSession {
    status = $state<CallUiStatus>("idle");
    currentCall = $state<CallApiItem | null>(null);
    activeConversation = $state<ChatConversation | null>(null);
    pendingOutgoingConversation = $state<ChatConversation | null>(null);

    localStream = $state<MediaStream | null>(null);
    remoteStream = $state<MediaStream | null>(null);

    isIncoming = $state(false);
    isMicEnabled = $state(true);
    isCameraEnabled = $state(true);
    localMediaMode = $state<LocalMediaMode | null>(null);
    error = $state("");

    private peerConnection: RTCPeerConnection | null = null;
    private pendingCandidates: RTCIceCandidateInit[] = [];
    private initialized = false;
    private unsubs: Array<() => void> = [];

    init() {
        if (!browser) return;
        if (this.initialized) return;

        this.initialized = true;

        this.unsubs = [
            socketService.on("call:incoming", (call: CallApiItem) => {
                this.handleIncomingCall(call);
            }),

            socketService.on("call:started", (call: CallApiItem) => {
                const normalizedCall = getCallFromPayload(call);
                if (!normalizedCall) return;

                if (this.currentCall?.id === normalizedCall.id) {
                    this.currentCall = normalizedCall;
                }
            }),

            socketService.on("call:answered", (call: CallApiItem) => {
                this.handleCallAnswered(call);
            }),

            socketService.on("call:accepted", (call: CallApiItem) => {
                this.handleCallAnswered(call);
            }),

            socketService.on("call:updated", (call: CallApiItem) => {
                const normalizedCall = getCallFromPayload(call);
                if (!normalizedCall) return;

                if (this.currentCall?.id === normalizedCall.id) {
                    this.currentCall = normalizedCall;
                }
            }),

            socketService.on("call:ended", (payload: any) => {
                this.handleCallFinished(payload);
            }),

            socketService.on("call:rejected", (payload: any) => {
                this.handleCallFinished(payload);
            }),

            socketService.on("call:canceled", (payload: any) => {
                this.handleCallFinished(payload);
            }),

            socketService.on("call:missed", (payload: any) => {
                this.handleCallFinished(payload);
            }),

            socketService.on("rtc:offer", (payload: SignalPayload) => {
                this.handleRtcOffer(payload);
            }),

            socketService.on("rtc:answer", (payload: SignalPayload) => {
                this.handleRtcAnswer(payload);
            }),

            socketService.on("rtc:ice-candidate", (payload: SignalPayload) => {
                this.handleRtcIceCandidate(payload);
            }),
        ];
    }

    dispose() {
        this.unsubs.forEach((unsub) => unsub?.());
        this.unsubs = [];
        this.initialized = false;
        this.cleanup();
    }

    private isCurrentCall(callId?: string) {
        return !!callId && this.currentCall?.id === callId;
    }

    private get isCaller() {
        return this.currentCall?.caller_id === authState.user?.id;
    }

    private getMediaConstraints(type: CallType, mode: LocalMediaMode): MediaStreamConstraints {
        const needsAudio = mode === "CAMERA_MIC" || mode === "MIC_ONLY";
        const needsVideo =
            type === "VIDEO" &&
            (mode === "CAMERA_MIC" || mode === "CAMERA_ONLY");

        if (!needsAudio && !needsVideo) {
            throw new Error("Please choose camera, microphone, or both.");
        }

        return {
            audio: needsAudio,
            video: needsVideo
                ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user",
                }
                : false,
        };
    }

    private getMediaErrorMessage(error: any, mode: LocalMediaMode) {
        const name = error?.name || "";
        const message = error?.message || "";

        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
            return "Camera or microphone permission was denied.";
        }

        if (name === "NotFoundError" || name === "DevicesNotFoundError") {
            return "No camera or microphone was found.";
        }

        if (
            name === "NotReadableError" ||
            message.includes("Could not start video source")
        ) {
            if (mode === "CAMERA_MIC" || mode === "CAMERA_ONLY") {
                return "Camera is busy or cannot be started. Try Mic only, or close other apps/tabs using the camera.";
            }

            return "Microphone is busy or cannot be started.";
        }

        if (name === "OverconstrainedError") {
            return "Your device does not support the requested media settings.";
        }

        if (name === "SecurityError") {
            return "Camera and microphone access requires localhost or HTTPS.";
        }

        return message || "Cannot access camera or microphone.";
    }

    private async prepareLocalStream(type: CallType, mode: LocalMediaMode) {
        if (this.localStream) return this.localStream;

        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                this.getMediaConstraints(type, mode),
            );

            this.localStream = stream;
            this.localMediaMode = mode;
            this.isMicEnabled = stream.getAudioTracks().length > 0;
            this.isCameraEnabled = stream.getVideoTracks().length > 0;

            return stream;
        } catch (error: any) {
            throw new Error(this.getMediaErrorMessage(error, mode));
        }
    }

    private createPeerConnection() {
        if (this.peerConnection) return this.peerConnection;

        const pc = new RTCPeerConnection({
            iceServers: ICE_SERVERS,
        });

        let remote = new MediaStream();

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                pc.addTrack(track, this.localStream as MediaStream);
            });
        }

        pc.ontrack = (event) => {
            const [stream] = event.streams;

            if (stream && stream.getTracks().length > 0) {
                this.remoteStream = stream;
                return;
            }

            if (event.track) {
                remote.addTrack(event.track);
                this.remoteStream = remote;
            }
        };

        pc.onicecandidate = (event) => {
            if (!event.candidate || !this.currentCall) return;

            socketService.emit("rtc:ice-candidate", {
                callId: this.currentCall.id,
                candidate: event.candidate.toJSON(),
            });
        };

        pc.onconnectionstatechange = () => {
            if (!this.peerConnection) return;

            const state = this.peerConnection.connectionState;

            if (state === "connected") {
                this.status = "ongoing";
            }

            if (state === "failed") {
                this.status = "error";
                this.error = "Connection failed.";
            }

            if (state === "disconnected") {
                this.error = "Connection lost.";
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (!this.peerConnection) return;

            const state = this.peerConnection.iceConnectionState;

            if (state === "connected" || state === "completed") {
                this.status = "ongoing";
            }

            if (state === "failed") {
                this.status = "error";
                this.error = "ICE connection failed.";
            }
        };

        this.peerConnection = pc;
        return pc;
    }

    private async flushPendingCandidates() {
        if (!this.peerConnection?.remoteDescription) return;

        const candidates = [...this.pendingCandidates];
        this.pendingCandidates = [];

        for (const candidate of candidates) {
            await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate),
            );
        }
    }

    private async createAndSendOffer() {
        if (!this.currentCall) return;

        const pc = this.createPeerConnection();

        const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: this.currentCall.type === "VIDEO",
        });

        await pc.setLocalDescription(offer);

        socketService.emit("rtc:offer", {
            callId: this.currentCall.id,
            offer,
        });

        this.status = "connecting";
    }

    private async handleRtcOffer(payload: SignalPayload) {
        try {
            if (!this.isCurrentCall(payload.callId)) return;
            if (!payload.offer) return;

            const pc = this.createPeerConnection();

            await pc.setRemoteDescription(
                new RTCSessionDescription(payload.offer),
            );

            await this.flushPendingCandidates();

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketService.emit("rtc:answer", {
                callId: payload.callId,
                answer,
            });

            this.status = "ongoing";
        } catch (error: any) {
            this.status = "error";
            this.error = error?.message || "Cannot handle call offer.";
        }
    }

    private async handleRtcAnswer(payload: SignalPayload) {
        try {
            if (!this.isCurrentCall(payload.callId)) return;
            if (!payload.answer) return;
            if (!this.peerConnection) return;

            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(payload.answer),
            );

            await this.flushPendingCandidates();

            this.status = "ongoing";
        } catch (error: any) {
            this.status = "error";
            this.error = error?.message || "Cannot handle call answer.";
        }
    }

    private async handleRtcIceCandidate(payload: SignalPayload) {
        try {
            if (!this.isCurrentCall(payload.callId)) return;
            if (!payload.candidate) return;

            if (!this.peerConnection?.remoteDescription) {
                this.pendingCandidates = [
                    ...this.pendingCandidates,
                    payload.candidate,
                ];
                return;
            }

            await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(payload.candidate),
            );
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }

    private handleIncomingCall(call: CallApiItem) {
        const currentUserId = authState.user?.id;

        if (!currentUserId) return;

        if (call.receiver_id !== currentUserId) {
            return;
        }

        if (this.currentCall?.id === call.id) {
            this.currentCall = call;
            this.isIncoming = true;
            this.status = "incoming";
            this.error = "";
            return;
        }

        if (
            this.status === "outgoing" ||
            this.status === "connecting" ||
            this.status === "ongoing"
        ) {
            return;
        }

        this.cleanupMediaOnly();

        this.currentCall = call;
        this.activeConversation = null;
        this.pendingOutgoingConversation = null;
        this.isIncoming = true;
        this.status = "incoming";
        this.error = "";
    }
    private async handleCallAnswered(call: CallApiItem) {
        const normalizedCall = getCallFromPayload(call);

        if (!normalizedCall) return;
        if (!this.isCurrentCall(normalizedCall.id)) return;

        this.currentCall = normalizedCall;

        if (this.isCaller) {
            await this.createAndSendOffer();
        } else {
            this.status = "connecting";
        }
    }

    private handleCallFinished(payload: any) {
        const call = getCallFromPayload(payload);

        if (!call) return;
        if (!this.isCurrentCall(call.id)) return;

        this.currentCall = call;
        this.status = "ended";

        window.setTimeout(() => {
            this.cleanup();
        }, 700);
    }

    openOutgoingVideoSetup(conversation: ChatConversation) {
        if (!browser) return;

        if (conversation.type !== "CHAT") {
            throw new Error("Video call is only available for 1-1 chat.");
        }

        if (conversation.id.startsWith("temp_")) {
            throw new Error("Cannot call before conversation is created.");
        }

        if (this.status !== "idle") {
            throw new Error("Another call is already active.");
        }

        this.error = "";
        this.status = "setup";
        this.isIncoming = false;
        this.activeConversation = conversation;
        this.pendingOutgoingConversation = conversation;
        this.currentCall = null;
    }

    async startOutgoingVideoCall(conversation: ChatConversation) {
        this.openOutgoingVideoSetup(conversation);
    }

    async confirmOutgoingCall(mode: LocalMediaMode) {
        if (!this.pendingOutgoingConversation) return;

        const conversation = this.pendingOutgoingConversation;

        try {
            this.error = "";
            this.isIncoming = false;
            this.activeConversation = conversation;

            if (!this.currentCall) {
                this.status = "outgoing";

                const call = await callService.startCall({
                    conversationId: conversation.id,
                    type: "VIDEO",
                });

                this.currentCall = call;
            }

            this.status = "outgoing";

            await this.prepareLocalStream("VIDEO", mode);
            this.createPeerConnection();
        } catch (error: any) {
            this.status = "setup";
            this.error = error?.message || "Cannot start video call.";
            this.cleanupMediaOnly();
        }
    }

    async answerIncomingCall(mode: LocalMediaMode) {
        if (!this.currentCall) return;

        const callId = this.currentCall.id;

        try {
            this.error = "";
            this.status = "connecting";

            await this.prepareLocalStream(this.currentCall.type, mode);
            this.createPeerConnection();

            const call = await callService.answerCall(callId);
            this.currentCall = call;
            this.isIncoming = false;
        } catch (error: any) {
            this.status = "incoming";
            this.error = error?.message || "Cannot answer call.";
            this.cleanupMediaOnly();
        }
    }

    async rejectIncomingCall() {
        if (!this.currentCall) return;

        try {
            await callService.rejectCall(this.currentCall.id);
        } finally {
            this.cleanup();
        }
    }

    async cancelOutgoingCall() {
        if (!this.currentCall) {
            this.cleanup();
            return;
        }

        try {
            await callService.cancelCall(this.currentCall.id);
        } finally {
            this.cleanup();
        }
    }

    async endCurrentCall() {
        if (this.status === "setup") {
            if (this.currentCall) {
                try {
                    await callService.cancelCall(this.currentCall.id);
                } finally {
                    this.cleanup();
                }

                return;
            }

            this.cleanup();
            return;
        }

        if (!this.currentCall) return;

        const call = this.currentCall;

        try {
            if (this.status === "incoming") {
                await callService.rejectCall(call.id);
                return;
            }

            if (this.status === "outgoing") {
                await callService.cancelCall(call.id);
                return;
            }

            if (this.status === "connecting" || this.status === "ongoing") {
                await callService.endCall(call.id);
                return;
            }

            await callService.endCall(call.id);
        } finally {
            this.cleanup();
        }
    }

    toggleMic() {
        if (!this.localStream) return;

        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length === 0) return;

        const next = !this.isMicEnabled;

        audioTracks.forEach((track) => {
            track.enabled = next;
        });

        this.isMicEnabled = next;
    }

    toggleCamera() {
        if (!this.localStream) return;

        const videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length === 0) return;

        const next = !this.isCameraEnabled;

        videoTracks.forEach((track) => {
            track.enabled = next;
        });

        this.isCameraEnabled = next;
    }

    private cleanupMediaOnly() {
        this.localStream?.getTracks().forEach((track) => track.stop());
        this.localStream = null;
        this.remoteStream = null;

        this.peerConnection?.close();
        this.peerConnection = null;
        this.pendingCandidates = [];
        this.localMediaMode = null;
        this.isMicEnabled = true;
        this.isCameraEnabled = true;
    }

    cleanup() {
        this.cleanupMediaOnly();

        this.status = "idle";
        this.currentCall = null;
        this.activeConversation = null;
        this.pendingOutgoingConversation = null;
        this.isIncoming = false;
        this.error = "";
    }
}

export const callSession = new CallSession();