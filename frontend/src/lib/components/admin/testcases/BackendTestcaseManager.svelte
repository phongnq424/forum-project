<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { ApiTestcase } from "$lib/types/testcase.type";
    import BackendTestcaseModal from "./BackendTestcaseModal.svelte";

    let {
        challengeId,
        testcases,
        onReload,
        onDelete,
    }: {
        challengeId: string;
        testcases: ApiTestcase[];
        onReload: () => Promise<void>;
        onDelete: (id: string) => Promise<void>;
    } = $props();

    let modalOpen = $state(false);
</script>

<section class="manager">
    <div class="toolbar">
        <div>
            <h2>API Step Testcase Manager</h2>
            <p>
                Each testcase is a scenario. Each scenario can contain multiple
                HTTP steps with individual scores.
            </p>
        </div>

        <Button variant="primary" onclick={() => (modalOpen = true)}>
            <Icon name="plus" size={16} />
            Add API Testcase
        </Button>
    </div>

    {#if testcases.length === 0}
        <div class="empty-box">
            <Icon name="folder" size={42} />
            <h3>No API testcases yet</h3>
            <p>Create a testcase with one or more API steps.</p>
            <Button variant="primary" onclick={() => (modalOpen = true)}>
                Create first testcase
            </Button>
        </div>
    {:else}
        <div class="testcase-list">
            {#each testcases as tc}
                <section class="testcase-card">
                    <div class="testcase-head">
                        <div>
                            <div class="title-row">
                                <h2>{tc.name}</h2>
                                <Badge color="outline" size="sm">
                                    {tc.visibility}
                                </Badge>
                            </div>
                            <p>
                                {tc.steps?.length ?? 0} steps • {tc.score ?? 0} pts
                            </p>
                        </div>

                        <Button
                            variant="danger"
                            onclick={() => onDelete(tc.id)}
                        >
                            Delete
                        </Button>
                    </div>

                    <div class="step-list">
                        {#each tc.steps ?? [] as step, i}
                            <div class="step-row">
                                <span class="step-index">#{i + 1}</span>
                                <Badge color="outline" size="sm">
                                    {step.method}
                                </Badge>
                                <code>{step.path}</code>
                                <span class="status">
                                    Expect {step.expected_status}
                                </span>
                                <span class="score">{step.score ?? 0} pts</span>
                            </div>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    {/if}

    <BackendTestcaseModal bind:open={modalOpen} {challengeId} {onReload} />
</section>

<style>
    .manager {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        border: 1px solid #2a2e36;
        background: #1e222b;
        border-radius: 16px;
        padding: 20px;
    }

    h2 {
        color: #f3f4f6;
        margin: 0;
        font-size: 18px;
    }

    p {
        color: #9ca3af;
        margin: 6px 0 0;
        font-size: 14px;
    }

    .empty-box {
        border: 1px solid #2a2e36;
        background: #1e222b;
        border-radius: 16px;
        padding: 48px;
        color: #9ca3af;
        text-align: center;
    }

    .testcase-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .testcase-card {
        border: 1px solid #2a2e36;
        background: #1e222b;
        border-radius: 16px;
        padding: 20px;
    }

    .testcase-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
    }

    .title-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .title-row h2 {
        color: #f3f4f6;
        font-size: 18px;
        margin: 0;
    }

    .testcase-head p {
        color: #6b7280;
        margin: 6px 0 0;
        font-size: 14px;
    }

    .step-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .step-row {
        display: grid;
        grid-template-columns: 44px 78px 1fr 120px 80px;
        gap: 10px;
        align-items: center;
        padding: 10px 12px;
        border-radius: 10px;
        background: #14161c;
        color: #d1d5db;
        font-size: 13px;
    }

    .step-index {
        color: #6b7280;
        font-weight: 700;
    }

    code {
        color: #e5e7eb;
        font-family: "Fira Code", monospace;
    }

    .status {
        color: #9ca3af;
    }

    .score {
        color: #818cf8;
        font-weight: 700;
        text-align: right;
    }

    @media (max-width: 900px) {
        .toolbar {
            flex-direction: column;
        }

        .step-row {
            grid-template-columns: 36px 72px 1fr;
        }

        .step-row .status,
        .step-row .score {
            grid-column: 3;
            text-align: left;
        }
    }
</style>
