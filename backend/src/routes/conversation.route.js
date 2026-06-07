const { Router } = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { chatUpload } = require("../middlewares/chatUpload.middleware");
const validate = require("../middlewares/validate.middleware");
const groupValidation = require("../validations/group.validation");
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

router.post(
    "/group",
    rateLimitMiddleware,
    verifyToken,
    validate(groupValidation.createGroup),
    GroupController.createGroup
);

router.get(
    "/group/me",
    verifyToken,
    validate(groupValidation.listGroups),
    GroupController.listGroups
);

router.get(
    "/group/public",
    verifyToken,
    validate(groupValidation.listPublicGroups),
    GroupController.listPublicGroups
);

router.post(
    "/group/:conversationId/join",
    rateLimitMiddleware,
    verifyToken,
    validate(groupValidation.conversationIdParam),
    GroupController.joinGroup
);

router.get(
    "/group/:conversationId/messages",
    verifyToken,
    validate(groupValidation.conversationIdParam),
    GroupController.getMessages
);

router.post(
    "/group/:conversationId/message",
    rateLimitMiddleware,
    verifyToken,
    validate(groupValidation.sendMessage),
    chatUpload.array("files", 5),
    GroupController.sendMessage
);

router.post(
    "/group/:conversationId/leave",
    rateLimitMiddleware,
    verifyToken,
    validate(groupValidation.conversationIdParam),
    GroupController.leaveGroup
);

router.get(
    "/admin/groups",
    verifyToken,
    requireRole("ADMIN"),
    validate(groupValidation.adminListGroups),
    GroupController.adminListGroups
);

router.post(
    "/admin/groups",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    validate(groupValidation.adminCreateGroup),
    GroupController.adminCreateGroup
);

router.put(
    "/admin/groups/:conversationId",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    validate(groupValidation.adminUpdateGroup),
    GroupController.adminUpdateGroup
);

router.delete(
    "/admin/groups/:conversationId",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    validate(groupValidation.conversationIdParam),
    GroupController.adminDeleteGroup
);

router.get("/attachments/:attachmentId/url", verifyToken, AttachmentController.getSignedUrl);

module.exports = router;