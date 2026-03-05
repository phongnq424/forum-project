import { api } from '$lib/services/api';
import { ENDPOINTS } from '$lib/constants';
import { authState } from '$lib/states/auth.svelte';
// Nhớ tạo thêm file type cho User giống như bên Post nhé, ví dụ:
import type { User, PaginatedUserResponse } from '$lib/types/user.type';

export const userService = {

    async changePassword(passwordData: { oldPassword: string; newPassword: string }) {
        return api.put(ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
    },

    async listUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
    }, customFetch?: typeof fetch): Promise<PaginatedUserResponse> {
        return api.get<PaginatedUserResponse>(ENDPOINTS.USERS.BASE, { params, fetch: customFetch });
    }
};