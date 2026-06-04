const { PrismaClient } = require("@prisma/client");
const { PostService } = require("./post.service");

const prisma = new PrismaClient();

const USER_SELECT = {
    id: true,
    username: true,
    fullname: true,
    avatar: true,
    role: true,
};

const TOPIC_SELECT = {
    id: true,
    name: true,
    slug: true,
};

const IMAGE_SELECT = {
    id: true,
    url: true,
};

const POST_INCLUDE = {
    User: {
        select: USER_SELECT,
    },
    topic: {
        select: TOPIC_SELECT,
    },
    PostTopics: {
        include: {
            Topic: {
                select: TOPIC_SELECT,
            },
        },
    },
    Image: {
        select: IMAGE_SELECT,
        take: 1,
    },
};

const CHALLENGE_SELECT = {
    id: true,
    title: true,
    description: true,
    difficulty: true,
    type: true,
    point: true,
    created_at: true,
    challengeTopics: {
        include: {
            Topic: {
                select: TOPIC_SELECT,
            },
        },
    },
};

const GROUP_SELECT = {
    id: true,
    name: true,
    avatar: true,
    scope: true,
    type: true,
    topic_id: true,
    challenge_id: true,
    created_at: true,
    Topic: {
        select: TOPIC_SELECT,
    },
    Challenge: {
        select: {
            id: true,
            title: true,
            difficulty: true,
            type: true,
        },
    },
};

function toInt(value, fallback) {
    const n = parseInt(value);
    if (Number.isNaN(n) || n <= 0) return fallback;
    return n;
}

function uniqueById(items) {
    const map = new Map();

    items.forEach((item) => {
        if (item?.id) {
            map.set(item.id, item);
        }
    });

    return Array.from(map.values());
}

function addScore(map, topicId, score, source) {
    if (!topicId) return;

    const current = map.get(topicId) || {
        topicId,
        score: 0,
        sources: new Set(),
    };

    current.score += score;
    current.sources.add(source);

    map.set(topicId, current);
}

function getPostTopicIds(post) {
    const ids = [];

    if (post.topicId) ids.push(post.topicId);

    if (Array.isArray(post.PostTopics)) {
        post.PostTopics.forEach((item) => {
            if (item.topic_id) ids.push(item.topic_id);
            if (item.Topic?.id) ids.push(item.Topic.id);
        });
    }

    if (post.topic?.id) ids.push(post.topic.id);

    return [...new Set(ids.filter(Boolean))];
}

function getPostTopics(post) {
    const topics = [];

    if (post.topic) topics.push(post.topic);

    if (Array.isArray(post.PostTopics)) {
        post.PostTopics.forEach((item) => {
            if (item.Topic) topics.push(item.Topic);
        });
    }

    const map = new Map();

    topics.forEach((topic) => {
        if (topic?.id) map.set(topic.id, topic);
    });

    return Array.from(map.values());
}

function buildTopicReason(topicNames, fallback) {
    if (!topicNames.length) return fallback;

    if (topicNames.length === 1) {
        return 'Suggested because the content is related to the topic ' + topicNames[0] + '.';
    }

    return `Suggested because the content is related to the topics ${topicNames
        .slice(0, 3)
        .join(", ")}.`;
}

function getTopicWeight(topicWeights, topicId) {
    return topicWeights.get(topicId)?.score || 0;
}

function sortByScoreDesc(a, b) {
    if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
    }

    const aDate = new Date(a.created_at || 0).getTime();
    const bDate = new Date(b.created_at || 0).getTime();

    return bDate - aDate;
}

