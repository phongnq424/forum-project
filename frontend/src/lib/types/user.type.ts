export type UserRole = 'USER' | 'ADMIN' | string;

// Interface cho thông tin cơ bản của User
export interface User {
    id: string;
    username: string;
    email: string;
    role?: UserRole;
    created_at: string;
    fullname?: string | null;
    avatar?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedUserResponse {
    data: User[];
    meta: PaginationMeta;
}