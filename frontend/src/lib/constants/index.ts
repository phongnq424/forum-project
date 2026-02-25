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
    },
};