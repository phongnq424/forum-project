const { Server } = require("socket.io");
const auth = require("./auth");
const postHandler = require("./handlers/post.handler");
const chatHandler = require("./handlers/chat.handler");
const { initEmitter } = require("./emitter");

function initSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*" },
    });

    initEmitter(io);

    io.use(auth);

    io.on("connection", (socket) => {
        const userId = socket.user.id;

        socket.join(`user:${userId}`);

        postHandler(socket);
        chatHandler(socket);

        console.log("🔌 connected", userId, socket.id);
    });
}

module.exports = { initSocket };
