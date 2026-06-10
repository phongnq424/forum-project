<script lang="ts">
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import FileInput from "$lib/components/ui/FileInput.svelte";
    import ErrorMessage from "$lib/components/ui/ErrorMessage.svelte";
    import { tick, untrack } from "svelte";
    import { marked } from "marked";

    import { postService } from "$lib/services/post.service";
    import type { Post, PostTopic } from "$lib/types/post.type";

    interface PostImage {
        id: string;
        url: string;
    }

    type SimpleTopic = {
        id: string;
        name: string;
        slug?: string;
        parent_id?: string | null;
    };

    let {
        open = $bindable(false),
        post = null,
        topics = [],
        onSuccess,
    } = $props<{
        open: boolean;
        post?: Post | null;
        topics: SimpleTopic[];
        onSuccess?: (post?: Post) => void;
    }>();

    const isEdit = $derived(Boolean(post));

    let title = $state("");
    let content = $state("");
    let primaryTopicId = $state("");
    let selectedTopicIds = $state<string[]>([]);
    let existingImages = $state<PostImage[]>([]);
    let imagesToDelete = $state<string[]>([]);
    let newImages = $state<{ file: File; url: string }[]>([]);

    let loading = $state(false);
    let errorMessage = $state("");

    function isTopicSelected(topicId: string) {
        return selectedTopicIds.includes(topicId);
    }

    function normalizeTopicIds(ids: string[]) {
        return Array.from(new Set(ids.filter(Boolean)));
    }

    function toggleTopic(topicId: string) {
        if (isTopicSelected(topicId)) {
            const nextIds = selectedTopicIds.filter((id) => id !== topicId);
            selectedTopicIds = nextIds;

            if (primaryTopicId === topicId) {
                primaryTopicId = nextIds[0] ?? "";
            }

            return;
        }

        selectedTopicIds = normalizeTopicIds([...selectedTopicIds, topicId]);

        if (!primaryTopicId) {
            primaryTopicId = topicId;
        }
    }

    function setPrimaryTopic(topicId: string) {
        primaryTopicId = topicId;

        if (!selectedTopicIds.includes(topicId)) {
            selectedTopicIds = normalizeTopicIds([
                topicId,
                ...selectedTopicIds,
            ]);
        }
    }

    function isPostTopic(
        topic: PostTopic | null | undefined,
    ): topic is PostTopic {
        return Boolean(topic && topic.id && topic.name);
    }

    function getPostTopicIds(currentPost: Post) {
        const fromTopics = currentPost.topics?.map((topic) => topic.id) ?? [];

        const fromPostTopics =
            currentPost.PostTopics?.map((item) => item.Topic)
                .filter(isPostTopic)
                .map((topic) => topic.id) ?? [];

        return normalizeTopicIds([...fromTopics, ...fromPostTopics]);
    }

    function getPrimaryTopicId(currentPost: Post) {
        return (
            currentPost.primaryTopic?.id ||
            currentPost.topic?.id ||
            currentPost.Topic?.id ||
            currentPost.topicId ||
            currentPost.topic_id ||
            ""
        );
    }

    function resetNewImages() {
        newImages.forEach((img) => URL.revokeObjectURL(img.url));
        newImages = [];
    }

    function initFormData() {
        if (post) {
            title = post.title ?? "";
            content = post.content ?? "";

            primaryTopicId = getPrimaryTopicId(post);
            selectedTopicIds = getPostTopicIds(post);

            if (primaryTopicId && !selectedTopicIds.includes(primaryTopicId)) {
                selectedTopicIds = normalizeTopicIds([
                    primaryTopicId,
                    ...selectedTopicIds,
                ]);
            }

            existingImages = post.Image ? [...post.Image] : [];
        } else {
            title = "";
            content = "";
            primaryTopicId = "";
            selectedTopicIds = [];
            existingImages = [];
        }

        imagesToDelete = [];
        errorMessage = "";
        loading = false;
        resetNewImages();
    }

    let contentTextarea: HTMLTextAreaElement;

    let previewHtml = $derived(marked.parse(content || "") as string);

    const markdownHints = [
        { label: "Bold", syntax: "**text**" },
        { label: "Italic", syntax: "*text*" },
        { label: "Heading", syntax: "## Title" },
        { label: "Quote", syntax: "> quote" },
        { label: "List", syntax: "- item" },
        { label: "Code", syntax: "`code`" },
        { label: "Code block", syntax: "```js\\ncode\\n```" },
    ];

    type TextSelection = {
        start: number;
        end: number;
    };

    let savedSelection = $state<TextSelection>({ start: 0, end: 0 });

    function saveSelection() {
        if (!contentTextarea) return;

        savedSelection = {
            start: contentTextarea.selectionStart,
            end: contentTextarea.selectionEnd,
        };
    }

    function getSelection() {
        if (!contentTextarea) {
            return savedSelection;
        }

        const activeElement = document.activeElement;

        if (activeElement === contentTextarea) {
            saveSelection();
            return savedSelection;
        }

        return savedSelection;
    }

    async function updateContent(
        nextContent: string,
        nextStart: number,
        nextEnd: number,
    ) {
        content = nextContent;

        await tick();

        contentTextarea.focus();
        contentTextarea.setSelectionRange(nextStart, nextEnd);

        savedSelection = {
            start: nextStart,
            end: nextEnd,
        };
    }

    function isWrapped(text: string, before: string, after: string) {
        return text.startsWith(before) && text.endsWith(after);
    }

    async function toggleInlineMarkdown(
        before: string,
        after = before,
        placeholder = "text",
    ) {
        if (!contentTextarea) return;

        const { start, end } = getSelection();
        const hasSelection = start !== end;
        const selectedText = content.slice(start, end);

        if (hasSelection && isWrapped(selectedText, before, after)) {
            const innerText = selectedText.slice(
                before.length,
                selectedText.length - after.length,
            );

            const nextContent =
                content.slice(0, start) + innerText + content.slice(end);

            await updateContent(nextContent, start, start + innerText.length);

            return;
        }

        const beforeStart = start - before.length;
        const afterEnd = end + after.length;

        const hasWrapperAroundSelection =
            beforeStart >= 0 &&
            content.slice(beforeStart, start) === before &&
            content.slice(end, afterEnd) === after;

        if (hasWrapperAroundSelection) {
            const nextContent =
                content.slice(0, beforeStart) +
                selectedText +
                content.slice(afterEnd);

            await updateContent(
                nextContent,
                beforeStart,
                beforeStart + selectedText.length,
            );

            return;
        }

        const textToInsert = hasSelection ? selectedText : placeholder;

        const nextContent =
            content.slice(0, start) +
            before +
            textToInsert +
            after +
            content.slice(end);

        const nextStart = start + before.length;
        const nextEnd = nextStart + textToInsert.length;

        await updateContent(nextContent, nextStart, nextEnd);
    }

    function getLineRange(start: number, end: number) {
        const lineStart = content.lastIndexOf("\n", start - 1) + 1;

        let lineEnd = content.indexOf("\n", end);

        if (lineEnd === -1) {
            lineEnd = content.length;
        }

        return {
            lineStart,
            lineEnd,
        };
    }

    async function toggleLineMarkdown(prefix: string, placeholder = "text") {
        if (!contentTextarea) return;

        const { start, end } = getSelection();
        const hasSelection = start !== end;

        if (!hasSelection) {
            const nextContent =
                content.slice(0, start) +
                prefix +
                placeholder +
                content.slice(end);

            await updateContent(
                nextContent,
                start + prefix.length,
                start + prefix.length + placeholder.length,
            );

            return;
        }

        const { lineStart, lineEnd } = getLineRange(start, end);
        const selectedBlock = content.slice(lineStart, lineEnd);
        const lines = selectedBlock.split("\n");

        const allLinesHavePrefix = lines.every((line) => {
            if (!line.trim()) return true;
            return line.startsWith(prefix);
        });

        const nextBlock = lines
            .map((line) => {
                if (!line.trim()) return line;

                if (allLinesHavePrefix) {
                    return line.slice(prefix.length);
                }

                if (line.startsWith(prefix)) {
                    return line;
                }

                return prefix + line;
            })
            .join("\n");

        const nextContent =
            content.slice(0, lineStart) + nextBlock + content.slice(lineEnd);

        const diff = nextBlock.length - selectedBlock.length;

        await updateContent(
            nextContent,
            Math.max(
                lineStart,
                start + (allLinesHavePrefix ? -prefix.length : prefix.length),
            ),
            Math.max(lineStart, end + diff),
        );
    }

    async function toggleHeading() {
        await toggleLineMarkdown("## ", "Heading");
    }

    async function toggleQuote() {
        await toggleLineMarkdown("> ", "Quote");
    }

    async function toggleList() {
        await toggleLineMarkdown("- ", "List item");
    }

    async function toggleCodeBlock() {
        if (!contentTextarea) return;

        const { start, end } = getSelection();
        const selectedText = content.slice(start, end);
        const hasSelection = start !== end;

        const blockStart = "```js\n";
        const blockEnd = "\n```";

        if (
            hasSelection &&
            selectedText.startsWith(blockStart) &&
            selectedText.endsWith(blockEnd)
        ) {
            const innerText = selectedText.slice(
                blockStart.length,
                selectedText.length - blockEnd.length,
            );

            const nextContent =
                content.slice(0, start) + innerText + content.slice(end);

            await updateContent(nextContent, start, start + innerText.length);

            return;
        }

        const beforeStart = start - blockStart.length;
        const afterEnd = end + blockEnd.length;

        const hasWrapperAroundSelection =
            beforeStart >= 0 &&
            content.slice(beforeStart, start) === blockStart &&
            content.slice(end, afterEnd) === blockEnd;

        if (hasWrapperAroundSelection) {
            const nextContent =
                content.slice(0, beforeStart) +
                selectedText +
                content.slice(afterEnd);

            await updateContent(
                nextContent,
                beforeStart,
                beforeStart + selectedText.length,
            );

            return;
        }

        const textToInsert = hasSelection
            ? selectedText
            : "console.log('Hello');";

        const block = blockStart + textToInsert + blockEnd;

        const nextContent =
            content.slice(0, start) + block + content.slice(end);

        await updateContent(
            nextContent,
            start + blockStart.length,
            start + blockStart.length + textToInsert.length,
        );
    }

    $effect(() => {
        if (open) {
            untrack(() => initFormData());
        }
    });

    $effect(() => {
        return () => resetNewImages();
    });

    async function handleSubmit(e: Event) {
        e.preventDefault();
        errorMessage = "";

        if (!title.trim() || !content.trim()) {
            errorMessage = "Please fill in title and content.";
            return;
        }

        if (!primaryTopicId || selectedTopicIds.length === 0) {
            errorMessage = "Please select at least one topic.";
            return;
        }

        loading = true;

        try {
            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("content", content.trim());
            formData.append("topicId", primaryTopicId);
            formData.append("topicIds", JSON.stringify(selectedTopicIds));

            newImages.forEach((img) => {
                formData.append("images", img.file);
            });

            let result: Post;

            if (isEdit && post) {
                formData.append(
                    "delete_images",
                    JSON.stringify(imagesToDelete),
                );

                result = await postService.updatePost(post.id, formData);
            } else {
                result = await postService.createPost(formData);
            }

            open = false;
            onSuccess?.(result);
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                        error?: string;
                    };
                };
                message?: string;
            };

            errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Something went wrong.";
        } finally {
            loading = false;
        }
    }

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const addedImages = Array.from(input.files).map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        newImages = [...newImages, ...addedImages];
        input.value = "";
    }

    function removeExistingImage(imgId: string) {
        existingImages = existingImages.filter((img) => img.id !== imgId);
        imagesToDelete = [...imagesToDelete, imgId];
    }

    function removeNewImage(url: string) {
        const imgToRemove = newImages.find((img) => img.url === url);

        if (imgToRemove) {
            URL.revokeObjectURL(imgToRemove.url);
        }

        newImages = newImages.filter((img) => img.url !== url);
    }
