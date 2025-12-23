let io = null;

function initEmitter(_io) {
    io = _io;
}

function emitToPost(postId, event, payload) {
    if (!io) return;
    io.to(`post:${postId}`).emit(event, payload);
}

function emitToChat(chatId, event, payload) {
    if (!io) return;
    io.to(`chat:${chatId}`).emit(event, payload);
}

function emitToUser(userId, event, payload) {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, payload);
}

module.exports = {
    initEmitter,
    emitToPost,
    emitToChat,
    emitToUser,
};
