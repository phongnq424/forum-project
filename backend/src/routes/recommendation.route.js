const { Router } = require("express");
const { RecommendationController } = require("../controllers/recommendation.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", verifyToken, RecommendationController.getHome);
router.get("/posts", verifyToken, RecommendationController.getPosts);
router.get("/users", verifyToken, RecommendationController.getUsers);
router.get("/challenges", verifyToken, RecommendationController.getChallenges);
router.get("/groups", verifyToken, RecommendationController.getGroups);
router.get("/learning", verifyToken, RecommendationController.getLearning);
router.get("/topic-profile", verifyToken, RecommendationController.getTopicProfile);

module.exports = router;