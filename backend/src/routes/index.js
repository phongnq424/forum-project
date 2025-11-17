const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.route.js");
const userRoutes = require("./user.route.js");
const profileRoutes = require("./profile.route.js");
const postRoutes = require("./post.route.js");
const categoryRoutes = require("./category.route.js");
const interestedTopicRoutes = require("./interestedTopic.route.js");
const TopicRoutes = require("./topic.route.js");
const CommentRoutes = require("./comment.route.js");
const ReactionRoutes = require("./reaction.route.js");
const FollowerRoutes = require("./follower.route.js");
const PostSavedRoutes = require("./postSaved.route.js");
const CommentRateRoutes = require("./commentRate.route.js");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/profiles", profileRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/interested-topics", interestedTopicRoutes);
router.use("/topics", TopicRoutes);
router.use("/comments", CommentRoutes);
router.use("/reactions", ReactionRoutes);
router.use("/followers", FollowerRoutes);
router.use("/post-saved", PostSavedRoutes);
router.use("/comment-rating", CommentRateRoutes);

module.exports = router;
