// socket/auth.js
const { checkToken } = require('../middlewares/auth.middleware');

module.exports = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        const decoded = await checkToken(token);

        if (!decoded) {
            return next(new Error('UNAUTHORIZED'));
        }

        socket.user = decoded;
        next();
    } catch (err) {
        if (err.message === 'BLACKLISTED') {
            return next(new Error('TOKEN_BLACKLISTED'));
        }
        console.error(err);
        next(new Error('INTERNAL_ERROR'));
    }
};
