import type { Pagination } from "./common.type";

export interface CategoryTopic {
    id: string;
    name: string;
    slug?: string;
    category_id?: string;
    parent_id?: string | null;
}

export interface Category {
    id: string;
    name: string;
    description?: string | null;
    is_deleted?: boolean;
    created_at?: string;
    Topic?: CategoryTopic[];
}

export interface CategoryListResponse {
    data: Category[];
    pagination: Pagination;
}

export type DeleteManyResponse = {
    deletedCount?: number;
    count?: number;
};

export interface CategoryDetailResponse {
    data: Category;
}

export interface CategoryCreatePayload {
    name: string;
    description?: string;
}

export interface CategoryUpdatePayload {
    name?: string;
    description?: string;
}

export type CategoryCreateManyPayload = CategoryCreatePayload[];