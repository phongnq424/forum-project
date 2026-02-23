export interface User {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    role?: 'user' | 'moderator' | 'admin';
}

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
}