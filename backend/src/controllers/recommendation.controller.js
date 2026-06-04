const { RecommendationService } = require("../services/recommendation.service");
const { buildBlockContext } = require("../contexts/block.context");

const RecommendationController = {
    getHome: async (req, res) => {
        try {
            const userId = req.user.id;
            const blockContext = await buildBlockContext(userId);

            const result = await RecommendationService.getHomeRecommendations(
                userId,
                req.query,
                { blockContext }
            );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getPosts: async (req, res) => {
        try {
            const userId = req.user.id;
            const blockContext = await buildBlockContext(userId);

            const result = await RecommendationService.getRecommendedPosts(
                userId,
                req.query,
                { blockContext }
            );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getUsers: async (req, res) => {
        try {
            const userId = req.user.id;
            const blockContext = await buildBlockContext(userId);

            const result = await RecommendationService.getRecommendedUsers(
                userId,
                req.query,
                { blockContext }
            );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getChallenges: async (req, res) => {
        try {
            const userId = req.user.id;

            const result = await RecommendationService.getRecommendedChallenges(
                userId,
                req.query
            );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getGroups: async (req, res) => {
        try {
            const userId = req.user.id;

            const result = await RecommendationService.getRecommendedGroups(
                userId,
                req.query
            );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getLearning: async (req, res) => {
        try {
            const userId = req.user.id;

            const result =
                await RecommendationService.getLearningRecommendations(
                    userId,
                    req.query
                );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getTopicProfile: async (req, res) => {
        try {
            const userId = req.user.id;

            const result =
                await RecommendationService.buildUserTopicProfile(userId);

            return res.status(200).json({
                topicIds: result.topicIds,
                weightedTopics: result.weightedTopics,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
};

module.exports = { RecommendationController };