<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import { categoryService } from "$lib/services/category.service";
    import type {
        Category,
        CategoryUpdatePayload,
    } from "$lib/types/category.type";

    let {
        open = $bindable(false),
        isEdit = false,
        category = {},
        onSave,
    }: {
        open: boolean;
        isEdit: boolean;
        category: Partial<Category>;
        onSave: () => Promise<void>;
    } = $props();

    let modalError = $state("");
    let modalLoading = $state(false);

    function closeModal() {
        open = false;
        modalError = "";
        modalLoading = false;
    }

    async function handleSave() {
        const name = category.name?.trim();
        const description = category.description?.trim() ?? "";

        if (!name) {
            modalError = "Category name is required";
            return;
        }

        modalLoading = true;
        modalError = "";

        try {
            if (isEdit && category.id) {
                await categoryService.updateCategory(category.id, {
                    name,
                    description,
                } as CategoryUpdatePayload);
            } else {
                await categoryService.createCategory([
                    {
                        name,
                        description,
                    },
                ]);
            }

            open = false;
            await onSave();
        } catch (e) {
            modalError = e instanceof Error ? e.message : String(e);
        } finally {
            modalLoading = false;
        }
    }
</script>

<Modal
    bind:open
    title={isEdit ? "Edit Category" : "Create Category"}
    maxWidth="560px"
>
    <div class="adm-modal-content">
        {#if modalError}
            <div class="adm-alert-error">
                {modalError}
            </div>
        {/if}

        <div class="adm-form-group">
            <label class="adm-label" for="category-name">
                Category Name *
            </label>

            <Input
                id="category-name"
                bind:value={category.name}
                placeholder="Enter category name"
            />
        </div>

        <div class="adm-form-group">
            <label class="adm-label" for="category-description">
                Description
            </label>

            <textarea
                class="adm-textarea"
                id="category-description"
                bind:value={category.description}
                placeholder="Enter category description"
                rows="4"
            ></textarea>
        </div>
    </div>

    {#snippet footer()}
        <div class="adm-modal-footer">
            <Button
                variant="secondary"
                disabled={modalLoading}
                onclick={closeModal}
            >
                Cancel
            </Button>

            <Button
                variant="primary"
                disabled={modalLoading}
                onclick={handleSave}
            >
                {modalLoading
                    ? isEdit
                        ? "Updating..."
                        : "Creating..."
                    : isEdit
                      ? "Update"
                      : "Create"}
            </Button>
        </div>
    {/snippet}
</Modal>

<style>
    textarea {
        width: 100%;
        min-height: 110px;
        box-sizing: border-box;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        padding: 12px 14px;
        background: #14161c;
        color: #e5e7eb;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        outline: none;
    }

    textarea:focus {
        border-color: #8b5cf6;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }
</style>
