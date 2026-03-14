<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import TextArea from "$lib/components/ui/TextArea.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Select from "$lib/components/ui/Select.svelte";

    let {
        userCode = $bindable(""),
        selectedLanguage = $bindable(),
        languageOptions = [],
        isSubmitting,
        onSubmit,
    } = $props();

    // Fix lỗi nút submit: Chỉ cho bấm khi có code và không đang gửi
    let canSubmit = $derived(userCode?.trim().length > 0 && !isSubmitting);
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Tab") {
            e.preventDefault(); // Chặn chuyển focus sang nút khác

            const target = e.currentTarget as HTMLTextAreaElement;
            const { selectionStart, selectionEnd } = target;

            const tabValue = "    ";
            userCode =
                userCode.substring(0, selectionStart) +
                tabValue +
                userCode.substring(selectionEnd);

            setTimeout(() => {
                target.selectionStart = target.selectionEnd =
                    selectionStart + tabValue.length;
            }, 0);
        }
    }
</script>

<Card padding="0">
    <div class="internal-header">
        <span class="title">Solution Editor</span>

        <div class="controls">
            <div>
                {#if languageOptions.length > 0}
                    <Select
                        label="Language:"
                        bind:value={selectedLanguage}
                        options={languageOptions}
                        inline={true}
                    />
                {:else}
                    <div class="loading-select">Loading...</div>
                {/if}
            </div>
            <Button variant="ghost" size="sm" onclick={() => (userCode = "")}>
                <Icon name="reply" size={14} />
                <span class="hide-mobile">Reset</span>
            </Button>
        </div>
    </div>

    <div class="editor-wrapper">
        <TextArea
            bind:value={userCode}
            rows={15}
            placeholder="// Typing your code here..."
            spellcheck="false"
            onkeydown={handleKeyDown}
        />
    </div>

    <div class="internal-footer">
        <Button variant="primary" onclick={onSubmit} disabled={!canSubmit}>
            {#if isSubmitting}
                <Icon name="loader" size={16} /> <span>Submitting...</span>
            {:else}
                <Icon name="share" size={16} /> <span>Submit Solution</span>
            {/if}
        </Button>
    </div>
</Card>

<style>
    .internal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap; /* Tự xuống dòng nếu màn hình quá hẹp */
        gap: 12px;
        padding: 10px 16px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .title {
        font-weight: 600;
        color: #d1d5db;
        white-space: nowrap;
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .editor-wrapper {
        padding: 12px;
    }

    /* Đảm bảo textarea luôn nằm trong khung, không văng ra ngoài */
    .editor-wrapper :global(textarea) {
        font-family: "Fira Code", monospace !important;
        tab-size: 4;
        line-height: 1.6;
        width: 100% !important;
        box-sizing: border-box;
    }

    .internal-footer {
        padding: 12px 16px;
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    @media (max-width: 640px) {
        .hide-mobile {
            display: none;
        }
    }
</style>
