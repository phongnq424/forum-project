function chatHandler(socket) {
    socket.on('joinChat', (chatId) => {
        if (!chatId) return;
        if (typeof chatId === 'object') return;
        socket.join(`chat:${String(chatId)}`);
    });

    socket.on('leaveChat', (chatId) => {
        if (chatId) socket.leave(`chat:${chatId}`);
    });
}

module.exports = chatHandler;
