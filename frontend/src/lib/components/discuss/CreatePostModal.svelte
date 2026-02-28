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
    let files = $state<FileList | undefined>();
    let loading = $state(false);
    let errorMessage = $state(""); // State chứa lỗi để truyền vào ErrorMessage

    let topicOptions = $derived([
        { value: "", label: "Select a topic" },
        ...topics.map((t: SimpleTopic) => ({ value: t.id, label: t.name })),
    ]);

    async function handleSubmit(e: Event) {
        e.preventDefault();
        errorMessage = ""; // Reset lỗi

        if (!title.trim() || !content.trim() || !topicId) {
            errorMessage = "Please fill in all required fields.";
            return;
        }

        loading = true;
        try {
            const payload: PostCreatePayload = {
                title: title,
                content: content,
                topic_id: topicId,
                images: files,
            };

            const formData = new FormData();
            formData.append("title", payload.title);
            formData.append("content", payload.content);
            formData.append("topic_id", payload.topic_id);

            if (payload.images && payload.images.length > 0) {
                Array.from(payload.images).forEach((file) => {
                    formData.append("images", file);
                });
            }

            await postService.createPost(formData as any);

            // Reset form
            title = "";
            content = "";
            topicId = "";
            files = undefined;
            errorMessage = "";
            open = false;

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Failed to create post:", error);
            // Bắt lỗi từ API hiển thị ra ErrorMessage
            errorMessage =
                error?.response?.data?.message ||
                "Something went wrong. Please try again.";
        } finally {
            loading = false;
        }
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
            bind:files
            disabled={loading}
        />

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
</style>
