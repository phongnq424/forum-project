<script lang="ts">
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    // 👇 Import các UI components ông đã tạo
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import FileInput from "$lib/components/ui/FileInput.svelte";
    import ErrorMessage from "$lib/components/ui/ErrorMessage.svelte";

    import { postService } from "$lib/services/post.service";
    import type { PostCreatePayload } from "$lib/types/post.type";

    type SimpleTopic = { id: string; name: string };

    let {
        open = $bindable(false),
        topics = [],
        onSuccess,
    } = $props<{
        open: boolean;
        topics: SimpleTopic[];
        onSuccess?: () => void;
    }>();

    let title = $state("");
    let content = $state("");
    let topicId = $state("");
    let files = $state<File[]>([]);
    let previewUrls = $derived(
        files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        })),
    );
    let loading = $state(false);
    let errorMessage = $state(""); // State chứa lỗi để truyền vào ErrorMessage

    let topicOptions = $derived([
        { value: "", label: "Select a topic" },
        ...topics.map((t: SimpleTopic) => ({ value: t.id, label: t.name })),
    ]);
    async function handleSubmit(e: Event) {
        e.preventDefault();
        errorMessage = "";

        if (!title.trim() || !content.trim() || !topicId) {
            errorMessage = "Please fill in all required fields.";
            return;
        }

        loading = true;

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("topic_id", topicId);

            if (files.length > 0) {
                files.forEach((file) => {
                    formData.append("images", file);
                });
            }

            await postService.createPost(formData as any);

            title = "";
            content = "";
            topicId = "";
            files = [];
            errorMessage = "";
            open = false;

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create post:", error);
            errorMessage =
                error?.response?.data?.message ||
                "Something went wrong. Please try again.";
        } finally {
            loading = false;
        }
    }
    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const newFiles = Array.from(input.files);

        files = [...files, ...newFiles];

        input.value = "";
    }
    function removeImage(fileToRemove: File) {
        files = files.filter((file) => file !== fileToRemove);
    }
</script>

<Modal bind:open title="Create New Post" maxWidth="600px">
    <form class="create-post-form" onsubmit={handleSubmit}>
        <ErrorMessage error={errorMessage} />

        <Input
            label="Title"
            bind:value={title}
            placeholder="What do you want to ask or share?"
            required
            disabled={loading}
        />

        <Select
            label="Topic"
            name="topic"
            bind:value={topicId}
            options={topicOptions}
            disabled={loading}
        />

        <div class="form-group">
            <label class="textarea-label" for="content">Content</label>
            <textarea
                id="content"
                class="custom-textarea"
                bind:value={content}
                rows="6"
                placeholder="Write the details here..."
                required
                disabled={loading}
            ></textarea>
        </div>

        <FileInput
            label="Attach Images (Optional)"
            accept="image/*"
            multiple
            disabled={loading}
            onchange={handleFileChange}
        />
        {#if previewUrls.length > 0}
            <div class="image-preview">
                {#each previewUrls as img}
                    <div class="preview-item">
                        <button
                            type="button"
                            class="remove-btn"
                            onclick={() => removeImage(img.file)}
                        >
                            ✕
                        </button>
                        <img src={img.url} alt="preview" />
                    </div>
                {/each}
            </div>
        {/if}

        <div class="form-actions">
            <Button
                variant="ghost"
                onclick={() => (open = false)}
                disabled={loading}
                type="button"
            >
                Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Posting..." : "Post"}
            </Button>
        </div>
    </form>
</Modal>

<style>
    .create-post-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 10px 0;
    }

    /* Style tạm cho textarea cho đồng bộ, ông nên tách nó ra thành component Textarea luôn nhé */
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
    }

    .textarea-label {
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 500;
    }

    .custom-textarea {
        width: 100%;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid #2a2e36;
        background: #14161c;
        color: #e5e7eb;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: 0.2s ease;
        resize: vertical;
        min-height: 120px;
    }

    .custom-textarea::placeholder {
        color: #6b7280;
    }

    .custom-textarea:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 10px;
        padding-top: 16px;
        border-top: 1px solid #2a2e36;
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
        border-radius: 12px;
        border: 1px solid #2a2e36;
    }

    .remove-btn {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #ef4444;
        color: white;
        border: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
    }
</style>
