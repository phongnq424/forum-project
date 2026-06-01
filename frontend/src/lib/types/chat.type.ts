export type ConversationType = "CHAT" | "GROUP";

export type ConversationScope =
    | "GENERAL"
    | "TOPIC_DISCUSSION"
    | "CHALLENGE_HELP"
    | "STUDY_GROUP"
    | "CLASS_GROUP"
    | "AI_TUTOR";

export type ConversationRole = "OWNER" | "MODERATOR" | "MEMBER";

export interface ChatPeer {
    id: string;
    username?: string;
    fullname?: string;
    avatar?: string | null;
    online?: boolean;
}

export interface LatestMessage {
    id?: string;
    content?: string;
    sent_at?: string;
    sender_id?: string;
}

export interface ConversationApiItem {
    conversationId?: string;
    id?: string;

    type?: ConversationType;
    scope?: ConversationScope;

    name?: string | null;
    avatar?: string | null;

    topic_id?: string | null;
    challenge_id?: string | null;

    peer?: ChatPeer | null;
    latestMsg?: LatestMessage | null;
    unreadCount?: number;
}

export interface ChatConversation {
    id: string;
    type: ConversationType;
    scope: ConversationScope;

    name: string;
    avatar?: string | null;

    peerId?: string;
    topic_id?: string | null;
    challenge_id?: string | null;

    unreadCount: number;
    lastMsg: string;
    online: boolean;
}

export interface ChatMessageApiItem {
    id: string;
    content: string;
    sender_id?: string;
    sent_at: string;

    Sender?: {
        id: string;
        username?: string;
        fullname?: string;
        avatar?: string | null;
    };
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    time: string;
}

export interface CreateChatResponse {
    conversationId?: string;
    id?: string;
}

export interface CreateGroupPayload {
    name: string;
    avatar?: string | null;
    userIds: string[];
    scope?: ConversationScope;
    topic_id?: string | null;
    challenge_id?: string | null;
}