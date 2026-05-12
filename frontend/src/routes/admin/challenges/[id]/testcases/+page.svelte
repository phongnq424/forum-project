<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import type { Challenge } from "$lib/types/challenge.type";
    import type { ApiTestcase } from "$lib/types/testcase.type";

    import TestcasePageHeader from "$lib/components/admin/testcases/TestcasePageHeader.svelte";
    import StandardTestcaseManager from "$lib/components/admin/testcases/StandardTestcaseManager.svelte";
    import BackendTestcaseManager from "$lib/components/admin/testcases/BackendTestcaseManager.svelte";

    let { params } = $props<{
        params: {
            id: string;
        };
    }>();

    let challengeId = $derived(params.id);

    let challenge = $state<Challenge | null>(null);
    let testcases = $state<ApiTestcase[]>([]);
    let isLoading = $state(false);
    let error = $state("");

    let isBackendChallenge = $derived(challenge?.type === "BACKEND");

    onMount(loadPage);

    async function loadPage() {
        isLoading = true;
        error = "";

        try {
            const [challengeDetail, testcaseList] = await Promise.all([
                challengeService.getById(challengeId),
                challengeService.listTestcases(challengeId),
            ]);

            challenge = challengeDetail;
            testcases = testcaseList;
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            isLoading = false;
        }
    }

    async function reloadTestcases() {
        try {
            testcases = await challengeService.listTestcases(challengeId);
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        }
    }

    async function deleteTestcase(id: string) {
        const ok = confirm("Delete this testcase?");
        if (!ok) return;

        try {
            await challengeService.deleteTestcase(id);
            await reloadTestcases();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        }
    }
</script>

<svelte:head>
    <title>Challenge Testcases</title>
</svelte:head>

<div class="page">
    <TestcasePageHeader {challenge} {isBackendChallenge} />

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    {#if isLoading}
        <div class="loading-box">Loading testcases...</div>
    {:else if !challenge}
        <div class="empty-box">
            <Icon name="folder" size={42} />
            <h3>Challenge not found</h3>
        </div>
    {:else if isBackendChallenge}
        <BackendTestcaseManager
            {challengeId}
            {testcases}
            onReload={reloadTestcases}
            onDelete={deleteTestcase}
        />
    {:else}
        <StandardTestcaseManager
            {challengeId}
            {testcases}
            onReload={reloadTestcases}
            onDelete={deleteTestcase}
        />
    {/if}
</div>

<style>
    .page {
        max-width: 1180px;
        margin: 0 auto;
        padding: 32px 24px;
    }

    .error-message {
        color: #fca5a5;
        font-size: 14px;
        background: rgba(239, 68, 68, 0.12);
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(239, 68, 68, 0.28);
        margin-bottom: 16px;
    }

    .loading-box,
    .empty-box {
        border: 1px solid #2a2e36;
        background: #1e222b;
        border-radius: 16px;
        padding: 48px;
        color: #9ca3af;
        text-align: center;
    }

    .empty-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .empty-box h3 {
        color: #f3f4f6;
        margin: 0;
    }
</style>
