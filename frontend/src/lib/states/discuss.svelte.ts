// $lib/states/discuss.svelte.ts
import { categoryService } from "$lib/services/category.service";
import type { Category } from "$lib/types/category.type";

// Khai báo state global
let rawCategories = $state<Category[]>([]);
let isLoaded = $state(false);
let loading = $state(false);

export const discussState = {
    get categories() { return rawCategories; },
    get isLoaded() { return isLoaded; },
    get isLoading() { return loading; },

    get categoryNames() {
        return ["For You", ...rawCategories.map(c => c.name)];
    },

    get filterGroups() {
        return rawCategories
            .map(c => ({
                name: c.name,
                topics: c.Topic?.map((t: any) => typeof t === "string" ? t : t.name) || []
            }))
            .filter(group => group.topics.length > 0);
    },

    get availableTopics() {
        return rawCategories.flatMap(cat => cat.Topic || []);
    },

    async init() {
        if (isLoaded || loading) return;

        loading = true;
        try {
            const res = await categoryService.listCategories({ page: 1, limit: 50 }, fetch);
            if (res.data) {
                rawCategories = res.data;
                isLoaded = true;
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            loading = false;
        }
    },
    async setCategories(data: Category[]) {
        rawCategories = data;
        isLoaded = true;
    },
};