const { Router } = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { chatUpload } = require("../middlewares/chatUpload.middleware");
const { ChatController } = require("../controllers/chat.controller");
const { GroupController } = require("../controllers/group.controller");
const { AttachmentController } = require("../controllers/attachment.controller");

const router = Router();

router.post("/chat", rateLimitMiddleware, verifyToken, ChatController.createChat);
router.get("/chat/me", verifyToken, ChatController.listChats);
router.get("/chat/:conversationId/messages", verifyToken, ChatController.getMessages);
router.post(
    "/chat/messages",
    rateLimitMiddleware,
    verifyToken,
    chatUpload.array("files", 5),
    ChatController.sendMessage
);

router.post("/group", rateLimitMiddleware, verifyToken, GroupController.createGroup);
router.get("/group/me", verifyToken, GroupController.listGroups);
router.get("/group/:conversationId/messages", verifyToken, GroupController.getMessages);
router.post(
    "/group/:conversationId/message",
    rateLimitMiddleware,
    verifyToken,
    chatUpload.array("files", 5),
    GroupController.sendMessage
);
router.post("/group/:conversationId/leave", rateLimitMiddleware, verifyToken, GroupController.leaveGroup);

router.get("/attachments/:attachmentId/url", verifyToken, AttachmentController.getSignedUrl);

module.exports = router;