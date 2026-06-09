const { PrismaClient } = require("@prisma/client");
const { ModerationService } = require("./moderation.service");

const prisma = new PrismaClient();

const TARGET_TYPES = ["USER", "POST", "COMMENT", "MESSAGE"];

const REPORT_CATEGORIES = [
    "SPAM",
    "HARASSMENT",
    "HATE_SPEECH",
    "SEXUAL_CONTENT",
    "VIOLENCE",
    "SELF_HARM",
    "SCAM",
    "IMPERSONATION",
    "PRIVACY_VIOLATION",
    "MISINFORMATION",
    "COPYRIGHT",
    "OTHER"
];

function parsePositiveInt(value, fallback, max) {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        return fallback;
    }

    if (max && parsed > max) {
        return max;
    }

    return parsed;
}

function validateCreatePayload(payload) {
    if (!payload) {
        throw new Error("Payload is required");
    }

    if (!payload.target_type) {
        throw new Error("Target type is required");
    }

    if (!TARGET_TYPES.includes(payload.target_type)) {
        throw new Error("Invalid target type");
    }

    if (!payload.target_id) {
        throw new Error("Target id is required");
    }

    if (!payload.category) {
        throw new Error("Report category is required");
    }

    if (!REPORT_CATEGORIES.includes(payload.category)) {
        throw new Error("Invalid report category");
    }

    if (!payload.reason || String(payload.reason).trim().length < 5) {
        throw new Error("Reason must be at least 5 characters");
    }

    if (String(payload.reason).length > 3000) {
        throw new Error("Reason is too long");
    }

    if (payload.evidence && String(payload.evidence).length > 5000) {
        throw new Error("Evidence is too long");
    }
}

