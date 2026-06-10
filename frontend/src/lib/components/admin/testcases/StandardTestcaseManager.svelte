<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import FileInput from "$lib/components/ui/FileInput.svelte";
    import ErrorBox from "$lib/components/ui/ErrorMessage.svelte";
    import { challengeService } from "$lib/services/challenge.service";
    import type { ApiTestcase } from "$lib/types/testcase.type";

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

    let zipFile = $state<File | null>(null);
    let zipUploading = $state(false);
    let error = $state("");

    function handleZipChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        zipFile = input.files?.[0] ?? null;
    }

    async function uploadZipTestcases() {
        if (!zipFile) {
            error = "Please choose a testcase ZIP file";
            return;
        }

        zipUploading = true;
        error = "";

        try {
            await challengeService.uploadTestcaseZip(challengeId, zipFile);
            zipFile = null;
            await onReload();
        } catch (e) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            zipUploading = false;
        }
    }
</script>

<section class="adm-testcase-manager">
    <div class="adm-toolbar">
        <div>
            <h2 class="adm-title-sm">ZIP Testcase Manager</h2>
            <p class="adm-description">
                Upload a ZIP file with input/output pairs. SQL ZIP can include
                schema.sql.
            </p>
        </div>

        <div class="adm-zip-actions">
            <FileInput
                id="zip-file"
                inline
                accept=".zip,application/zip,application/x-zip-compressed"
                onchange={handleZipChange}
            />

            <Button
                variant="primary"
                onclick={uploadZipTestcases}
                disabled={zipUploading || !zipFile}
            >
                {zipUploading ? "Uploading..." : "Upload ZIP"}
            </Button>
        </div>
    </div>

    <ErrorBox {error} compact />

    {#if testcases.length === 0}
        <div class="adm-testcase-empty-box">
            <Icon name="folder" size={42} />
            <h3 class="adm-section-title">No testcases yet</h3>
            <p class="adm-row-muted">
                Upload a ZIP file to create DSA/SQL testcases.
            </p>
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
                                Order #{tc.order_index ?? 0} • {tc.score ?? 0} pts
                            </p>
                        </div>

                        <Button
                            variant="danger"
                            onclick={() => onDelete(tc.id)}
                        >
                            Delete
                        </Button>
                    </div>

                    <div class="adm-file-list">
                        {#if tc.schema_path}
                            <div class="adm-file-row">
                                <span>Schema</span>
                                <code class="adm-code-inline">
                                    {tc.schema_path}
                                </code>
                            </div>
                        {/if}

                        {#if tc.input_path}
                            <div class="adm-file-row">
                                <span>Input</span>
                                <code class="adm-code-inline">
                                    {tc.input_path}
                                </code>
                            </div>
                        {/if}

                        {#if tc.expected_output_path}
                            <div class="adm-file-row">
                                <span>Expected</span>
                                <code class="adm-code-inline">
                                    {tc.expected_output_path}
                                </code>
                            </div>
                        {/if}
                    </div>
                </section>
            {/each}
        </div>
    {/if}
</section>
