import type { Pagination } from "./common.type";

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}

export interface AdminUserListParams {
    page?: number;
    limit?: number;
    q?: string;
    status?: UserStatus;
    role?: UserRole;
    sortBy?: string;
}

export interface AdminUserListResponse {
    data: AdminUser[];
    pagination: Pagination;
}

export interface AdminUserUpdatePayload {
    username?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
}