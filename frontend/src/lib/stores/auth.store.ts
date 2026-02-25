import { writable, derived } from 'svelte/store';
import type { AuthState, User } from '$lib/types/auth.type';

// Lấy user từ localStorage nếu có
const getStoredUser = () => {
    if (typeof window === 'undefined') return null; // SSR
    try {
        const stored = localStorage.getItem('auth_user');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const auth = writable<AuthState>({
    user: getStoredUser(),
    isAuthenticated: !!getStoredUser()
});

export const user = derived(auth, ($auth) => $auth.user);


export function setUser(userObj: User | null) {
    if (!userObj) {
        return;
    }

    // Save user to localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(userObj));
    }

    auth.set({
        user: userObj,
        isAuthenticated: true
    });
}

export function clearAuth() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
    }
    auth.set({
        user: null,
        isAuthenticated: false
    });
}

export function initAuth(userObj: User | null) {
    if (userObj) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_user', JSON.stringify(userObj));
        }
        auth.set({
            user: userObj,
            isAuthenticated: true
        });
    }
}

/**
 * Update partial user info (ví dụ: chỉ update avatar, fullname)
 */
export function updateUser(partialUser: Partial<User>) {
    auth.update(currentState => {

        if (!currentState.user) return currentState;

        const updatedUser = { ...currentState.user, ...partialUser };

        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }
        return {
            ...currentState,
            user: updatedUser
        };
    });
}