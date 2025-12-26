const { Router } = require('express');
const { LeaderboardController } = require('../controllers/leaderboard.controller');
const { cache } = require("../middlewares/cache.middleware");
const router = Router();

router.get('/:challenge_id', cache, LeaderboardController.getByChallenge);

module.exports = router