async function getTargetInfo(targetType, targetId, reporterId) {
    if (targetType === "USER") {
        const user = await prisma.user.findFirst({
            where: {
                id: targetId,
                is_deleted: false
            },
            select: {
                id: true,
                username: true,
                fullname: true,
                avatar: true,
                status: true,
                is_deleted: true
            }
        });

        if (!user) {
            throw new Error("Reported user not found");
        }

        if (user.id === reporterId) {
            throw new Error("You cannot report yourself");
        }

        return {
            ownerId: user.id,
            target: user
        };
    }

    if (targetType === "POST") {
        const post = await prisma.post.findFirst({
            where: {
                id: targetId,
                is_deleted: false
            },
            select: {
                id: true,
                user_id: true,
                title: true,
                content: true,
                moderation_status: true,
                created_at: true,
                User: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                }
            }
        });

        if (!post) {
            throw new Error("Reported post not found");
        }

        if (post.user_id === reporterId) {
            throw new Error("You cannot report your own post");
        }

        return {
            ownerId: post.user_id,
            target: post
        };
    }

    if (targetType === "COMMENT") {
        const comment = await prisma.comment.findFirst({
            where: {
                id: targetId,
                is_deleted: false
            },
            select: {
                id: true,
                user_id: true,
                post_id: true,
                comment_detail: true,
                created_at: true,
                User: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                }
            }
        });

        if (!comment) {
            throw new Error("Reported comment not found");
        }

        if (comment.user_id === reporterId) {
            throw new Error("You cannot report your own comment");
        }

        return {
            ownerId: comment.user_id,
            target: comment
        };
    }

    if (targetType === "MESSAGE") {
        const message = await prisma.message.findFirst({
            where: {
                id: targetId,
                is_deleted: false
            },
            select: {
                id: true,
                conversation_id: true,
                sender_id: true,
                content: true,
                sent_at: true,
                Sender: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                },
                Conversation: {
                    select: {
                        id: true,
                        ConversationUser: {
                            where: {
                                user_id: reporterId,
                                left_at: null
                            },
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        if (!message) {
            throw new Error("Reported message not found");
        }

        if (message.sender_id === reporterId) {
            throw new Error("You cannot report your own message");
        }

        if (!message.Conversation || message.Conversation.ConversationUser.length === 0) {
            throw new Error("You can only report messages from conversations you belong to");
        }

        return {
            ownerId: message.sender_id,
            target: message
        };
    }

    throw new Error("Unsupported target type");
}

async function ensureCanReport(reporterId) {
    const now = new Date();

    const trust = await prisma.reporterTrust.findUnique({
        where: {
            user_id: reporterId
        }
    });

    if (trust && trust.cooldown_until && trust.cooldown_until > now) {
        throw new Error("You are temporarily limited from submitting reports");
    }

    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentCount = await prisma.report.count({
        where: {
            reporter_id: reporterId,
            created_at: {
                gte: tenMinutesAgo
            }
        }
    });

    if (recentCount >= 5) {
        await prisma.reporterTrust.upsert({
            where: {
                user_id: reporterId
            },
            update: {
                cooldown_until: new Date(now.getTime() + 30 * 60 * 1000)
            },
            create: {
                user_id: reporterId,
                cooldown_until: new Date(now.getTime() + 30 * 60 * 1000)
            }
        });

        throw new Error("Too many reports submitted in a short time");
    }

    const dailyCount = await prisma.report.count({
        where: {
            reporter_id: reporterId,
            created_at: {
                gte: oneDayAgo
            }
        }
    });

    if (dailyCount >= 20) {
        await prisma.reporterTrust.upsert({
            where: {
                user_id: reporterId
            },
            update: {
                cooldown_until: new Date(now.getTime() + 24 * 60 * 60 * 1000)
            },
            create: {
                user_id: reporterId,
                cooldown_until: new Date(now.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        throw new Error("Daily report limit reached");
    }
}

function legacyTargetCreate(tx, reportId, targetType, targetId) {
    if (targetType === "USER") {
        return tx.reportUser.create({
            data: {
                id: reportId,
                reported_user_id: targetId
            }
        });
    }

    if (targetType === "POST") {
        return tx.reportPost.create({
            data: {
                id: reportId,
                reported_post_id: targetId
            }
        });
    }

    if (targetType === "COMMENT") {
        return tx.reportComment.create({
            data: {
                id: reportId,
                reported_comment_id: targetId
            }
        });
    }

    if (targetType === "MESSAGE") {
        return tx.reportMessage.create({
            data: {
                id: reportId,
                reported_message_id: targetId
            }
        });
    }

    throw new Error("Unsupported target type");
}

const ReportService = {
    create: async (reporterId, payload, meta = {}) => {
        validateCreatePayload(payload);
        await ensureCanReport(reporterId);

        const targetType = payload.target_type;
        const targetId = payload.target_id;
        const category = payload.category;
        const reason = String(payload.reason).trim();
        const evidence = payload.evidence ? String(payload.evidence).trim() : null;

        await getTargetInfo(targetType, targetId, reporterId);

        const activeKey = `${targetType}:${targetId}`;
        const now = new Date();

        let createdReportId = null;
        let caseId = null;

        try {
            const result = await prisma.$transaction(async (tx) => {
                const reportCase = await tx.reportCase.upsert({
                    where: {
                        active_key: activeKey
                    },
                    update: {
                        last_reported_at: now
                    },
                    create: {
                        active_key: activeKey,
                        target_type: targetType,
                        target_id: targetId,
                        status: "OPEN",
                        severity: "MEDIUM",
                        priority_score: 0,
                        report_count: 0,
                        category_main: category,
                        categories: [category],
                        first_reported_at: now,
                        last_reported_at: now
                    }
                });

                const report = await tx.report.create({
                    data: {
                        case_id: reportCase.id,
                        reporter_id: reporterId,
                        category,
                        reason,
                        evidence,
                        reporter_ip: meta.ip || null,
                        user_agent: meta.userAgent || null
                    }
                });

                await legacyTargetCreate(tx, report.id, targetType, targetId);

                await tx.reporterTrust.upsert({
                    where: {
                        user_id: reporterId
                    },
                    update: {
                        total_reports: {
                            increment: 1
                        },
                        last_reported_at: now
                    },
                    create: {
                        user_id: reporterId,
                        total_reports: 1,
                        last_reported_at: now,
                        trust_score: 0.5
                    }
                });

                await tx.moderationSignal.create({
                    data: {
                        case_id: reportCase.id,
                        type: "USER_REPORT",
                        score: 1,
                        weight: 1,
                        metadata: {
                            report_id: report.id,
                            category,
                            reporter_id: reporterId
                        }
                    }
                });

                return {
                    report,
                    reportCase
                };
            });

            createdReportId = result.report.id;
            caseId = result.reportCase.id;
        } catch (e) {
            if (e.code === "P2002") {
                throw new Error("You have already reported this target");
            }

            throw e;
        }

        await ModerationService.recalculateCase(caseId);
        await ModerationService.applyAutoActionIfNeeded(caseId);

        const report = await prisma.report.findUnique({
            where: {
                id: createdReportId
            },
            include: {
                Case: true
            }
        });

        return report;
    },

    listMine: async (userId, query = {}) => {
        const page = parsePositiveInt(query.page, 1, 100000);
        const limit = parsePositiveInt(query.limit, 10, 50);
        const skip = (page - 1) * limit;

        const where = {
            reporter_id: userId,
            is_deleted: false
        };

        if (query.category && REPORT_CATEGORIES.includes(query.category)) {
            where.category = query.category;
        }

        const [items, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    created_at: "desc"
                },
                include: {
                    Case: true
                }
            }),
            prisma.report.count({
                where
            })
        ]);

        return {
            data: items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
};

module.exports = { ReportService };