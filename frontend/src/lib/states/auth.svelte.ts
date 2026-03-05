import type { AuthState, User } from '$lib/types/auth.type';

// --- Các hàm Helper giữ nguyên logic ---
const getCleanUserForStorage = (user: User | null) => {
    if (!user) return null;
    if (user.avatar?.startsWith('blob:')) {
        return { ...user, avatar: null };
    }
    return user;
};

const getStoredUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem('auth_user');
        if (!stored) return null;
        const user = JSON.parse(stored);
        if (user?.avatar?.startsWith('blob:')) return { ...user, avatar: null };
        return user;
    } catch {
        return null;
    }
};

// --- Chuyển đổi sang Global State ---
class AuthStore {
    // Khai báo state
    #user = $state<User | null>(getStoredUser());
    #isAuthenticated = $state<boolean>(!!getStoredUser());

    // Getter để bên ngoài truy cập (giống như derived store)
    get user() { return this.#user; }
    get isAuthenticated() { return this.#isAuthenticated; }

    // Action: Set User (giống setUser cũ)
    setUser(userObj: User | null) {
        if (!userObj) return;

        if (typeof window !== 'undefined') {
            const cleanUser = getCleanUserForStorage(userObj);
            localStorage.setItem('auth_user', JSON.stringify(cleanUser));
        }

        this.#user = userObj;
        this.#isAuthenticated = true;
    }

    // Action: Init (giống initAuth cũ)
    initAuth(userObj: User | null) {
        if (userObj) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_user', JSON.stringify(userObj));
            }
            this.#user = userObj;
            this.#isAuthenticated = true;
        }
    }

    // Action: Update (Thay thế cho auth.update cực gọn)
    updateUser(partialUser: Partial<User>) {
        if (!this.#user) return;

        // Cập nhật trực tiếp vào object
        const updatedUser = { ...this.#user, ...partialUser };
        this.#user = updatedUser;

        if (typeof window !== 'undefined') {
            const cleanUser = getCleanUserForStorage(updatedUser);
            localStorage.setItem('auth_user', JSON.stringify(cleanUser));
        }
    }

    // Action: Logout (giống clearAuth cũ)
    clearAuth() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_user');
        }
        this.#user = null;
        this.#isAuthenticated = false;
    }
}

export const authState = new AuthStore();