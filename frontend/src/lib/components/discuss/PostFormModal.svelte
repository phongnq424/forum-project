<script lang="ts">
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import FileInput from "$lib/components/ui/FileInput.svelte";
    import ErrorMessage from "$lib/components/ui/ErrorMessage.svelte";
    import TextArea from "$lib/components/ui/TextArea.svelte";
    import { untrack } from "svelte";

    import { postService } from "$lib/services/post.service";
    import type { Post } from "$lib/types/post.type";

    interface PostImage {
        id: string;
        url: string;
    }

    type SimpleTopic = { id: string; name: string };

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

    const isEdit = $derived(!!post);

    let title = $state("");
    let content = $state("");
    let topicId = $state("");
    let existingImages = $state<PostImage[]>([]);
    let imagesToDelete = $state<string[]>([]);

    // DUY NHẤT 1 MẢNG NÀY ĐỂ QUẢN LÝ ẢNH MỚI (Cả hiển thị lẫn submit)
    let newImages = $state<{ file: File; url: string }[]>([]);

    let loading = $state(false);
    let errorMessage = $state("");

    let topicOptions = $derived([
        { value: "", label: "Select a topic" },
        ...topics.map((t: SimpleTopic) => ({
            value: t.id,
            label: t.name,
        })),
    ]);

    // Hàm khởi tạo dữ liệu
    function initFormData() {
        if (post) {
            title = post.title;
            content = post.content;
            topicId = post.topic_id || "";
            existingImages = post.Image ? [...post.Image] : [];
        } else {
            title = "";
            content = "";
            topicId = "";
            existingImages = [];
        }
        imagesToDelete = [];
        // Dọn dẹp URL cũ tránh rò rỉ bộ nhớ
        newImages.forEach((img) => URL.revokeObjectURL(img.url));
        newImages = [];
    }

    // Effect 1: Gọi hàm khởi tạo khi mở Modal hoặc đổi Post (Dùng untrack để không bị vòng lặp)
    $effect(() => {
        if (open || post) {
            untrack(() => initFormData());
        }
    });

    // Effect 2: Dọn dẹp bộ nhớ URL khi Component bị hủy
    $effect(() => {
        return () => newImages.forEach((img) => URL.revokeObjectURL(img.url));
    });

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

            // Gắn ảnh từ mảng newImages vào formData
            newImages.forEach((img) => {
                formData.append("images", img.file);
            });

            let result;

            if (isEdit) {
                formData.append(
                    "delete_images",
                    JSON.stringify(imagesToDelete),
                );
                result = await postService.updatePost(
                    post!.id,
                    formData as any,
                );
            } else {
                result = await postService.createPost(formData as any);
            }

            open = false;
            if (onSuccess) onSuccess(result);
        } catch (error: any) {
            errorMessage =
                error?.response?.data?.message || "Something went wrong.";
        } finally {
            loading = false;
        }
    }

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const incomingFiles = Array.from(input.files);

        // Tạo object chứa cả file và url, đẩy thẳng vào newImages
        const addedImages = incomingFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        newImages = [...newImages, ...addedImages];
        input.value = ""; // Reset input
    }

    function removeExistingImage(imgId: string) {
        existingImages = existingImages.filter((img) => img.id !== imgId);
        imagesToDelete = [...imagesToDelete, imgId];
    }

    function removeNewImage(url: string) {
        // Tìm và revoke URL, sau đó xóa khỏi mảng
        const imgToRemove = newImages.find((img) => img.url === url);
        if (imgToRemove) URL.revokeObjectURL(imgToRemove.url);

        newImages = newImages.filter((img) => img.url !== url);
    }
</script>

<Modal bind:open title={isEdit ? "Edit Post" : "Create Post"} maxWidth="600px">
    <form class="post-form" onsubmit={handleSubmit}>
        <ErrorMessage error={errorMessage} />

        <Input label="Title" bind:value={title} required disabled={loading} />

        <Select
            label="Topic"
            bind:value={topicId}
            options={topicOptions}
            disabled={loading}
        />

        <TextArea
            label="Content"
            bind:value={content}
            rows="6"
            required
            disabled={loading}
        />

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

    .preview-item.new img {
        border: 2px solid #3b82f6;
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
        z-index: 2;
    }

    .tag {
        position: absolute;
        bottom: 4px;
        left: 4px;
        font-size: 10px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
    }

    .label {
        font-size: 14px;
        color: #9ca3af;
        margin-bottom: 8px;
        display: block;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-top: 1px solid #2a2e36;
        padding-top: 16px;
    }
</style>
