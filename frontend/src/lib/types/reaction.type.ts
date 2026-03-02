export type ReactionType = "LOVE";

export interface Reaction {
    id: string;
    type: ReactionType;
    user_id: string;
}

export interface ReactionStatsItem {
    type: ReactionType;
    _count: number;
}

export interface ToggleReactionResponse {
    action: "added" | "removed" | "updated";
    reaction: Reaction | null;
    stats: ReactionStatsItem[];
}