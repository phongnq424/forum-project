import type { Pagination } from "./common.type";

export interface TopicCategory {
    id: string;
    name: string;
}

export interface TopicTreeItem {
    id: string;
    name: string;
    slug?: string;
    parent_id?: string | null;
}

export interface Topic {
    id: string;
    name: string;
    slug?: string;
    category_id: string;
    parent_id?: string | null;
    description?: string | null;
    is_deleted?: boolean;

    Category?: TopicCategory;
    Parent?: TopicTreeItem | null;
    Children?: TopicTreeItem[];

    children?: Topic[];
    level?: number;
}

export interface TopicListResponse {
    data: Topic[];
    pagination: Pagination;
}

export interface TopicListParams {
    page?: number;
    limit?: number;
    category_id?: string;
    parent_id?: string;
    q?: string;
    sortBy?: string;
}

export interface TopicDetailResponse {
    data: Topic;
}

export interface TopicCreatePayload {
    name: string;
    category_id: string;
    description?: string;
    parent_id?: string | null;
    slug?: string;
}

export type TopicCreateManyPayload = TopicCreatePayload[];

export interface TopicUpdatePayload {
    name?: string;
    category_id?: string;
    description?: string;
    parent_id?: string | null;
    slug?: string;
}

export interface DeleteManyResponse {
    deletedCount?: number;
    count?: number;
}