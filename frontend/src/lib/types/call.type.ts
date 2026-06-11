export type CallType = "AUDIO" | "VIDEO";

export type CallStatus =
    | "RINGING"
    | "ONGOING"
    | "ENDED"
    | "MISSED"
    | "REJECTED"
    | "CANCELED"
    | "FAILED";

export interface CallUser {
    id: string;
    username?: string | null;
    fullname?: string | null;
    avatar?: string | null;
}

export interface CallApiItem {
    id: string;
    conversation_id: string;
    caller_id: string;
    receiver_id?: string | null;

    type: CallType;
    status: CallStatus;

    started_at: string;
    answered_at?: string | null;
    ended_at?: string | null;
    ended_by_id?: string | null;

    caller?: CallUser | null;
    receiver?: CallUser | null;
    endedBy?: CallUser | null;
}

export interface StartCallPayload {
    conversationId: string;
    type: CallType;
}

export interface CallFinishResponse {
    call: CallApiItem;
    message?: any;
}