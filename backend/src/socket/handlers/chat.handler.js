const { ConversationService } = require("../../services/conversation/conversation.service");

function chatHandler(socket) {
    socket.on('joinChat', (chatId) => {
        if (!chatId) return;
        if (typeof chatId === 'object') return;
        socket.join(`chat:${String(chatId)}`);
    });

    socket.on('leaveChat', (chatId) => {
        if (chatId) socket.leave(`chat:${chatId}`);
    });
    socket.on('chat:message:send', async (data) => {
        const { conversationId, content } = data;
        const senderId = socket.user.id;
        const socketId = socket.id;

        try {
            await ConversationService.sendMessage(conversationId, senderId, content, {
                socketId // Truyền socketId vào service
            });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });
}

module.exports = chatHandler;
