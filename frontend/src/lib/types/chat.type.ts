import type {
    ChatPeer,
    ConversationScope,
    ConversationType,
    LatestMessage
} from "./chat-common.type";

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

export interface CreateChatResponse {
    conversationId?: string;
    id?: string;
}

export interface SendDirectMessagePayload {
    toUserId: string;
    content?: string;
    files?: File[];
}