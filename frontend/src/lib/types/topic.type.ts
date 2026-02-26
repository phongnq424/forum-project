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

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface TopicListResponse {
    data: Topic[];
    pagination: Pagination;
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