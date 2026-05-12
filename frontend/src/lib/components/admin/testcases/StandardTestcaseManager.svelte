<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
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

<section class="manager">
    <div class="toolbar">
        <div>
            <h2>ZIP Testcase Manager</h2>
            <p>
                Upload a ZIP file with input/output pairs. SQL ZIP can include
                schema.sql.
            </p>
        </div>

        <div class="zip-actions">
            <input
                id="zip-file"
                type="file"
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

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    {#if testcases.length === 0}
        <div class="empty-box">
            <Icon name="folder" size={42} />
            <h3>No testcases yet</h3>
            <p>Upload a ZIP file to create DSA/SQL testcases.</p>
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

                    <div class="file-list">
                        {#if tc.schema_path}
                            <div class="file-row">
                                <span>Schema</span>
                                <code>{tc.schema_path}</code>
                            </div>
                        {/if}

                        {#if tc.input_path}
                            <div class="file-row">
                                <span>Input</span>
                                <code>{tc.input_path}</code>
                            </div>
                        {/if}

                        {#if tc.expected_output_path}
                            <div class="file-row">
                                <span>Expected</span>
                                <code>{tc.expected_output_path}</code>
                            </div>
                        {/if}
                    </div>
                </section>
            {/each}
        </div>
    {/if}
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

    .zip-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }

    .zip-actions input {
        color: #d1d5db;
        max-width: 320px;
    }

    .error-message {
        color: #fca5a5;
        font-size: 14px;
        background: rgba(239, 68, 68, 0.12);
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(239, 68, 68, 0.28);
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

    .file-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .file-row {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 12px;
        align-items: center;
        padding: 10px 12px;
        border-radius: 10px;
        background: #14161c;
        color: #d1d5db;
        font-size: 13px;
    }

    .file-row span {
        color: #9ca3af;
        font-weight: 700;
    }

    code {
        color: #e5e7eb;
        font-family: "Fira Code", monospace;
        overflow-wrap: anywhere;
    }

    @media (max-width: 900px) {
        .toolbar {
            flex-direction: column;
        }

        .file-row {
            grid-template-columns: 1fr;
        }
    }
</style>
