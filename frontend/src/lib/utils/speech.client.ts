export function speakText(text: string, lang = "en-US") {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const cleanText = text
        .replace(/```[\s\S]*?```/g, "code block")
        .replace(/[#>*_`~\[\]()]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
}