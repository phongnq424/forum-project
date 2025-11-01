const express = require("express")
const router = express.Router()

const authRoutes = require("./auth.route.js")
const userRoutes = require("./user.route.js")
const profileRoutes = require("./profile.route.js")
const postRoutes = require("./post.route.js")
const categoryRoutes = require("./category.route.js")
const interestedTopicRoutes = require("./interestedTopic.route.js")
const TopicRoutes = require("./topic.route.js")

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/profiles", profileRoutes)
router.use("/posts", postRoutes)
router.use("/categories", categoryRoutes)
router.use("/interested-topics", interestedTopicRoutes)
router.use("/topics", TopicRoutes)

module.exports = router
