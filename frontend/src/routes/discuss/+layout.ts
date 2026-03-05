// routes/discuss/+layout.ts
import { categoryService } from "$lib/services/category.service";
import { discussState } from "$lib/states/discuss.svelte";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
    if (discussState.isLoaded) {
        return { categories: discussState.categories };
    }
    const res = await categoryService.listCategories({ page: 1, limit: 50 }, fetch);
    return {
        categories: res.data || []
    };
};