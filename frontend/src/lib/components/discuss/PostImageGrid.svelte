<script lang="ts">
    import Icon from "$lib/components/ui/Icon.svelte";
    let { images = [] } = $props<{ images: { url: string }[] }>();

    let showAllImages = $state(false);

    let displayedImages = $derived(showAllImages ? images : images.slice(0, 3));

    let hasMoreImages = $derived(images.length > 3 && !showAllImages);
</script>

{#if images.length > 0}
    <div
        class="image-grid {showAllImages
            ? 'grid-expanded'
            : 'grid-' + displayedImages.length}"
    >
        {#each displayedImages as img, i}
            <div class="image-item">
                <img src={img.url} alt="Post content" loading="lazy" />

                {#if i === 2 && hasMoreImages}
                    <button
                        class="overlay-more"
                        onclick={() => (showAllImages = true)}
                    >
                        <Icon name="plus" size={28} color="#fff" />
                        <span>{images.length - 3} more</span>
                    </button>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    /* Bê nguyên phần CSS image-grid của bạn sang đây */
    .image-grid {
        width: 100%;
        display: grid;
        gap: 2px;
        margin-bottom: 32px;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #374151;
        background: #374151;
    }
    .image-item {
        position: relative;
        width: 100%;
        height: 100%;
    }
    .image-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .grid-1 .image-item img {
        max-height: 350px;
        height: auto;
    }
    .grid-2 {
        grid-template-columns: 1fr 1fr;
        aspect-ratio: 16/9;
    }
    .grid-3 {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        aspect-ratio: 16/9;
    }
    .grid-3 .image-item:first-child {
        grid-row: span 2;
    }

    .grid-expanded {
        grid-template-columns: 1fr;
        gap: 16px;
        background: transparent;
        border: none;
    }
    .grid-expanded .image-item {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #374151;
    }

    .overlay-more {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        border: none;
        cursor: pointer;
        backdrop-filter: blur(4px);
        font-size: 18px;
        font-weight: 600;
        gap: 8px;
    }
    .overlay-more:hover {
        background: rgba(0, 0, 0, 0.7);
    }
</style>
