export interface Leaderboard {
    id: string;
    score: number;
    rank: number;
    submitted_at: String;
    language: String;
    updated_at: string;
    user: {
        username: string;
        avatar: string | null;
        fullname: string | null;
    }
}