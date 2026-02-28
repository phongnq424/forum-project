<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let {
        searchQuery = $bindable(),
        sortBy = $bindable(),
        activeCategory = $bindable(),
        categories,
        sortOptions,
        onCreatePost,
    } = $props();
</script>

<header class="discuss-header">
    <div class="search-bar-wrapper">
        <div class="search-input">
            <Input
                placeholder="Search posts, topics..."
                bind:value={searchQuery}
            >
                {#snippet icon()}
                    <Icon name="search" size={18} />
                {/snippet}
            </Input>
        </div>
        <div class="sort-filter">
            <Select
                label="Sort By:"
                inline={true}
                options={sortOptions}
                bind:value={sortBy}
                style="width: 200px;"
            />
        </div>
    </div>

    <div class="category-nav">
        <div class="chips-scroll">
            {#each categories as cat}
                <button
                    class="chip {activeCategory === cat ? 'active' : ''}"
                    onclick={() => (activeCategory = cat)}
                >
                    {cat}
                </button>
            {/each}
        </div>
        <Button variant="primary" onclick={onCreatePost}>
            <Icon name="pencil" size={16} class="mr-6" />
            Create Post
        </Button>
    </div>
</header>

<style>
    .discuss-header {
        margin-bottom: 30px;
    }
    .search-bar-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 20px;
    }
    .search-input {
        flex: 1;
        position: relative;
    }
    .sort-filter {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #9ca3af;
    }
    .category-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }
    .chips-scroll {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        scrollbar-width: none;
    }
    .chip {
        padding: 8px 18px;
        background: #1e222b;
        border: 1px solid #2a2e36;
        border-radius: 20px;
        font-size: 14px;
        font-family: poppins;
        white-space: nowrap;
        cursor: pointer;
        color: #9ca3af;
    }
    .chip.active {
        background: #6366f1;
        color: white;
        border-color: #6366f1;
    }
</style>
