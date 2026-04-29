// routes/discuss/+layout.ts
import { categoryService } from "$lib/services/category.service";
import { discussState } from "$lib/states/discuss.svelte";
import type { Category } from "$lib/types/category.type";
import type { LayoutLoad } from "./$types";

type CategoryListResult = {
    data?: Category[];
    pagination?: {
        total?: number;
    };
};

export const load: LayoutLoad = async ({ fetch }) => {
    if (discussState.isLoaded) {
        return {
            categories: discussState.categories,
            error: null,
        };
    }

    try {
        const res = await Promise.race<CategoryListResult>([
            categoryService.listCategories({ page: 1, limit: 50 }, fetch),
            new Promise<CategoryListResult>((_, reject) => {
                setTimeout(
                    () => reject(new Error("Category loading timeout")),
                    5000,
                );
            }),
        ]);

        return {
            categories: res.data ?? [],
            error: null,
        };
    } catch (error) {
        console.warn("Failed to load categories:", error);

        return {
            categories: [],
            error: "Failed to load categories. Please refresh.",
        };
    }
};