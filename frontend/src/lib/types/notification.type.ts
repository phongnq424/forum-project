export type NotificationItem = {
    id: string;
    user_id: string;
    type?: string | null;
    title?: string | null;
    message?: string | null;
    content?: string | null;
    link?: string | null;
    url?: string | null;
    is_read: boolean;
    created_at: string;
    updated_at?: string;
};

export type NotificationListResponse = {
    data: NotificationItem[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type UnreadCountResponse = {
    unreadCount: number;
};

export type NotificationActionResponse = {
    count: number;
};