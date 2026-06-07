import type {
    ConversationRole,
    ConversationScope,
    ConversationType,
    LatestMessage,
} from "./chat-common.type";

export interface CreateGroupPayload {
    name: string;
    avatar?: string | null;
    userIds: string[];
    scope?: ConversationScope;
    topic_id?: string | null;
    challenge_id?: string | null;
}

export interface SendGroupMessagePayload {
    conversationId: string;
    content?: string;
    files?: File[];
}

export interface GroupTopicInfo {
    id: string;
    name: string;
    slug?: string;
}

export interface GroupChallengeInfo {
    id: string;
    title: string;
    difficulty?: string;
    type?: string;
}

export interface PublicGroupApiItem {
    id?: string;
    conversationId?: string;

    type?: ConversationType;
    scope?: ConversationScope;

    name?: string | null;
    avatar?: string | null;

    topic_id?: string | null;
    challenge_id?: string | null;

    Topic?: GroupTopicInfo | null;
    Challenge?: GroupChallengeInfo | null;

    memberCount?: number;
    joined?: boolean;
    role?: ConversationRole | null;

    latestMsg?: LatestMessage | null;

    created_at?: string;
    updated_at?: string;
}

export interface AdminGroupMember {
    id: string;
    username?: string;
    fullname?: string | null;
    avatar?: string | null;
    role?: ConversationRole;
}

export interface AdminGroupApiItem extends PublicGroupApiItem {
    members?: AdminGroupMember[];
}

export interface AdminCreateGroupPayload {
    name: string;
    avatar?: string | null;
    scope: ConversationScope;
    topic_id?: string | null;
    challenge_id?: string | null;
}

export interface AdminCreateGroupPayload {
    name: string;
    avatar?: string | null;
    scope: ConversationScope;
    topic_id?: string | null;
    challenge_id?: string | null;
}

export interface AdminUpdateGroupPayload {
    name: string;
    avatar?: string | null;
    scope: ConversationScope;
    topic_id?: string | null;
    challenge_id?: string | null;
}

export type AdminCreateGeneralGroupPayload = AdminCreateGroupPayload;

export interface GroupListParams {
    q?: string;
    scope?: ConversationScope;
    topic_id?: string;
    challenge_id?: string;
}