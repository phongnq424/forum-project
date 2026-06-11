const { Server } = require("socket.io");
const auth = require("./auth");
const postHandler = require("./handlers/post.handler");
const chatHandler = require("./handlers/chat.handler");
const callHandler = require("./handlers/call.handler");
const { initEmitter } = require("./emitter");
const { emitToUser } = require("./emitter");
const RedisOnlineService = require("../services/redisOnline.service");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function emitToUserFriends(userId, event, payload) {
    const friends = await prisma.conversationUser.findMany({
        where: {
            Conversation: {
                type: "CHAT",
                ConversationUser: {
                    some: { user_id: userId }
                }
            },
            user_id: { not: userId }
        },
        select: { user_id: true }
    });

    friends.forEach((f) => {
        emitToUser(f.user_id, event, payload);
    });
}

function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    initEmitter(io);

    io.use(auth);

    io.on("connection", (socket) => {
        const userId = socket.user.id;

        RedisOnlineService.setOnline(userId, socket.id);
        socket.join(`user:${userId}`);

        console.log("Emit của:", userId);

        emitToUserFriends(userId, "user:online", { userId });

        postHandler(socket);
        chatHandler(socket);
        callHandler(socket);

        socket.on("online:ping", async () => {
            await RedisOnlineService.refresh(userId);
        });

        console.log("🔌 connected", userId, socket.id);

        socket.on("disconnect", async () => {
            await RedisOnlineService.setOffline(userId);
            emitToUserFriends(userId, "user:offline", { userId });
        });
    });
}

module.exports = { initSocket };