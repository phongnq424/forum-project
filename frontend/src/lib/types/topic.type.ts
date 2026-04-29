import type { Pagination } from "./common.type";

export interface TopicCategory {
    id: string;
    name: string;
}

export interface Topic {
    id: string;
    name: string;
    category_id: string;
    description: string;
    is_deleted: boolean;
    Category: TopicCategory;
}

export interface TopicListResponse {
    data: Topic[];
    pagination: Pagination;
}

export interface TopicListParams {
    page?: number;
    limit?: number;
    category_id?: string;
    q?: string;
    sortBy?: string;
}


export interface TopicDetailResponse {
    data: Topic;
}

export interface TopicCreatePayload {
    name: string;
    category_id: string;
    description: string;
}

export type TopicCreateManyPayload = TopicCreatePayload[];

export interface TopicUpdatePayload {
    name?: string;
    category_id?: string;
    description?: string;
}

export interface DeleteManyResponse {
    deletedCount: number;
}