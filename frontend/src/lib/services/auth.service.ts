import { api } from '$lib/services/api';
import { ENDPOINTS } from '$lib/constants';
import { authState } from '$lib/states/auth.svelte';

export const authService = {
    async login(credentials: any) {
        try {
            const res: any = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);

            if (res.user) {
                authState.setUser(res.user);
            }
            return res;
        } catch (err) {
            throw err;
        }
    },

    async getMe() {
        return await api.get(ENDPOINTS.AUTH.GET_ME);
    },

    // 1. Gửi mã OTP lần đầu
    async sendOtp(email: string) {
        return await api.post(ENDPOINTS.AUTH.SEND_OTP, { email });
    },

    // 2. Gửi lại mã OTP (nếu mã cũ hết hạn)
    async resendOtp(email: string) {
        return await api.post(ENDPOINTS.AUTH.RESEND_OTP, { email });
    },

    // 3. Kiểm tra User/Email tồn tại trước khi cho phép gửi OTP
    async checkExistUser(data: { email?: string; username?: string }) {
        return await api.post(ENDPOINTS.AUTH.CHECK_EXIST, data);
    },

    // 4. Xác thực mã OTP
    async verifyOtp(email: string, otp: string) {
        return await api.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    },

    // 5. Đăng ký chính thức
    async register(data: any) {
        const res: any = await api.post(ENDPOINTS.AUTH.REGISTER, data);
        if (res.user) {
            authState.setUser(res.user);
        }
        return res;
    },

    async logout() {
        try {
            await api.post(ENDPOINTS.AUTH.LOGOUT, {});
        } finally {
            authState.clearAuth();
        }
    }
};