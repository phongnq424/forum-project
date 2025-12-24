function postHandler(socket) {
    socket.on('joinPostRoom', (postId) => {
        if (!postId) return;
        if (typeof postId === 'object') return;
        socket.join(`post:${String(postId)}`);
    });

    socket.on('leavePostRoom', (postId) => {
        if (postId) socket.leave(`post:${postId}`);
    });
}

module.exports = postHandler;
