// socket/auth.js
const { checkToken } = require('../middlewares/auth.middleware');
const { AuthService } = require("../services/auth/auth.service");
const cookie = require('cookie');

module.exports = async (socket, next) => {
    try {
        const cookieString = socket.handshake.headers.cookie;
        if (!cookieString) return next(new Error('UNAUTHORIZED'));

        const cookies = cookie.parse(cookieString);
        const token = cookies.access_token;
        const refreshToken = cookies.refresh_token;

        try {
            const decoded = await checkToken(token);

            if (!decoded || !decoded.id) {
                throw new Error('INVALID_TOKEN');
            }
            socket.user = decoded;
            return next();
        } catch (err) {
            // Bước 2: Nếu Access Token chết, nhưng có Refresh Token
            if (refreshToken) {
                console.log("🟡 [Socket Auth] Access Token expired, attempting refresh...");

                try {

                    const newTokens = await AuthService.refresh(refreshToken, socket.request);
                    const newDecoded = await checkToken(newTokens.accessToken);
                    socket.user = newDecoded;
                    socket.emit('auth_status', {
                        status: 'TOKEN_REFRESHED',
                        message: 'Please update your local cookies'
                    });

                    return next();
                } catch (refreshErr) {
                    console.error("🔴 [Socket Auth] Refresh failed:", refreshErr.message);
                    return next(new Error('UNAUTHORIZED'));
                }
            }

            // Nếu không có Refresh Token hoặc lỗi khác
            throw err;
        }
    } catch (err) {
        if (err.message === 'BLACKLISTED') return next(new Error('TOKEN_BLACKLISTED'));
        console.error("🔴 [Socket Auth] Final Error:", err.message);
        next(new Error('UNAUTHORIZED'));
    }
};