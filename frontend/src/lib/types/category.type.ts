export interface Topic {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    is_deleted: boolean; // bắt buộc vì BE trả
    Topic: Topic[];
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CategoryListResponse {
    data: Category[];
    pagination: Pagination;
}

export type DeleteManyResponse = {
    count: number;
};

export interface CategoryDetailResponse {
    data: Category;
}

export interface CategoryCreatePayload {
    name: string;
    description: string;
}

export interface CategoryUpdatePayload {
    name?: string;
    description?: string;
}

export type CategoryCreateManyPayload = CategoryCreatePayload[];