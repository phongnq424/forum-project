<script lang="ts">
    import { page } from "$app/state";
    import { untrack } from "svelte";
    import { onDestroy, onMount } from "svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Description from "$lib/components/challenge/ChallengeDetail/Description.svelte";
    import Header from "$lib/components/challenge/ChallengeDetail/Header.svelte";
    import Editor from "$lib/components/challenge/ChallengeDetail/Editor.svelte";
    import Sidebar from "$lib/components/challenge/ChallengeDetail/Sidebar.svelte";
    import { authState } from "$lib/states/auth.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import { languageService } from "$lib/services/language.service";
    import { submissionService } from "$lib/services/submission.service";
    import { socketService } from "$lib/services/socket.svelte";
    import type {
        Challenge,
        ChallengeDifficulty,
    } from "$lib/types/challenge.type";
    import type { Leaderboard } from "$lib/types/leaderboard.type";
    import type {
        LearningRecommendation,
        SubmissionAIInsight,
    } from "$lib/types/submission-ai.type";

    const difficultyColor: Record<
        ChallengeDifficulty,
        "success" | "warning" | "danger"
    > = {
        EASY: "success",
        MEDIUM: "warning",
        HARD: "danger",
    };

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

    let recentSubmissions = $state<any[]>([]);
    let leaderboard = $state<Leaderboard[]>([]);

    let activeSubmissionId = $state<string | null>(null);
    let aiInsightStatus = $state<"idle" | "waiting" | "ready" | "error">(
        "idle",
    );
    let aiInsight = $state<SubmissionAIInsight | null>(null);
    let learningRecommendations = $state<LearningRecommendation[]>([]);

    const challengeId = $derived(page.params.id);

    function resetAiInsight() {
        activeSubmissionId = null;
        aiInsightStatus = "idle";
        aiInsight = null;
        learningRecommendations = [];
    }

    function isJudging(status: string) {
        return status === "PENDING" || status === "RUNNING";
    }

    function resolveInsightResponse(res: unknown): {
        ready: boolean;
        insight: SubmissionAIInsight | null;
        shouldRetry: boolean;
    } {
        if (!res || typeof res !== "object") {
            return {
                ready: false,
                insight: null,
                shouldRetry: false,
            };
        }

        const data = res as {
            ready?: boolean;
            insight?: SubmissionAIInsight | null;
            id?: string;
            submission_id?: string;
            summary?: string | null;
            mistake_type?: string | null;
            mistake_level?: string | null;
            explanation?: string | null;
            suggestion?: string | null;
            topics?: unknown[];
        };

        if (data.ready === true && data.insight) {
            return {
                ready: true,
                insight: data.insight,
                shouldRetry: false,
            };
        }

        if (data.ready === false) {
            return {
                ready: false,
                insight: null,
                shouldRetry: true,
            };
        }

        const looksLikeDirectInsight =
            Boolean(data.id) ||
            Boolean(data.submission_id) ||
            Boolean(data.summary) ||
            Boolean(data.mistake_type) ||
            Boolean(data.explanation) ||
            Boolean(data.suggestion) ||
            Array.isArray(data.topics);

        if (looksLikeDirectInsight) {
            return {
                ready: true,
                insight: data as SubmissionAIInsight,
                shouldRetry: false,
            };
        }

        return {
            ready: false,
            insight: null,
            shouldRetry: false,
        };
    }

    async function fetchRecentSubmissions() {
        if (!authState.user?.id || !challengeId) {
            recentSubmissions = [];
            return;
        }

        try {
            const res = await submissionService.listByUserAndChallenge(
                authState.user.id,
                challengeId,
            );
            recentSubmissions = res;
        } catch (err) {
            console.error("Lỗi fetch history:", err);
        }
    }

    async function fetchLeaderboard() {
        if (!challengeId) return;

        try {
            const res = await submissionService.getLeaderboard(challengeId);
            leaderboard = res;
        } catch (err) {
            console.error("Lỗi fetch leaderboard:", err);
        }
    }

    async function fetchChallengeDetail(id: string) {
        isLoading = true;
        error = null;

        try {
            const res = await challengeService.getById(id);
            challenge = res;
            userCode = "";

            await refreshRecentSubmissionsAndResume();
            fetchLeaderboard();
        } catch (err) {
            error = "Failed to fetch challenge details.";
        } finally {
            isLoading = false;
        }
    }

    async function fetchLanguages() {
        try {
            const res = await languageService.listLanguages();
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
            console.error("Failed to fetch languages:", err);
        }
    }

    async function fetchRecommendations(submissionId: string) {
        try {
            learningRecommendations =
                await submissionService.getRecommendations(submissionId);
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
            learningRecommendations = [];
        }
    }

    async function fetchSubmissionInsight(submissionId: string) {
        try {
            aiInsightStatus = "waiting";

            const res = await submissionService.getInsight(submissionId);
            const resolved = resolveInsightResponse(res);

            if (resolved.ready && resolved.insight) {
                activeSubmissionId = submissionId;
                aiInsight = resolved.insight;
                aiInsightStatus = "ready";
                fetchRecommendations(submissionId);
                return;
            }

            aiInsightStatus = "waiting";
        } catch (err) {
            console.error("Failed to fetch AI insight:", err);
            aiInsightStatus = "idle";
        }
    }

    async function refreshRecentSubmissionsAndResume() {
        await fetchRecentSubmissions();
        resumeLatestSubmissionFlow();
    }

    function resumeLatestSubmissionFlow() {
        if (!recentSubmissions.length) return;

        const latest = recentSubmissions[0];

        if (!latest?.id || !latest?.status) return;

        if (latest.id === activeSubmissionId && aiInsightStatus === "waiting") {
            return;
        }

        activeSubmissionId = latest.id;

        if (isJudging(latest.status)) {
            submissionResult = {
                status: "success",
                message: "Submission is still judging...",
            };
            return;
        }

        submissionResult = null;
        fetchSubmissionInsight(latest.id);
    }

    function handleSubmissionUpdated(data: {
        submissionId: string;
        challengeId: string;
        status: string;
        score: number;
        runtime_ms?: number | null;
        memory_kb?: number | null;
    }) {
        if (!data?.submissionId || !data?.challengeId) return;
        if (data.challengeId !== challengeId) return;

        if (activeSubmissionId && data.submissionId !== activeSubmissionId) {
            return;
        }

        activeSubmissionId = data.submissionId;

        submissionResult = {
            status: data.status === "ACCEPTED" ? "success" : "error",
            message: data.status,
        };

        fetchRecentSubmissions();
        fetchLeaderboard();

        aiInsightStatus = "waiting";
    }

    function handleSubmissionInsightReady(data: {
        submissionId: string;
        challengeId: string;
    }) {
        if (!data?.submissionId || !data?.challengeId) return;
        if (data.challengeId !== challengeId) return;

        if (activeSubmissionId && data.submissionId !== activeSubmissionId) {
            return;
        }

        activeSubmissionId = data.submissionId;
        fetchSubmissionInsight(data.submissionId);
    }

    onMount(() => {
        socketService.connect();
        fetchLanguages();

        const unsubscribeSubmissionUpdated = socketService.on(
            "submission:updated",
            handleSubmissionUpdated,
        );

        const unsubscribeSubmissionInsightReady = socketService.on(
            "submission:insight:ready",
            handleSubmissionInsightReady,
        );

        return () => {
            unsubscribeSubmissionUpdated();
            unsubscribeSubmissionInsightReady();
        };
    });

    $effect(() => {
        const id = challengeId;

        if (id) {
            untrack(() => {
                if (!challenge || challenge.id !== id) {
                    resetAiInsight();
                    fetchChallengeDetail(id);
                }
            });
        }
    });

    async function handleSubmit() {
        if (!challenge || isSubmitting) return;

        isSubmitting = true;
        submissionResult = null;
        resetAiInsight();

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

            activeSubmissionId = res.id;
            await fetchRecentSubmissions();
        } catch (err) {
            submissionResult = {
                status: "error",
                message: "Submit failed",
            };
        } finally {
            isSubmitting = false;
        }
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
                        challengeType={challenge.type}
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

                    {#if aiInsightStatus === "waiting"}
                        <div class="ai-insight-card waiting">
                            <div class="ai-insight-header">
                                <Icon name="loader" size={16} />
                                <span>AI is analyzing your submission...</span>
                            </div>
                            <p>
                                The system is reviewing the judge result, test
                                cases, and source code to identify the main
                                issue. You can leave this page; the result will
                                be saved once the analysis is complete.
                            </p>
                        </div>
                    {:else if aiInsightStatus === "ready" && aiInsight}
                        <div class="ai-insight-card">
                            <div class="ai-insight-header">
                                <Icon name="bell" size={16} />
                                <span>AI Analysis</span>
                            </div>

                            {#if aiInsight.summary}
                                <p class="summary">{aiInsight.summary}</p>
                            {/if}

                            <div class="insight-grid">
                                <div>
                                    <span class="label">Mistake Type</span>
                                    <strong>
                                        {aiInsight.mistake_type || "UNKNOWN"}
                                    </strong>
                                </div>

                                <div>
                                    <span class="label">Level</span>
                                    <strong>
                                        {aiInsight.mistake_level || "LOW"}
                                    </strong>
                                </div>
                            </div>

                            {#if aiInsight.explanation}
                                <div class="insight-section">
                                    <h4>Explanation</h4>
                                    <p>{aiInsight.explanation}</p>
                                </div>
                            {/if}

                            {#if aiInsight.suggestion}
                                <div class="insight-section">
                                    <h4>Suggestion</h4>
                                    <p>{aiInsight.suggestion}</p>
                                </div>
                            {/if}

                            {#if aiInsight.topics?.length}
                                <div class="topic-list">
                                    {#each aiInsight.topics as item}
                                        <span>
                                            {item.Topic?.name ||
                                                item.name ||
                                                item.topic_id}
                                        </span>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {:else if aiInsightStatus === "error"}
                        <div class="ai-insight-card error">
                            <div class="ai-insight-header">
                                <Icon name="bell" size={16} />
                                <span>AI is not done analyzing</span>
                            </div>
                            <p>
                                You can come back to this later. If the analysis
                                is complete, the system will display it from the
                                submission history.
                            </p>
                        </div>
                    {/if}

                    {#if learningRecommendations.length > 0}
                        <div class="recommendation-card">
                            <div class="recommendation-header">
                                <Icon name="folder" size={16} />
                                <span>Learning Recommendations</span>
                            </div>

                            {#each learningRecommendations as recommendation}
                                <div class="recommendation-block">
                                    {#if recommendation.Topic}
                                        <div class="recommendation-topic">
                                            Topic: {recommendation.Topic.name}
                                        </div>
                                    {/if}

                                    {#if recommendation.reason}
                                        <p>{recommendation.reason}</p>
                                    {/if}

                                    {#if recommendation.learningRecommendationItems?.length}
                                        <div class="recommendation-items">
                                            {#each recommendation.learningRecommendationItems as item}
                                                <div
                                                    class="recommendation-item"
                                                >
                                                    <span class="item-type">
                                                        {item.target_type ||
                                                            "ITEM"}
                                                    </span>
                                                    <span>
                                                        {item.reason ||
                                                            "Tài nguyên học tập liên quan."}
                                                    </span>
                                                </div>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </section>
                <Sidebar
                    {challenge}
                    {recentSubmissions}
                    leaderboard={leaderboard || []}
                />
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

    .ai-insight-card {
        padding: 16px;
        border-radius: 10px;
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(59, 130, 246, 0.35);
        color: #dbeafe;
    }

    .ai-insight-card.waiting {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.35);
        color: #fde68a;
    }

    .ai-insight-card.error {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.35);
        color: #fecaca;
    }

    .ai-insight-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .ai-insight-card p {
        margin: 0;
        line-height: 1.6;
    }

    .summary {
        margin: 8px 0 14px !important;
        color: #e5e7eb;
    }

    .insight-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 12px 0;
    }

    .insight-grid > div {
        padding: 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.04);
    }

    .label {
        display: block;
        font-size: 12px;
        color: #9ca3af;
        margin-bottom: 4px;
    }

    .insight-section {
        margin-top: 14px;
    }

    .insight-section h4 {
        margin: 0 0 6px;
        font-size: 14px;
        color: #93c5fd;
    }

    .insight-section p {
        margin: 0;
        color: #e5e7eb;
        line-height: 1.6;
    }

    .topic-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 14px;
    }

    .topic-list span {
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #bfdbfe;
        font-size: 12px;
    }

    .recommendation-card {
        padding: 16px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .recommendation-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        margin-bottom: 12px;
        color: #e5e7eb;
    }

    .recommendation-block + .recommendation-block {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .recommendation-topic {
        font-size: 13px;
        color: #93c5fd;
        margin-bottom: 6px;
        font-weight: 600;
    }

    .recommendation-card p {
        margin: 0 0 12px;
        color: #d1d5db;
        line-height: 1.6;
    }

    .recommendation-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .recommendation-item {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.04);
        color: #d1d5db;
        font-size: 13px;
    }

    .item-type {
        flex-shrink: 0;
        padding: 2px 6px;
        border-radius: 999px;
        background: rgba(59, 130, 246, 0.16);
        color: #93c5fd;
        font-size: 11px;
        font-weight: 700;
    }

    @media (max-width: 900px) {
        .main-layout {
            grid-template-columns: 1fr;
        }
        .page-wrapper {
            padding: 8px 8px;
        }
        .insight-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
