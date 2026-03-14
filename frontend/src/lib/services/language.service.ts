import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type { LanguageCreateManyPayload, LanguageListResponse, LanguageUpdatePayload } from "$lib/types/language.type";

export const languageService = {
    listLanguages(params?: { page?: number; limit?: number }, customFetch?: typeof fetch)
        : Promise<LanguageListResponse> {
        return api.get(ENDPOINTS.LANGUAGES.BASE, { params, fetch: customFetch });
    },

    deleteLanguages(ids: string[])
        : Promise<{ deletedCount: number }> {
        return api.delete(ENDPOINTS.LANGUAGES.BASE, { ids });
    },

    createLanguage(payload: LanguageCreateManyPayload)
        : Promise<{ count: number }> {
        return api.post(ENDPOINTS.LANGUAGES.BASE, payload);
    },

    updateLanguage(id: string, payload: LanguageUpdatePayload)
        : Promise<{ count: number }> {
        return api.put(ENDPOINTS.LANGUAGES.BY_ID(id), payload);
    }
};

