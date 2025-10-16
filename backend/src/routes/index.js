const express = require("express")
const router = express.Router()

const authRoutes = require("./auth.route.js")
const userRoutes = require("./user.route.js")

router.use("/auth", authRoutes)
router.use("/users", userRoutes)

module.exports = router
