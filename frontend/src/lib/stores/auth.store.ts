import { writable, derived } from 'svelte/store';
import type { AuthState, User } from '$lib/types/auth.type';
import { jwtDecode } from 'jwt-decode';

export const auth = writable<AuthState>({
    accessToken: null,
    user: null,
    isAuthenticated: false
});

export const user = derived(auth, ($auth) => $auth.user);

export function setAuth(accessToken: string) {
    try {
        const decoded: any = jwtDecode(accessToken);
        const user: User = {
            id: decoded.sub || decoded.id || '',
            username: decoded.username || decoded.user_name || '',
            email: decoded.email,
            role: decoded.role
        };

        auth.set({ accessToken, user, isAuthenticated: true });
    } catch (e) {
        console.error('Invalid token decode', e);
        auth.set({ accessToken: null, user: null, isAuthenticated: false });
    }
}

export function clearAuth() {
    auth.set({ accessToken: null, user: null, isAuthenticated: false });
}