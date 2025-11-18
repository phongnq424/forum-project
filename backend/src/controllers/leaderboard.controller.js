const { LeaderboardService } = require('../services/leaderboard.service');

const LeaderboardController = {
    getByChallenge: async (req, res) => {
        try {
            const leaderboard = await LeaderboardService.getByChallenge(req.params.challenge_id);
            res.json(leaderboard);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = { LeaderboardController };
