const { Router } = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { CallController } = require("../controllers/call.controller");

const router = Router();

router.post(
    "/",
    rateLimitMiddleware,
    verifyToken,
    CallController.startCall
);

router.get(
    "/",
    verifyToken,
    CallController.listCalls
);

router.get(
    "/:callId",
    verifyToken,
    CallController.getCall
);

router.patch(
    "/:callId/answer",
    rateLimitMiddleware,
    verifyToken,
    CallController.answerCall
);

router.patch(
    "/:callId/reject",
    rateLimitMiddleware,
    verifyToken,
    CallController.rejectCall
);

router.patch(
    "/:callId/cancel",
    rateLimitMiddleware,
    verifyToken,
    CallController.cancelCall
);

router.patch(
    "/:callId/end",
    rateLimitMiddleware,
    verifyToken,
    CallController.endCall
);

router.patch(
    "/:callId/missed",
    rateLimitMiddleware,
    verifyToken,
    CallController.markMissedCall
);

module.exports = router;