<script lang="ts">
    import { tick } from "svelte";

    let {
        children,
        class: className = "",
        scrollToBottom = false,
        watch = [],
        pushToBottom = false,
        onScrollTop = () => {},
    } = $props<{
        children: any;
        class?: string;
        scrollToBottom?: boolean;
        watch?: any[];
        pushToBottom?: boolean;
        onScrollTop?: () => void;
    }>();

    let scrollContainer = $state<HTMLDivElement | null>(null);
    let isFirstLoad = $state(true);

    $effect(() => {
        const length = watch?.length ?? 0;

        if (scrollToBottom && scrollContainer && length > 0) {
            tick().then(() => {
                if (!scrollContainer) return;

                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: isFirstLoad ? "instant" : "smooth",
                });

                isFirstLoad = false;
            });
        }
    });

    $effect(() => {
        if (watch?.length === 0) {
            isFirstLoad = true;
        }
    });

    function handleScroll(e: Event) {
        const target = e.target as HTMLDivElement;
        if (target.scrollTop === 0) onScrollTop();
    }
</script>

<div
    bind:this={scrollContainer}
    class="scroll-area {className}"
    onscroll={handleScroll}
>
    <div class="scroll-content {pushToBottom ? 'push-bottom' : ''}">
        {@render children()}
    </div>
</div>

<style>
    .scroll-area {
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        min-height: 0;
    }

    .scroll-content {
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .scroll-content.push-bottom {
        margin-top: auto;
        min-height: min-content;
    }

    .scroll-area::-webkit-scrollbar {
        width: 6px;
    }

    .scroll-area::-webkit-scrollbar-track {
        background: transparent;
    }

    .scroll-area::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 999px;
    }

    .scroll-area:hover::-webkit-scrollbar-thumb {
        background: var(--ui-border);
    }

    .scroll-area:hover::-webkit-scrollbar-thumb:hover {
        background: var(--ui-border-strong);
    }
</style>
