const { Router } = require('express');
const { LeaderboardController } = require('../controllers/leaderboard.controller');

const router = Router();

router.get('/:challenge_id', LeaderboardController.getByChallenge);

module.exports = router
