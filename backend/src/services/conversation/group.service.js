const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { emitToChat, emitToUser } = require("../../socket/emitter");
const { buildMessageResponse } = require("./conversation-message.service");

function buildGroupWhere({ q, scope, topic_id, challenge_id } = {}) {
    const where = {
        type: "GROUP"
    };

    if (scope) {
        where.scope = scope;
    }

    if (topic_id) {
        where.topic_id = topic_id;
    }

    if (challenge_id) {
        where.challenge_id = challenge_id;
    }

    if (q && String(q).trim() !== "") {
        const keyword = String(q).trim();

        where.OR = [
            {
                name: {
                    contains: keyword,
                    mode: "insensitive"
                }
            },
            {
                Topic: {
                    name: {
                        contains: keyword,
                        mode: "insensitive"
                    }
                }
            },
            {
                Challenge: {
                    title: {
                        contains: keyword,
                        mode: "insensitive"
                    }
                }
            }
        ];
    }

    return where;
}

function getGroupListInclude(userId = null) {
    return {
        Topic: {
            select: {
                id: true,
                name: true,
                slug: true
            }
        },
        Challenge: {
            select: {
                id: true,
                title: true,
                difficulty: true,
                type: true
            }
        },
        ConversationUser: userId
            ? {
                where: {
                    user_id: userId
                },
                select: {
                    id: true,
                    role: true,
                    left_at: true
                }
            }
            : {
                where: {
                    left_at: null
                },
                include: {
                    User: {
                        select: {
                            id: true,
                            username: true,
                            fullname: true,
                            avatar: true
                        }
                    }
                }
            },
        LastMessage: {
            include: {
                Sender: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                },
                Attachment: true
            }
        },
        _count: {
            select: {
                ConversationUser: {
                    where: {
                        left_at: null
                    }
                }
            }
        }
    };
}

function mapGroupListItem(group, { viewerId = null, includeMembers = false } = {}) {
    const membership = viewerId ? group.ConversationUser[0] || null : null;
    const joined = viewerId
        ? !!membership && membership.left_at === null
        : undefined;

    const result = {
        id: group.id,
        conversationId: group.id,
        type: group.type,
        scope: group.scope,
        name: group.name,
        avatar: group.avatar,
        topic_id: group.topic_id,
        challenge_id: group.challenge_id,
        Topic: group.Topic || null,
        Challenge: group.Challenge || null,
        memberCount: group._count.ConversationUser,
        latestMsg: group.LastMessage
            ? buildMessageResponse(group.LastMessage)
            : null,
        created_at: group.created_at,
        updated_at: group.updated_at
    };

    if (viewerId) {
        result.joined = joined;
        result.role = joined ? membership.role : null;
    }

    if (includeMembers) {
        result.members = group.ConversationUser.map((item) => ({
            id: item.User.id,
            username: item.User.username,
            fullname: item.User.fullname,
            avatar: item.User.avatar,
            role: item.role
        }));
    }

    return result;
}

