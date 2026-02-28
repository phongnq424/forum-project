import { writable, derived } from 'svelte/store';
import type { AuthState, User } from '$lib/types/auth.type';

const getCleanUserForStorage = (user: User | null) => {
    if (!user) return null;
    if (user.avatar?.startsWith('blob:')) {
        return { ...user, avatar: null }; // Xóa blob, giữ lại các info khác
    }
    return user;
};

const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem('auth_user');
        if (!stored) return null;

        const user = JSON.parse(stored);
        // Kiểm tra lần cuối nếu lỡ có blob cũ tồn tại trong máy người dùng
        if (user?.avatar?.startsWith('blob:')) return { ...user, avatar: null };
        return user;
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
    if (!userObj) return;

    if (typeof window !== 'undefined') {
        // Lọc sạch trước khi lưu
        const cleanUser = getCleanUserForStorage(userObj);
        localStorage.setItem('auth_user', JSON.stringify(cleanUser));
    }

    auth.set({
        user: userObj, // Store vẫn có thể giữ blob để hiện preview tạm thời
        isAuthenticated: true
    });
}

export function initAuth(userObj: User | null) {
    if (userObj) {
        if (typeof window !== 'undefined') {
            // Server trả về là URL xịn, lưu đè lên localStorage để xóa sạch blob cũ
            localStorage.setItem('auth_user', JSON.stringify(userObj));
        }
        auth.set({
            user: userObj,
            isAuthenticated: true
        });
    }
}

export function updateUser(partialUser: Partial<User>) {
    auth.update(currentState => {
        if (!currentState.user) return currentState;

        const updatedUser = { ...currentState.user, ...partialUser };

        if (typeof window !== 'undefined') {
            // Lọc sạch trước khi cập nhật localStorage
            const cleanUser = getCleanUserForStorage(updatedUser);
            localStorage.setItem('auth_user', JSON.stringify(cleanUser));
        }
        return {
            ...currentState,
            user: updatedUser
        };
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