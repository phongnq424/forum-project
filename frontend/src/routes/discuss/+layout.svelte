<script lang="ts">
    import { discussState } from "$lib/states/discuss.svelte";
    let { data, children } = $props();

    $effect.pre(() => {
        if (data.categories && discussState.categories.length === 0) {
            discussState.setCategories(data.categories);
        }
    });
</script>

{@render children()}
