export const ENDPOINTS = {
    AUTH: {
        LOGIN: 'auth/login',
        REGISTER: 'auth/register',
        REFRESH: 'auth/refresh',
        SEND_OTP: 'auth/send-otp',
        RESEND_OTP: 'auth/resend-otp',
        CHECK_EXIST: 'auth/check-exist',
        LOGOUT: 'auth/logout',
        VERIFY_OTP: 'auth/verify-otp',
        GET_ME: 'auth/me'
    },
    PROFILE: {
        ME: 'profiles/me',
        BY_ID: (id: string) => `profiles/${id}`,
        SEARCH: 'profiles/search/all'
    },
    POSTS: {
        BASE: 'posts',
        BY_ID: (id: string) => `posts/${id}`,
        BY_USER: (userId: string) => `posts/user/${userId}`,
        SEARCH: 'posts/search',
    },
    CATEGORIES: {
        BASE: 'categories',
        BY_ID: (id: string) => `categories/${id}`,
    },
    TOPICS: {
        BASE: 'topics',
        BY_ID: (id: string) => `topics/${id}`,
    },
    REACTIONS: {
        TOGGLE: "/reactions/toggle",
        BY_POST: (postId: string) => `/reactions/post/${postId}`,
        IS_REACTED: (postId: string) => `/reactions/is-reacted/${postId}`,
        BY_USER: (userId: string) => `/reactions/user/${userId}`
    }
};