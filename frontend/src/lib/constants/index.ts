export const ENDPOINTS = {
    AI: {
        CHAT: 'ai/chat',
        HISTORY: 'ai/history'
    },
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
    USERS: {
        BASE: 'users',
        ME: 'users/me',
        CHANGE_PASSWORD: 'users/me/password',
        BY_ID: (id: string) => `users/${id}`,
        ADMIN_USERS: "/users/admin/users",
        ADMIN_BY_ID: (id: string) => `/users/admin/users/${id}`
    },
    POSTS: {
        BASE: 'posts',
        BY_ID: (id: string) => `posts/${id}`,
        BY_USER: (userId: string) => `posts/user/${userId}`,
        SEARCH: 'posts/search',
        SAVED: 'post-saved'
    },
    CATEGORIES: {
        BASE: 'categories',
        BY_ID: (id: string) => `categories/${id}`,
    },
    INTERESTED_TOPICS: {
        BASE: "/interested-topics",
        ME: "/interested-topics/me",
        BY_TOPIC_ID: (topicId: string) => `/interested-topics/${topicId}`,
    },
    TOPICS: {
        BASE: 'topics',
        BY_ID: (id: string) => `topics/${id}`,
    },
    LANGUAGES: {
        BASE: 'languages',
        BY_ID: (id: string) => `languages/${id}`,
    },
    REACTIONS: {
        TOGGLE: "/reactions/toggle",
        BY_POST: (postId: string) => `/reactions/post/${postId}`,
        IS_REACTED: (postId: string) => `/reactions/is-reacted/${postId}`,
        BY_USER: (userId: string) => `/reactions/user/${userId}`
    },
    COMMENTS: {
        BASE: 'comments',
        BY_POST: (postId: string) => `comments/post/${postId}`,
        BY_COMMENT: (commentId: string) => `comments/${commentId}`,
    },
    CONVERSATIONS: {
        BASE: 'conversations',

        CHAT: {
            BASE: 'conversations/chat',
            ME: 'conversations/chat/me',
            MESSAGES: 'conversations/chat/messages',
            BY_ID: (conversationId: string) =>
                `conversations/chat/${conversationId}/messages`
        },

        GROUP: {
            BASE: 'conversations/group',
            ME: 'conversations/group/me',
            BY_ID: (conversationId: string) =>
                `conversations/group/${conversationId}/messages`,
            MESSAGE: (conversationId: string) =>
                `conversations/group/${conversationId}/message`,
            LEAVE: (conversationId: string) =>
                `conversations/group/${conversationId}/leave`,
            JOIN: (conversationId: string) =>
                `conversations/group/${conversationId}/join`,
            PUBLIC: 'conversations/group/public',
        },
        ADMIN_GROUPS: {
            BASE: "conversations/admin/groups",
        },
    },
    CHALLENGE: {
        BASE: 'challenges',
        BY_ID: (id: string) => `challenges/${id}`,

    },
    SUBMISSIONS: {
        BASE: "/submissions",
        BY_ID: (id: string) => `/submissions/${id}`,
        BY_CHALLENGE: (id: string) => `/submissions/challenge/${id}`,
        BY_USER: (id: string) => `/submissions/user/${id}`,
        BY_USER_AND_CHALLENGE: (userId: string, challengeId: string) =>
            `/submissions/user/${userId}/challenge/${challengeId}`,
        INSIGHT: (id: string) => `/submissions/${id}/insight`,
        RECOMMENDATIONS: (id: string) => `/submissions/${id}/recommendations`,
    },
    LEADERBOARD: {
        BY_CHALLENGE: (id: string) => `/leaderboards/${id}`,
    },
    REPORTS: {
        BASE: "reports",
        BY_ID: (id: string) => `reports/${id}`
    },
    FOLLOWERS: {
        TOGGLE: "/followers/toggle",
        REMOVE: "/followers/remove",
        FOLLOWERS_BY_USER: (userId: string) => `/followers/followers/${userId}`,
        FOLLOWING_BY_USER: (userId: string) => `/followers/following/${userId}`,
    },
    RECOMMENDATIONS: {
        BASE: "/recommendations",
        POSTS: "/recommendations/posts",
        USERS: "/recommendations/users",
        CHALLENGES: "/recommendations/challenges",
        GROUPS: "/recommendations/groups",
        LEARNING: "/recommendations/learning",
        TOPIC_PROFILE: "/recommendations/topic-profile",
    },
};