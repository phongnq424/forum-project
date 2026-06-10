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

<section class="adm-testcase-manager">
    <div class="adm-toolbar">
        <div>
            <h2 class="adm-title-sm">API Step Testcase Manager</h2>
            <p class="adm-description">
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
        <div class="adm-testcase-empty-box">
            <Icon name="folder" size={42} />
            <h3 class="adm-section-title">No API testcases yet</h3>
            <p class="adm-row-muted">
                Create a testcase with one or more API steps.
            </p>
            <Button variant="primary" onclick={() => (modalOpen = true)}>
                Create first testcase
            </Button>
        </div>
    {:else}
        <div class="adm-testcase-list">
            {#each testcases as tc}
                <section class="adm-testcase-card">
                    <div class="adm-testcase-head">
                        <div>
                            <div class="adm-title-row">
                                <h2 class="adm-title-sm">{tc.name}</h2>
                                <Badge color="outline" size="sm">
                                    {tc.visibility}
                                </Badge>
                            </div>
                            <p class="adm-row-subtle">
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

                    <div class="adm-step-list">
                        {#each tc.steps ?? [] as step, i}
                            <div class="adm-step-row">
                                <span class="adm-step-index">#{i + 1}</span>
                                <Badge color="outline" size="sm">
                                    {step.method}
                                </Badge>
                                <code class="adm-code-inline">{step.path}</code>
                                <span class="adm-step-status">
                                    Expect {step.expected_status}
                                </span>
                                <span class="adm-score"
                                    >{step.score ?? 0} pts</span
                                >
                            </div>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    {/if}

    <BackendTestcaseModal bind:open={modalOpen} {challengeId} {onReload} />
</section>
