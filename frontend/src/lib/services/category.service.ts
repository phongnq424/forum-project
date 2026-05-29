import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    CategoryCreateManyPayload,
    CategoryListResponse,
    CategoryUpdatePayload,
    DeleteManyResponse,
} from "$lib/types/category.type";

export const categoryService = {
    listCategories(
        params?: { page?: number; limit?: number; q?: string },
        customFetch?: typeof fetch,
    ): Promise<CategoryListResponse> {
        return api.get(ENDPOINTS.CATEGORIES.BASE, {
            params,
            fetch: customFetch,
        });
    },

    deleteCategories(ids: string[]): Promise<DeleteManyResponse> {
        return api.delete(ENDPOINTS.CATEGORIES.BASE, { ids });
    },

    createCategory(
        payload: CategoryCreateManyPayload,
    ): Promise<{ count: number }> {
        return api.post(ENDPOINTS.CATEGORIES.BASE, payload);
    },

    updateCategory(
        id: string,
        payload: CategoryUpdatePayload,
    ): Promise<unknown> {
        return api.put(ENDPOINTS.CATEGORIES.BY_ID(id), payload);
    },

    deleteCategory(id: string): Promise<DeleteManyResponse> {
        return api.delete(ENDPOINTS.CATEGORIES.BASE, { ids: [id] });
    },
};