const RecommendationService = {
    buildUserTopicProfile: async (userId) => {
        const topicMap = new Map();

        const [
            interestedTopics,
            masteryRows,
            savedRows,
            reactionRows,
            submissionRows,
        ] = await Promise.all([
            prisma.interestedTopic.findMany({
                where: { user_id: userId },
                include: {
                    Topic: {
                        select: TOPIC_SELECT,
                    },
                },
            }),

            prisma.userTopicMastery.findMany({
                where: { user_id: userId },
                include: {
                    Topic: {
                        select: TOPIC_SELECT,
                    },
                },
            }),

            prisma.postSaved.findMany({
                where: { user_id: userId },
                take: 50,
                orderBy: { saved_at: "desc" },
                include: {
                    Post: {
                        include: {
                            topic: { select: TOPIC_SELECT },
                            PostTopics: {
                                include: {
                                    Topic: { select: TOPIC_SELECT },
                                },
                            },
                        },
                    },
                },
            }),

            prisma.reaction.findMany({
                where: { user_id: userId },
                take: 50,
                orderBy: { created_at: "desc" },
                include: {
                    Post: {
                        include: {
                            topic: { select: TOPIC_SELECT },
                            PostTopics: {
                                include: {
                                    Topic: { select: TOPIC_SELECT },
                                },
                            },
                        },
                    },
                },
            }),

            prisma.submission.findMany({
                where: { user_id: userId },
                take: 30,
                orderBy: { submitted_at: "desc" },
                include: {
                    Challenge: {
                        include: {
                            challengeTopics: {
                                include: {
                                    Topic: {
                                        select: TOPIC_SELECT,
                                    },
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        interestedTopics.forEach((item) => {
            addScore(topicMap, item.topic_id, 5, "INTERESTED_TOPIC");
        });

        masteryRows.forEach((item) => {
            const weakness = Number(item.weakness_score || 0);
            const mastery = Number(item.mastery_score || 0);

            addScore(
                topicMap,
                item.topic_id,
                weakness * 6 + Math.max(0, 1 - mastery) * 2,
                "TOPIC_MASTERY"
            );
        });

        savedRows.forEach((item) => {
            const topicIds = getPostTopicIds(item.Post || {});
            topicIds.forEach((topicId) => {
                addScore(topicMap, topicId, 3, "SAVED_POST");
            });
        });

        reactionRows.forEach((item) => {
            const topicIds = getPostTopicIds(item.Post || {});
            topicIds.forEach((topicId) => {
                addScore(topicMap, topicId, 2, "POST_REACTION");
            });
        });

        submissionRows.forEach((submission) => {
            const isAccepted = submission.status === "ACCEPTED";
            const score = isAccepted ? 1 : 3;

            const challengeTopics = submission.Challenge?.challengeTopics || [];

            challengeTopics.forEach((item) => {
                addScore(
                    topicMap,
                    item.topic_id,
                    score,
                    isAccepted ? "SOLVED_CHALLENGE" : "FAILED_CHALLENGE"
                );
            });
        });

        const topicIds = Array.from(topicMap.keys());

        if (topicIds.length === 0) {
            const fallbackTopics = await prisma.topic.findMany({
                where: {
                    is_deleted: false,
                },
                take: 10,
                orderBy: {
                    name: "asc",
                },
                select: TOPIC_SELECT,
            });

            fallbackTopics.forEach((topic) => {
                addScore(topicMap, topic.id, 1, "FALLBACK_POPULAR_TOPIC");
            });
        }

        const topicRows = await prisma.topic.findMany({
            where: {
                id: {
                    in: Array.from(topicMap.keys()),
                },
            },
            select: TOPIC_SELECT,
        });

        const topicInfoMap = new Map(topicRows.map((topic) => [topic.id, topic]));

        const weightedTopics = Array.from(topicMap.values())
            .map((item) => ({
                topicId: item.topicId,
                score: item.score,
                sources: Array.from(item.sources),
                topic: topicInfoMap.get(item.topicId) || null,
            }))
            .sort((a, b) => b.score - a.score);

        return {
            topicIds: weightedTopics.map((item) => item.topicId),
            topicWeights: new Map(
                weightedTopics.map((item) => [item.topicId, item])
            ),
            weightedTopics,
        };
    },

    getRecommendedPosts: async (userId, query = {}, { blockContext } = {}) => {
        const limit = toInt(query.limit, 10);
        const page = toInt(query.page, 1);
        const skip = (page - 1) * limit;

        const { topicIds, topicWeights } =
            await RecommendationService.buildUserTopicProfile(userId);

        let baseWhere = {
            is_deleted: false,
            user_id: {
                not: userId,
            },
            moderation_status: {
                not: "REJECTED",
            },
        };

        if (blockContext) {
            baseWhere = PostService._applyBlockLogic(baseWhere, blockContext);
        }

        const topicWhere = {
            ...baseWhere,
        };

        if (topicIds.length > 0) {
            topicWhere.AND = [
                ...(topicWhere.AND || []),
                {
                    OR: [
                        {
                            topicId: {
                                in: topicIds,
                            },
                        },
                        {
                            PostTopics: {
                                some: {
                                    topic_id: {
                                        in: topicIds,
                                    },
                                },
                            },
                        },
                    ],
                },
            ];
        }

        const candidateTake = Math.max(limit * 4, 30);

        const topicMatchedPosts = await prisma.post.findMany({
            where: topicWhere,
            skip: 0,
            take: candidateTake,
            orderBy: {
                created_at: "desc",
            },
            include: POST_INCLUDE,
        });

        let fallbackPosts = [];

        if (topicMatchedPosts.length < candidateTake) {
            const matchedIds = topicMatchedPosts.map((post) => post.id);

            fallbackPosts = await prisma.post.findMany({
                where: {
                    ...baseWhere,
                    id: {
                        notIn: matchedIds,
                    },
                },
                skip: 0,
                take: candidateTake - topicMatchedPosts.length,
                orderBy: {
                    created_at: "desc",
                },
                include: POST_INCLUDE,
            });
        }

        const allCandidates = uniqueById([
            ...topicMatchedPosts.map((post) => ({
                ...post,
                __recommendationMatched: true,
            })),
            ...fallbackPosts.map((post) => ({
                ...post,
                __recommendationMatched: false,
            })),
        ]);

        const total = allCandidates.length;

        const enriched = await PostService._enrichPosts(allCandidates, userId);

        const scored = enriched
            .map((post) => {
                const topicIdsOfPost = getPostTopicIds(post);

                const topicScore = topicIdsOfPost.reduce(
                    (sum, topicId) => sum + getTopicWeight(topicWeights, topicId),
                    0
                );

                const engagementScore =
                    (post.reactionCount || 0) * 0.3 +
                    (post.commentCount || 0) * 0.5;

                const recencyScore = post.created_at
                    ? Math.max(
                        0,
                        3 -
                        (Date.now() - new Date(post.created_at).getTime()) /
                        (1000 * 60 * 60 * 24 * 7)
                    )
                    : 0;

                const topics = post.topics || [];
                const isMatched = Boolean(post.__recommendationMatched);

                const reason = isMatched
                    ? buildTopicReason(
                        topics.map((topic) => topic.name).filter(Boolean),
                        "Gợi ý vì bài viết phù hợp với lịch sử quan tâm của bạn."
                    )
                    : "Suggested as a fallback because there are not enough posts matching your current topic profile.";

                return {
                    ...post,
                    __recommendationMatched: undefined,
                    recommendationScore: topicScore + engagementScore + recencyScore,
                    recommendationReason: reason,
                    recommendationSources: topicIdsOfPost
                        .map((topicId) => topicWeights.get(topicId)?.sources || [])
                        .flat(),
                    recommendationMatched: isMatched,
                };
            })
            .sort(sortByScoreDesc)
            .slice(skip, skip + limit);

        return {
            data: scored,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            meta: {
                topicProfile: Array.from(topicWeights.values()),
                matchedCount: topicMatchedPosts.length,
                fallbackCount: fallbackPosts.length,
            },
        };
    },

    getRecommendedChallenges: async (userId, query = {}) => {
        const limit = toInt(query.limit, 10);
        const page = toInt(query.page, 1);
        const skip = (page - 1) * limit;

        const { topicIds, topicWeights } =
            await RecommendationService.buildUserTopicProfile(userId);

        const acceptedRows = await prisma.submission.findMany({
            where: {
                user_id: userId,
                status: "ACCEPTED",
            },
            select: {
                challenge_id: true,
            },
        });

        const acceptedChallengeIds = acceptedRows
            .map((item) => item.challenge_id)
            .filter(Boolean);

        const baseWhere = {
            id: {
                notIn: acceptedChallengeIds,
            },
        };

        if (query.type) {
            baseWhere.type = query.type;
        }

        if (query.difficulty) {
            baseWhere.difficulty = query.difficulty;
        }

        const topicWhere = {
            ...baseWhere,
        };

        if (topicIds.length > 0) {
            topicWhere.challengeTopics = {
                some: {
                    topic_id: {
                        in: topicIds,
                    },
                },
            };
        }

        const candidateTake = Math.max(limit * 4, 30);

        const topicMatchedChallenges = await prisma.challenge.findMany({
            where: topicWhere,
            take: candidateTake,
            orderBy: {
                created_at: "desc",
            },
            select: CHALLENGE_SELECT,
        });

        let fallbackChallenges = [];

        if (topicMatchedChallenges.length < candidateTake) {
            const matchedIds = topicMatchedChallenges.map((challenge) => challenge.id);

            fallbackChallenges = await prisma.challenge.findMany({
                where: {
                    ...baseWhere,
                    id: {
                        notIn: [
                            ...acceptedChallengeIds,
                            ...matchedIds,
                        ],
                    },
                },
                take: candidateTake - topicMatchedChallenges.length,
                orderBy: {
                    created_at: "desc",
                },
                select: CHALLENGE_SELECT,
            });
        }

        const allCandidates = uniqueById([
            ...topicMatchedChallenges.map((challenge) => ({
                ...challenge,
                __recommendationMatched: true,
            })),
            ...fallbackChallenges.map((challenge) => ({
                ...challenge,
                __recommendationMatched: false,
            })),
        ]);

        const scored = allCandidates
            .map((challenge) => {
                const challengeTopicIds = challenge.challengeTopics.map(
                    (item) => item.topic_id
                );

                const topicScore = challengeTopicIds.reduce(
                    (sum, topicId) => sum + getTopicWeight(topicWeights, topicId),
                    0
                );

                const topicNames = challenge.challengeTopics
                    .map((item) => item.Topic?.name)
                    .filter(Boolean);

                const isMatched = Boolean(challenge.__recommendationMatched);

                return {
                    ...challenge,
                    __recommendationMatched: undefined,
                    recommendationScore: topicScore,
                    recommendationReason: isMatched
                        ? buildTopicReason(
                            topicNames,
                            "Suggested because this challenge is relevant to the topics you are interested in."
                        )
                        : "Suggested as a fallback because there are not enough challenges matching your current topic profile.",
                    recommendationSources: challengeTopicIds
                        .map((topicId) => topicWeights.get(topicId)?.sources || [])
                        .flat(),
                    recommendationMatched: isMatched,
                };
            })
            .sort(sortByScoreDesc);

        const paged = scored.slice(skip, skip + limit);

        return {
            data: paged,
            pagination: {
                total: scored.length,
                page,
                limit,
                totalPages: Math.ceil(scored.length / limit),
            },
            meta: {
                topicProfile: Array.from(topicWeights.values()),
                matchedCount: topicMatchedChallenges.length,
                fallbackCount: fallbackChallenges.length,
                acceptedExcludedCount: acceptedChallengeIds.length,
            },
        };
    },

    getRecommendedGroups: async (userId, query = {}) => {
        const limit = toInt(query.limit, 10);
        const page = toInt(query.page, 1);
        const skip = (page - 1) * limit;

        const { topicIds, topicWeights } =
            await RecommendationService.buildUserTopicProfile(userId);

        const memberRows = await prisma.conversationUser.findMany({
            where: {
                user_id: userId,
                left_at: null,
            },
            select: {
                conversation_id: true,
            },
        });

        const joinedConversationIds = memberRows.map(
            (item) => item.conversation_id
        );

        let where = {
            type: "GROUP",
            id: {
                notIn: joinedConversationIds,
            },
        };

        if (topicIds.length > 0) {
            where.OR = [
                {
                    topic_id: {
                        in: topicIds,
                    },
                },
            ];
        }

        if (query.scope) {
            where.scope = query.scope;
        }

        const candidateTake = Math.max(limit * 4, 30);

        const [groups, total] = await Promise.all([
            prisma.conversation.findMany({
                where,
                take: candidateTake,
                orderBy: {
                    created_at: "desc",
                },
                select: {
                    ...GROUP_SELECT,
                    _count: {
                        select: {
                            ConversationUser: true,
                        },
                    },
                },
            }),
            prisma.conversation.count({ where }),
        ]);

        const scored = groups
            .map((group) => {
                const topicScore = group.topic_id
                    ? getTopicWeight(topicWeights, group.topic_id)
                    : 0;

                return {
                    ...group,
                    memberCount: group._count?.ConversationUser || 0,
                    _count: undefined,
                    recommendationScore: topicScore,
                    recommendationReason: group.Topic?.name
                        ? `Gợi ý vì nhóm này liên quan đến topic ${group.Topic.name}.`
                        : "Gợi ý vì nhóm này phù hợp với hoạt động học tập của bạn.",
                    recommendationSources: group.topic_id
                        ? topicWeights.get(group.topic_id)?.sources || []
                        : [],
                };
            })
            .sort(sortByScoreDesc)
            .slice(skip, skip + limit);

        return {
            data: scored,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            meta: {
                topicProfile: Array.from(topicWeights.values()),
            },
        };
    },

    getRecommendedUsers: async (userId, query = {}, { blockContext } = {}) => {
        const limit = toInt(query.limit, 10);
        const page = toInt(query.page, 1);
        const skip = (page - 1) * limit;

        const { topicIds, topicWeights } =
            await RecommendationService.buildUserTopicProfile(userId);

        const followingRows = await prisma.follower.findMany({
            where: {
                follow_id: userId,
            },
            select: {
                followed_id: true,
            },
        });

        const alreadyFollowingIds = followingRows.map((item) => item.followed_id);
        const blockedIds = blockContext?.blockedUserIds || [];

        let userWhere = {
            id: {
                notIn: [userId, ...alreadyFollowingIds, ...blockedIds],
            },
        };

        if (query.q) {
            userWhere.OR = [
                {
                    username: {
                        contains: query.q,
                        mode: "insensitive",
                    },
                },
                {
                    fullname: {
                        contains: query.q,
                        mode: "insensitive",
                    },
                },
            ];
        }

        const candidateUsers = await prisma.user.findMany({
            where: userWhere,
            take: Math.max(limit * 5, 50),
            select: {
                ...USER_SELECT,
                Profile: {
                    select: {
                        bio: true,
                        location: true,
                    },
                },
                Post: {
                    where: {
                        is_deleted: false,
                        moderation_status: {
                            not: "REJECTED",
                        },
                        OR: topicIds.length
                            ? [
                                {
                                    topicId: {
                                        in: topicIds,
                                    },
                                },
                                {
                                    PostTopics: {
                                        some: {
                                            topic_id: {
                                                in: topicIds,
                                            },
                                        },
                                    },
                                },
                            ]
                            : undefined,
                    },
                    take: 5,
                    include: {
                        topic: {
                            select: TOPIC_SELECT,
                        },
                        PostTopics: {
                            include: {
                                Topic: {
                                    select: TOPIC_SELECT,
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        Post: true,
                        FollowerFollowed: true,
                    },
                },
            },
        });

        const scored = candidateUsers
            .map((user) => {
                const matchedTopicIds = new Set();

                user.Post.forEach((post) => {
                    getPostTopicIds(post).forEach((topicId) => {
                        matchedTopicIds.add(topicId);
                    });
                });

                const topicScore = Array.from(matchedTopicIds).reduce(
                    (sum, topicId) => sum + getTopicWeight(topicWeights, topicId),
                    0
                );

                const activityScore = (user.Post?.length || 0) * 0.8;
                const followerScore = Math.min(user._count?.FollowerFollowed || 0, 20) * 0.1;

                const matchedTopicNames = [];

                user.Post.forEach((post) => {
                    getPostTopics(post).forEach((topic) => {
                        if (
                            matchedTopicIds.has(topic.id) &&
                            !matchedTopicNames.includes(topic.name)
                        ) {
                            matchedTopicNames.push(topic.name);
                        }
                    });
                });

                return {
                    id: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    avatar: user.avatar,
                    role: user.role,
                    Profile: user.Profile,
                    postCount: user._count?.Post || 0,
                    followerCount: user._count?.FollowerFollowed || 0,
                    recommendationScore:
                        topicScore + activityScore + followerScore,
                    recommendationReason: buildTopicReason(
                        matchedTopicNames,
                        "This user is recommended because their activities align with the topics you are interested in."
                    ),
                    recommendationSources: Array.from(matchedTopicIds)
                        .map((topicId) => topicWeights.get(topicId)?.sources || [])
                        .flat(),
                };
            })
            .filter((user) => user.recommendationScore > 0)
            .sort(sortByScoreDesc)
            .slice(skip, skip + limit);

        return {
            data: scored,
            pagination: {
                total: scored.length,
                page,
                limit,
                totalPages: Math.ceil(scored.length / limit),
            },
            meta: {
                topicProfile: Array.from(topicWeights.values()),
            },
        };
    },

    getLearningRecommendations: async (userId, query = {}) => {
        const limit = toInt(query.limit, 10);
        const page = toInt(query.page, 1);
        const skip = (page - 1) * limit;

        const where = {
            user_id: userId,
            status: "ACTIVE",
        };

        const [items, total] = await Promise.all([
            prisma.learningRecommendation.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    {
                        priority: "desc",
                    },
                    {
                        created_at: "desc",
                    },
                ],
                include: {
                    Topic: {
                        select: TOPIC_SELECT,
                    },
                    Submission: {
                        select: {
                            id: true,
                            status: true,
                            score: true,
                            challenge_id: true,
                            Challenge: {
                                select: {
                                    id: true,
                                    title: true,
                                    difficulty: true,
                                    type: true,
                                },
                            },
                        },
                    },
                    learningRecommendationItems: {
                        orderBy: {
                            rank: "asc",
                        },
                    },
                },
            }),
            prisma.learningRecommendation.count({ where }),
        ]);

        return {
            data: items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    getHomeRecommendations: async (userId, query = {}, { blockContext } = {}) => {
        const postLimit = toInt(query.postLimit, 6);
        const userLimit = toInt(query.userLimit, 5);
        const challengeLimit = toInt(query.challengeLimit, 5);
        const groupLimit = toInt(query.groupLimit, 4);
        const learningLimit = toInt(query.learningLimit, 3);

        const [posts, users, challenges, groups, learning] = await Promise.all([
            RecommendationService.getRecommendedPosts(
                userId,
                { limit: postLimit, page: 1 },
                { blockContext }
            ),
            RecommendationService.getRecommendedUsers(
                userId,
                { limit: userLimit, page: 1 },
                { blockContext }
            ),
            RecommendationService.getRecommendedChallenges(userId, {
                limit: challengeLimit,
                page: 1,
            }),
            RecommendationService.getRecommendedGroups(userId, {
                limit: groupLimit,
                page: 1,
            }),
            RecommendationService.getLearningRecommendations(userId, {
                limit: learningLimit,
                page: 1,
            }),
        ]);

        return {
            posts: posts.data,
            users: users.data,
            challenges: challenges.data,
            groups: groups.data,
            learning: learning.data,
            meta: {
                topicProfile: posts.meta?.topicProfile || [],
            },
        };
    },
};

module.exports = { RecommendationService };