</script>

<Modal bind:open title={isEdit ? "Edit Post" : "Create Post"} maxWidth="1180px">
    <form class="post-form" onsubmit={handleSubmit}>
        <ErrorMessage error={errorMessage} />

        <Input label="Title" bind:value={title} required disabled={loading} />

        <div class="topic-section">
            <div class="topic-header">
                <div>
                    <p class="label">Topics *</p>
                    <p class="hint">
                        Select one or more tags. Click the star to choose the
                        main topic.
                    </p>
                </div>
            </div>

            <div class="topic-chip-list">
                {#each topics as topic (topic.id)}
                    <div
                        class="topic-chip"
                        class:selected={isTopicSelected(topic.id)}
                        class:primary={primaryTopicId === topic.id}
                    >
                        <button
                            type="button"
                            class="chip-main"
                            disabled={loading}
                            onclick={() => toggleTopic(topic.id)}
                        >
                            #{topic.name}
                        </button>

                        {#if isTopicSelected(topic.id)}
                            <button
                                type="button"
                                class="star-btn"
                                class:active={primaryTopicId === topic.id}
                                disabled={loading}
                                title="Set as main topic"
                                onclick={() => setPrimaryTopic(topic.id)}
                            >
                                ★
                            </button>
                        {/if}
                    </div>
                {:else}
                    <p class="empty-topic">No topics available.</p>
                {/each}
            </div>

            {#if selectedTopicIds.length > 0}
                <p class="selected-summary">
                    Selected {selectedTopicIds.length} topic{selectedTopicIds.length ===
                    1
                        ? ""
                        : "s"}. Main topic:
                    <strong>
                        {topics.find(
                            (t: SimpleTopic) => t.id === primaryTopicId,
                        )?.name ?? "None"}
                    </strong>
                </p>
            {/if}
        </div>

        <div class="markdown-section">
            <div class="markdown-column editor-column">
                <div class="section-header">
                    <div>
                        <p class="section-title">Content</p>
                        <p class="section-subtitle">
                            Write with Markdown or use toolbar
                        </p>
                    </div>
                </div>

                <div class="markdown-toolbar">
                    <button
                        type="button"
                        disabled={loading}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={() =>
                            toggleInlineMarkdown("**", "**", "bold text")}
                    >
                        B
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={() =>
                            toggleInlineMarkdown("*", "*", "italic text")}
                    >
                        I
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={toggleHeading}
                    >
                        H2
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={toggleQuote}
                    >
                        Quote
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={toggleList}
                    >
                        List
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={() => toggleInlineMarkdown("`", "`", "code")}
                    >
                        Code
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={toggleCodeBlock}
                    >
                        Code block
                    </button>
                </div>

                <div class="markdown-hints">
                    {#each markdownHints as hint}
                        <div class="hint-item">
                            <span>{hint.label}</span>
                            <code>{hint.syntax}</code>
                        </div>
                    {/each}
                </div>

                <textarea
                    bind:this={contentTextarea}
                    bind:value={content}
                    class="markdown-textarea"
                    placeholder="Write your post content here..."
                    required
                    disabled={loading}
                    onselect={saveSelection}
                    onkeyup={saveSelection}
                    onclick={saveSelection}
                ></textarea>
            </div>

            <div class="markdown-column preview-column">
                <div class="section-header">
                    <div>
                        <p class="section-title">Preview</p>
                        <p class="section-subtitle">Live rendered result</p>
                    </div>
                </div>

                <div class="markdown-preview">
                    {#if content.trim()}
                        {@html previewHtml}
                    {:else}
                        <div class="empty-preview">
                            Your Markdown preview will appear here.
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <div class="image-section">
            <p class="label">Images</p>

            <div class="image-preview">
                {#if isEdit}
                    {#each existingImages as img (img.id)}
                        <div class="preview-item existing">
                            <button
                                type="button"
                                class="remove-btn"
                                onclick={() => removeExistingImage(img.id)}
                            >
                                ✕
                            </button>

                            <img src={img.url} alt="existing" />
                            <span class="tag">Server</span>
                        </div>
                    {/each}
                {/if}

                {#each newImages as img (img.url)}
                    <div class="preview-item new">
                        <button
                            type="button"
                            class="remove-btn"
                            onclick={() => removeNewImage(img.url)}
                        >
                            ✕
                        </button>

                        <img src={img.url} alt="preview" />
                        <span class="tag">New</span>
                    </div>
                {/each}
            </div>

            <FileInput
                label="Attach Images (Optional)"
                accept="image/*"
                multiple
                disabled={loading}
                onchange={handleFileChange}
            />
        </div>

        <div class="form-actions">
            <Button
                variant="ghost"
                type="button"
                onclick={() => (open = false)}
                disabled={loading}
            >
                Cancel
            </Button>

            <Button variant="primary" type="submit" disabled={loading}>
                {isEdit
                    ? loading
                        ? "Saving..."
                        : "Save Changes"
                    : loading
                      ? "Posting..."
                      : "Post"}
            </Button>
        </div>
    </form>
</Modal>

<style>
    .post-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 10px 0;
    }

    .topic-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .topic-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .label {
        color: var(--ui-text-muted);
        font-size: 13px;
        font-weight: 500;
        margin: 0 0 4px;
        display: block;
    }

    .hint {
        margin: 0;
        font-size: 12px;
        color: var(--ui-text-soft);
    }

    .topic-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        max-height: 180px;
        overflow-y: auto;
    }

    .topic-chip {
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        border: 1px solid var(--ui-border);
        border-radius: 999px;
        background: var(--ui-surface-raised);
        color: var(--ui-text-muted);
        transition:
            border-color 0.2s ease,
            background-color 0.2s ease,
            color 0.2s ease;
    }

    .topic-chip:hover {
        border-color: var(--ui-primary-border);
        background: var(--ui-surface-hover);
        color: var(--ui-text-strong);
    }

    .topic-chip.selected {
        border-color: var(--ui-primary-border);
        background: var(--ui-primary-soft);
        color: var(--ui-text);
    }

    .topic-chip.primary {
        border-color: var(--ui-warning-border);
        background: var(--ui-warning-soft);
    }

    .chip-main {
        border: none;
        background: transparent;
        color: inherit;
        padding: 7px 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
    }

    .chip-main:disabled,
    .star-btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .star-btn {
        border: none;
        border-left: 1px solid var(--ui-border-soft);
        background: var(--ui-surface-soft);
        color: var(--ui-text-soft);
        padding: 7px 9px;
        cursor: pointer;
        font-size: 12px;
    }

    .star-btn.active {
        color: var(--ui-warning);
    }

    .selected-summary {
        margin: 0;
        color: var(--ui-text-muted);
        font-size: 12px;
    }

    .selected-summary strong {
        color: var(--ui-text);
    }

    .empty-topic {
        margin: 0;
        color: var(--ui-text-soft);
        font-size: 13px;
    }

    .image-preview {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .preview-item {
        position: relative;
        width: 100px;
        height: 100px;
    }

    .preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--ui-radius-lg);
        border: 1px solid var(--ui-border);
    }

    .preview-item.new img {
        border: 2px solid var(--ui-info);
    }

    .remove-btn {
        position: absolute;
        top: -6px;
        right: -6px;
        background: var(--ui-danger);
        color: var(--ui-text-inverse);
        border: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        z-index: 2;
    }

    .tag {
        position: absolute;
        bottom: 4px;
        left: 4px;
        font-size: 10px;
        background: rgba(0, 0, 0, 0.6);
        color: var(--ui-text-inverse);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid var(--ui-border);
        padding-top: 16px;
    }

    .markdown-section {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 16px;
    }

    .markdown-column {
        border: 1px solid var(--ui-border);
        border-radius: 16px;
        background: var(--ui-surface-raised);
        overflow: hidden;
        min-height: 560px;
        display: flex;
        flex-direction: column;
    }

    .section-header {
        padding: 14px 16px;
        border-bottom: 1px solid var(--ui-border);
        background: var(--ui-bg-soft);
    }

    .section-title {
        margin: 0;
        color: var(--ui-text-strong);
        font-size: 15px;
        font-weight: 600;
    }

    .section-subtitle {
        margin: 4px 0 0;
        color: var(--ui-text-muted);
        font-size: 12px;
    }

    .markdown-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--ui-border);
    }

    .markdown-toolbar button {
        border: 1px solid var(--ui-border-strong);
        background: var(--ui-surface-soft);
        color: var(--ui-text);
        border-radius: var(--ui-radius-sm);
        padding: 6px 10px;
        font-size: 13px;
        cursor: pointer;
        font-family: inherit;
        transition:
            background-color 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
    }

    .markdown-toolbar button:hover:not(:disabled) {
        background: var(--ui-surface-hover);
        color: var(--ui-text-strong);
        border-color: var(--ui-primary-border);
    }

    .markdown-toolbar button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }

    .markdown-hints {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--ui-border);
    }

    .hint-item {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        color: var(--ui-text-muted);
        font-size: 12px;
    }

    .hint-item code {
        color: var(--ui-info);
        background: var(--ui-surface-soft);
        padding: 2px 6px;
        border-radius: 6px;
        white-space: nowrap;
    }

    .markdown-textarea {
        flex: 1;
        width: 100%;
        min-height: 320px;
        resize: vertical;
        border: none;
        outline: none;
        background: var(--ui-surface-raised);
        color: var(--ui-text-strong);
        padding: 16px;
        font-size: 14px;
        line-height: 1.7;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
    }

    .markdown-textarea::placeholder {
        color: var(--ui-text-soft);
    }

    .markdown-preview {
        flex: 1;
        padding: 18px;
        overflow: auto;
        color: var(--ui-text);
        line-height: 1.7;
        word-break: break-word;
    }

    .markdown-preview :global(img) {
        max-width: 100%;
        border-radius: var(--ui-radius-lg);
    }

    .markdown-preview :global(h1),
    .markdown-preview :global(h2),
    .markdown-preview :global(h3) {
        color: var(--ui-text-strong);
        margin: 20px 0 10px;
    }

    .markdown-preview :global(p) {
        margin: 0 0 12px;
    }

    .markdown-preview :global(strong) {
        color: var(--ui-text-strong);
    }

    .markdown-preview :global(a) {
        color: var(--ui-info);
    }

    .markdown-preview :global(blockquote) {
        margin: 12px 0;
        padding: 10px 14px;
        border-left: 4px solid var(--ui-info);
        background: var(--ui-surface-soft);
        color: var(--ui-text);
        border-radius: var(--ui-radius-sm);
    }

    .markdown-preview :global(code) {
        background: var(--ui-surface-soft);
        color: var(--ui-info);
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 13px;
    }

    .markdown-preview :global(pre) {
        background: var(--ui-bg-soft);
        border: 1px solid var(--ui-border);
        padding: 14px;
        border-radius: var(--ui-radius-lg);
        overflow-x: auto;
        max-width: 100%;
    }

    .markdown-preview :global(pre code) {
        background: transparent;
        padding: 0;
    }

    .markdown-preview :global(ul),
    .markdown-preview :global(ol) {
        padding-left: 22px;
    }

    .empty-preview {
        height: 100%;
        min-height: 320px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ui-text-soft);
        border: 1px dashed var(--ui-border-strong);
        border-radius: var(--ui-radius-lg);
    }

    @media (max-width: 900px) {
        .markdown-section {
            grid-template-columns: 1fr;
        }

        .markdown-column {
            min-height: auto;
        }
    }
</style>
