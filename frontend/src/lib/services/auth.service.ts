import { api } from '$lib/services/api';
import { ENDPOINTS } from '$lib/constants';
import { setAuth, clearAuth } from '$lib/stores/auth.store';

export const authService = {
    async login(credentials: any) {
        const res: any = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
        if (res.accessToken) setAuth(res.accessToken);
        return res;
    },

    // 1. Gửi mã OTP lần đầu
    async sendOtp(email: string) {
        return await api.post(ENDPOINTS.AUTH.SEND_OTP, { email });
    },

    // 2. Gửi lại mã OTP (nếu mã cũ hết hạn)
    async resendOtp(email: string) {
        return await api.post(ENDPOINTS.AUTH.RESEND_OTP, { email });
    },

    // 3. Kiểm tra User/Email tồn tại trước khi cho phép gửi OTP (Để UX xịn hơn)
    async checkExistUser(data: { email?: string; username?: string }) {
        return await api.post(ENDPOINTS.AUTH.CHECK_EXIST, data);
    },

    // 4. Xác thực mã OTP để lấy "thẻ thông hành" trong Redis
    async verifyOtp(email: string, otp: string) {
        return await api.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    },

    // 5. Đăng ký chính thức (Backend sẽ check thẻ thông hành 'verified:email')
    async register(data: any) {
        const res: any = await api.post(ENDPOINTS.AUTH.REGISTER, data);
        // Vì Backend của ông sau khi register xong sẽ trả về luôn token (Auto-login)
        if (res.accessToken) setAuth(res.accessToken);
        return res;
    },

    async logout() {
        try {
            // Nhớ truyền refreshToken nếu Backend yêu cầu để revoke trong DB
            await api.post(ENDPOINTS.AUTH.LOGOUT, {});
        } finally {
            clearAuth();
        }
    }
};