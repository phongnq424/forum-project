import { api } from "./api";
import { ENDPOINTS } from "$lib/constants";
import { cacheService } from "./cache.service";
import type {
    AdminUserListParams,
    AdminUserListResponse,
    AdminUserUpdatePayload
} from "$lib/types/admin-user.type";

export const adminUserService = {
    async listUsers(
        params?: AdminUserListParams,
        customFetch?: typeof fetch
    ): Promise<AdminUserListResponse> {
        const cacheKey = `admin_users_${JSON.stringify(params ?? {})}`;
        const cached = cacheService.get<AdminUserListResponse>(cacheKey);
        if (cached) return cached;

        const data = await api.get<AdminUserListResponse>(
            ENDPOINTS.USERS.ADMIN_USERS,
            { params, fetch: customFetch }
        );

        cacheService.set(cacheKey, data, 60);
        return data;
    },

    async updateUser(
        id: string,
        payload: AdminUserUpdatePayload
    ): Promise<{ count: number }> {
        const result = await api.put<{ count: number }>(
            ENDPOINTS.USERS.ADMIN_BY_ID(id),
            payload
        );

        cacheService.clear();
        return result;
    },

    async deleteUser(id: string): Promise<{ count: number }> {
        const result = await api.delete<{ count: number }>(
            ENDPOINTS.USERS.ADMIN_BY_ID(id)
        );

        cacheService.clear();
        return result;
    }
};