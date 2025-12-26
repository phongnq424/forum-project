const { Router } = require("express");
const { TopicController } = require("../controllers/topic.controller");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { cache } = require("../middlewares/cache.middleware");
const router = Router();

router.post("/", rateLimitMiddleware, TopicController.createMany);
router.get("/", cache, TopicController.list);
router.get("/:id", cache, TopicController.getById);
router.put("/:id", rateLimitMiddleware, TopicController.update);
router.delete("/:id", TopicController.delete);

module.exports = router;
