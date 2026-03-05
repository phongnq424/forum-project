import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type { CategoryCreateManyPayload, CategoryListResponse, CategoryUpdatePayload } from "$lib/types/category.type";

export const categoryService = {
    listCategories(params?: { page?: number; limit?: number }, customFetch?: typeof fetch)
        : Promise<CategoryListResponse> {
        return api.get(ENDPOINTS.CATEGORIES.BASE, { params, fetch: customFetch });
    },

    deleteCategories(ids: string[])
        : Promise<{ deletedCount: number }> {
        return api.delete(ENDPOINTS.CATEGORIES.BASE, { ids });
    },

    createCategory(payload: CategoryCreateManyPayload)
        : Promise<{ count: number }> {
        return api.post(ENDPOINTS.CATEGORIES.BASE, payload);
    },

    updateCategory(id: string, payload: CategoryUpdatePayload)
        : Promise<{ count: number }> {
        return api.put(ENDPOINTS.CATEGORIES.BY_ID(id), payload);
    }
};

