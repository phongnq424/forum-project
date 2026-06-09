<script lang="ts">
    import { onDestroy } from "svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

    type SpeechRecognitionLike = {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        start: () => void;
        stop: () => void;
        onresult: ((event: SpeechRecognitionEventLike) => void) | null;
        onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
        onend: (() => void) | null;
    };

    type SpeechRecognitionEventLike = {
        results: {
            length: number;
            [index: number]: {
                [index: number]: {
                    transcript: string;
                };
            };
        };
    };

    type SpeechRecognitionErrorEventLike = {
        error: string;
    };

    let {
        disabled = false,
        lang = "en-US",
        onText,
        onError,
    } = $props<{
        disabled?: boolean;
        lang?: string;
        onText: (text: string) => void;
        onError?: (message: string) => void;
    }>();

    let isListening = $state(false);
    let recognition = $state<SpeechRecognitionLike | null>(null);

    function getRecognitionConstructor() {
        const win = window as unknown as {
            SpeechRecognition?: SpeechRecognitionConstructor;
            webkitSpeechRecognition?: SpeechRecognitionConstructor;
        };

        return win.SpeechRecognition || win.webkitSpeechRecognition || null;
    }

    function toggleListening() {
        if (disabled) return;
        if (typeof window === "undefined") return;

        if (recognition && isListening) {
            recognition.stop();
            isListening = false;
            return;
        }

        const Recognition = getRecognitionConstructor();

        if (!Recognition) {
            onError?.("Voice input is not supported in this browser.");
            return;
        }

        const instance = new Recognition();

        instance.lang = lang;
        instance.interimResults = false;
        instance.continuous = false;

        instance.onresult = function (event) {
            let transcript = "";

            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            const text = transcript.trim();

            if (text) {
                onText(text);
            }
        };

        instance.onerror = function (event) {
            isListening = false;
            onError?.(`Voice input failed: ${event.error}`);
        };

        instance.onend = function () {
            isListening = false;
        };

        recognition = instance;
        isListening = true;
        instance.start();
    }

    onDestroy(() => {
        if (recognition) {
            recognition.stop();
        }
    });
</script>

<button
    type="button"
    class="voice-button"
    class:listening={isListening}
    {disabled}
    onclick={toggleListening}
    aria-label={isListening ? "Stop voice input" : "Start voice input"}
    title={isListening ? "Listening..." : "Voice input"}
>
    <Icon name="mic" size={18} />
</button>

<style>
    .voice-button {
        width: 42px;
        min-width: 42px;
        border-radius: 12px;
        border: 1px solid #2a2e36;
        background: #20242d;
        color: #d1d5db;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
            background-color 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
    }

    .voice-button:hover:not(:disabled) {
        background: #252a33;
        border-color: #6366f1;
        color: #ffffff;
    }

    .voice-button.listening {
        background: rgba(239, 68, 68, 0.16);
        border-color: rgba(239, 68, 68, 0.45);
        color: #fca5a5;
        animation: pulseMic 1.1s infinite;
    }

    .voice-button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }

    @keyframes pulseMic {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.06);
        }

        100% {
            transform: scale(1);
        }
    }
</style>