const GroupService = {
    createGroup: async ({
        name,
        avatar,
        userIds,
        ownerId,
        scope = "GENERAL",
        topic_id = null,
        challenge_id = null
    }) => {
        const uniqueUserIds = Array.from(new Set(userIds));

        if (uniqueUserIds.length === 0) {
            throw new Error("Group must have at least one member");
        }

        const conversation = await prisma.conversation.create({
            data: {
                type: "GROUP",
                scope,
                name,
                avatar,
                topic_id,
                challenge_id,
                ConversationUser: {
                    create: uniqueUserIds.map((id) => ({
                        user_id: id,
                        role: id === ownerId ? "OWNER" : "MEMBER"
                    }))
                }
            },
            include: {
                Topic: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                Challenge: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        type: true
                    }
                },
                ConversationUser: true,
                _count: {
                    select: {
                        ConversationUser: {
                            where: {
                                left_at: null
                            }
                        }
                    }
                }
            }
        });

        uniqueUserIds.forEach((uid) => {
            emitToUser(uid, "chat:new", conversation);
        });

        return conversation;
    },

    adminListGroups: async ({ q, scope, topic_id, challenge_id } = {}) => {
        const groups = await prisma.conversation.findMany({
            where: buildGroupWhere({
                q,
                scope,
                topic_id,
                challenge_id
            }),
            include: getGroupListInclude(null),
            orderBy: [
                {
                    last_message_at: "desc"
                },
                {
                    created_at: "desc"
                }
            ]
        });

        return groups.map((group) =>
            mapGroupListItem(group, {
                includeMembers: true
            })
        );
    },

    listPublicGroups: async (userId, { q, scope, topic_id, challenge_id } = {}) => {
        const groups = await prisma.conversation.findMany({
            where: buildGroupWhere({
                q,
                scope,
                topic_id,
                challenge_id
            }),
            include: getGroupListInclude(userId),
            orderBy: [
                {
                    last_message_at: "desc"
                },
                {
                    created_at: "desc"
                }
            ]
        });

        return groups.map((group) =>
            mapGroupListItem(group, {
                viewerId: userId
            })
        );
    },

    joinGroup: async (conversationId, userId) => {
        const group = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                type: "GROUP"
            },
            include: {
                ConversationUser: {
                    where: {
                        user_id: userId
                    }
                }
            }
        });

        if (!group) {
            throw new Error("Group not found or not available");
        }

        const existing = group.ConversationUser[0];

        if (existing && existing.left_at === null) {
            return {
                conversationId: group.id,
                joined: true
            };
        }

        if (existing && existing.left_at !== null) {
            await prisma.conversationUser.update({
                where: {
                    id: existing.id
                },
                data: {
                    left_at: null,
                    role: "MEMBER"
                }
            });

            emitToChat(group.id, "chat:joined", {
                conversationId: group.id,
                userId
            });

            return {
                conversationId: group.id,
                joined: true
            };
        }

        await prisma.conversationUser.create({
            data: {
                conversation_id: group.id,
                user_id: userId,
                role: "MEMBER"
            }
        });

        emitToChat(group.id, "chat:joined", {
            conversationId: group.id,
            userId
        });

        return {
            conversationId: group.id,
            joined: true
        };
    },

    leaveConversation: async (conversationId, userId) => {
        await prisma.conversationUser.updateMany({
            where: {
                conversation_id: conversationId,
                user_id: userId
            },
            data: {
                left_at: new Date()
            }
        });

        emitToChat(conversationId, "chat:left", {
            conversationId,
            userId
        });

        return {
            left: true
        };
    },

    updateGroupByAdmin: async (
        conversationId,
        {
            name,
            avatar,
            scope,
            topic_id = null,
            challenge_id = null
        }
    ) => {
        const existing = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                type: "GROUP"
            }
        });

        if (!existing) {
            throw new Error("Group not found");
        }

        const group = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                name,
                avatar,
                scope,
                topic_id,
                challenge_id
            },
            include: getGroupListInclude(null)
        });

        emitToChat(conversationId, "chat:group:updated", {
            conversationId,
            group: mapGroupListItem(group, {
                includeMembers: true
            })
        });

        return mapGroupListItem(group, {
            includeMembers: true
        });
    },

    deleteGroupByAdmin: async (conversationId) => {
        const existing = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                type: "GROUP"
            },
            include: {
                ConversationUser: {
                    where: {
                        left_at: null
                    },
                    select: {
                        user_id: true
                    }
                }
            }
        });

        if (!existing) {
            throw new Error("Group not found");
        }

        const memberIds = existing.ConversationUser.map((item) => item.user_id);

        await prisma.conversation.delete({
            where: {
                id: conversationId
            }
        });

        emitToChat(conversationId, "chat:group:deleted", {
            conversationId
        });

        memberIds.forEach((userId) => {
            emitToUser(userId, "chat:group:deleted", {
                conversationId
            });
        });

        return {
            deleted: true
        };
    }
};

module.exports = {
    GroupService,
    mapGroupListItem,
    getGroupListInclude
};