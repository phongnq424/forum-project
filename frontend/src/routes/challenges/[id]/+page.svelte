<script lang="ts">
    import { page } from "$app/state";
    import { untrack } from "svelte";
    import { onMount } from "svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Description from "$lib/components/challenge/ChallengeDetail/Description.svelte";
    import Header from "$lib/components/challenge/ChallengeDetail/Header.svelte";
    import Editor from "$lib/components/challenge/ChallengeDetail/Editor.svelte";
    import Sidebar from "$lib/components/challenge/ChallengeDetail/Sidebar.svelte";

    import { challengeService } from "$lib/services/challenge.service";
    import { languageService } from "$lib/services/language.service";
    import { submissionService } from "$lib/services/submission.service";
    import type {
        Challenge,
        ChallengeDifficulty,
    } from "$lib/types/challenge.type";

    const difficultyColor: Record<
        ChallengeDifficulty,
        "success" | "warning" | "danger"
    > = {
        EASY: "success",
        MEDIUM: "warning",
        HARD: "danger",
    };
    // --- State ---
    let challenge = $state<Challenge | null>(null);
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    let userCode = $state("");
    let languages = $state<{ value: string; label: string }[]>([]);
    let selectedLanguage = $state("");
    let isSubmitting = $state(false);
    let submissionResult = $state<{
        status: "success" | "error";
        message: string;
    } | null>(null);

    const challengeId = $derived(page.params.id);

    async function fetchChallengeDetail(id: string) {
        isLoading = true;
        error = null;
        try {
            const res = await challengeService.getById(id);
            challenge = res;
            userCode = "";
        } catch (err) {
            error = "Không thể tải nội dung thử thách.";
        } finally {
            isLoading = false;
        }
    }
    async function fetchLanguages() {
        try {
            const res = await languageService.listLanguages();
            console.log(res);
            languages = res.map((lang) => ({
                value: lang.id,
                label: lang.name,
            }));

            if (
                languages.length > 0 &&
                (!selectedLanguage || selectedLanguage === "Language")
            ) {
                selectedLanguage = languages[0].value;
            }
        } catch (err) {
            console.error("Lỗi fetch languages:", err);
        }
    }

    onMount(() => {
        fetchLanguages();
    });

    $effect(() => {
        const controller = new AbortController();
        const _id = challengeId;
        if (challengeId) {
            untrack(() => fetchChallengeDetail(challengeId));
        }
        return () => controller.abort();
    });

    async function handleSubmit() {
        if (!challenge || isSubmitting) return;

        isSubmitting = true;
        submissionResult = null;

        try {
            const payload = {
                challenge_id: challenge.id,
                language_id: selectedLanguage,
                code: userCode,
            };

            const res = await submissionService.submit(payload);
            submissionResult = {
                status: "success",
                message: "Submission sent! Judging...",
            };

            console.log("Submission id:", res.id);
            pollSubmission(res.id);
        } catch (err) {
            submissionResult = {
                status: "error",
                message: "Submit failed",
            };
        } finally {
            isSubmitting = false;
        }
    }

    async function pollSubmission(id: string) {
        let attempts = 0;
        const MAX_ATTEMPTS = 30; // 60s

        const interval = setInterval(async () => {
            attempts++;

            try {
                const sub = await submissionService.getSubmission(id);

                if (sub.status !== "PENDING" && sub.status !== "RUNNING") {
                    submissionResult = {
                        status: sub.status === "ACCEPTED" ? "success" : "error",
                        message: sub.status,
                    };

                    clearInterval(interval);
                    return;
                }

                if (attempts >= MAX_ATTEMPTS) {
                    submissionResult = {
                        status: "error",
                        message: "Judging timeout",
                    };

                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Polling failed", err);
                clearInterval(interval);
            }
        }, 2000);
    }
</script>

<svelte:head>
    <title>{challenge?.title || "Loading..."} | Challenge</title>
</svelte:head>
<div class="page-wrapper">
    <div class="container">
        {#if isLoading}
            <div class="center-state"><Loading size="lg" /></div>
        {:else if challenge}
            <Header {challenge} {difficultyColor} />
            <main class="main-layout">
                <section class="content-area">
                    <Description {challenge} />
                    <Editor
                        bind:userCode
                        bind:selectedLanguage
                        {isSubmitting}
                        onSubmit={handleSubmit}
                        languageOptions={languages}
                    />
                    {#if submissionResult}
                        <div class="result-banner {submissionResult.status}">
                            <Icon
                                name={submissionResult.status === "success"
                                    ? "check"
                                    : "bell"}
                            />
                            <span>{submissionResult.message}</span>
                        </div>
                    {/if}
                </section>
                <Sidebar {challenge} />
            </main>
        {/if}
    </div>
</div>

<style>
    .page-wrapper {
        min-height: 100vh;
        background-color: #0f1115;
        color: #e5e7eb;
        padding: 32px 20px;
    }
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
    .main-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 24px;
    }
    .content-area {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    .center-state {
        height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .result-banner {
        margin-top: 16px;
        padding: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
    }
    .result-banner.success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border: 1px solid #10b981;
    }
    .result-banner.error {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid #ef4444;
    }

    @media (max-width: 900px) {
        .main-layout {
            grid-template-columns: 1fr;
        }
        .page-wrapper {
            padding: 8px 8px;
        }
    }
</style>
