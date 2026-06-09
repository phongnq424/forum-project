const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const STATUSES = ["OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TARGET_TYPES = ["USER", "POST", "COMMENT", "MESSAGE"];

const RESOLUTIONS = [
    "VALID",
    "INVALID",
    "DUPLICATE",
    "NOT_ENOUGH_EVIDENCE",
    "AUTO_RESOLVED"
];

const ACTIONS = [
    "NONE",
    "HIDE_CONTENT",
    "RESTORE_CONTENT",
    "DELETE_CONTENT",
    "LOCK_CONTENT",
    "WARN_USER",
    "TEMP_BAN_USER",
    "PERMANENT_BAN_USER",
    "LIMIT_USER",
    "DISMISS_REPORT"
];

const CATEGORY_BASE_SCORE = {
    SPAM: 20,
    HARASSMENT: 35,
    HATE_SPEECH: 50,
    SEXUAL_CONTENT: 45,
    VIOLENCE: 55,
    SELF_HARM: 60,
    SCAM: 45,
    IMPERSONATION: 35,
    PRIVACY_VIOLATION: 60,
    MISINFORMATION: 30,
    COPYRIGHT: 25,
    OTHER: 10
};

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

function mapSeverity(score) {
    if (score >= 90) {
        return "CRITICAL";
    }

    if (score >= 65) {
        return "HIGH";
    }

    if (score >= 35) {
        return "MEDIUM";
    }

    return "LOW";
}

function calculateTrustScore(validReports, invalidReports, totalReports) {
    if (!totalReports || totalReports <= 0) {
        return 0.5;
    }

    const raw = validReports / totalReports;

    if (raw >= 0.8) {
        return 1.3;
    }

    if (raw >= 0.6) {
        return 1.0;
    }

    if (raw >= 0.4) {
        return 0.7;
    }

    return 0.3;
}

function reportCountScore(count) {
    if (count >= 20) {
        return 40;
    }

    if (count >= 10) {
        return 30;
    }

    if (count >= 5) {
        return 20;
    }

    if (count >= 3) {
        return 10;
    }

    return 0;
}

function velocityScore(countLastHour) {
    if (countLastHour >= 10) {
        return 25;
    }

    if (countLastHour >= 5) {
        return 15;
    }

    if (countLastHour >= 3) {
        return 8;
    }

    return 0;
}

function authorHistoryScore(count) {
    if (count >= 10) {
        return 30;
    }

    if (count >= 5) {
        return 20;
    }

    if (count >= 2) {
        return 10;
    }

    return 0;
}

function getMostCommonCategory(reports) {
    const map = {};

    for (const report of reports) {
        map[report.category] = (map[report.category] || 0) + 1;
    }

    let category = null;
    let max = 0;

    for (const key of Object.keys(map)) {
        if (map[key] > max) {
            max = map[key];
            category = key;
        }
    }

    return {
        categoryMain: category,
        categories: Object.keys(map)
    };
}

async function getTargetPreview(targetType, targetId) {
    if (targetType === "USER") {
        return await prisma.user.findFirst({
            where: {
                id: targetId
            },
            select: {
                id: true,
                username: true,
                fullname: true,
                avatar: true,
                status: true,
                is_deleted: true,
                created_at: true
            }
        });
    }

    if (targetType === "POST") {
        return await prisma.post.findFirst({
            where: {
                id: targetId
            },
            select: {
                id: true,
                user_id: true,
                title: true,
                content: true,
                is_deleted: true,
                moderation_status: true,
                moderation_reason: true,
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
    }

    if (targetType === "COMMENT") {
        return await prisma.comment.findFirst({
            where: {
                id: targetId
            },
            select: {
                id: true,
                user_id: true,
                post_id: true,
                comment_detail: true,
                is_deleted: true,
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
    }

    if (targetType === "MESSAGE") {
        return await prisma.message.findFirst({
            where: {
                id: targetId
            },
            select: {
                id: true,
                conversation_id: true,
                sender_id: true,
                content: true,
                is_deleted: true,
                sent_at: true,
                Sender: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                }
            }
        });
    }

    return null;
}

async function getTargetOwnerId(targetType, targetId) {
    if (targetType === "USER") {
        return targetId;
    }

    if (targetType === "POST") {
        const post = await prisma.post.findUnique({
            where: {
                id: targetId
            },
            select: {
                user_id: true
            }
        });

        return post ? post.user_id : null;
    }

    if (targetType === "COMMENT") {
        const comment = await prisma.comment.findUnique({
            where: {
                id: targetId
            },
            select: {
                user_id: true
            }
        });

        return comment ? comment.user_id : null;
    }

    if (targetType === "MESSAGE") {
        const message = await prisma.message.findUnique({
            where: {
                id: targetId
            },
            select: {
                sender_id: true
            }
        });

        return message ? message.sender_id : null;
    }

    return null;
}

function shouldAutoHide(reportCase) {
    if (reportCase.is_auto_hidden) {
        return false;
    }

    if (reportCase.severity === "CRITICAL" && reportCase.priority_score >= 90) {
        return true;
    }

    if (reportCase.report_count >= 5 && reportCase.priority_score >= 70) {
        return true;
    }

    if (reportCase.category_main === "SPAM" && reportCase.report_count >= 3 && reportCase.priority_score >= 45) {
        return true;
    }

    return false;
}

async function hideTarget(targetType, targetId, reason) {
    if (targetType === "POST") {
        return await prisma.post.update({
            where: {
                id: targetId
            },
            data: {
                moderation_status: "PENDING",
                moderation_reason: reason,
                moderated_at: new Date()
            }
        });
    }

    if (targetType === "COMMENT") {
        return await prisma.comment.update({
            where: {
                id: targetId
            },
            data: {
                is_deleted: true,
                deleted_at: new Date()
            }
        });
    }

    if (targetType === "MESSAGE") {
        return await prisma.message.update({
            where: {
                id: targetId
            },
            data: {
                is_deleted: true,
                deleted_at: new Date()
            }
        });
    }

    return null;
}

async function restoreTarget(targetType, targetId, reason) {
    if (targetType === "POST") {
        return await prisma.post.update({
            where: {
                id: targetId
            },
            data: {
                moderation_status: "APPROVED",
                moderation_reason: reason || null,
                moderated_at: new Date()
            }
        });
    }

    if (targetType === "COMMENT") {
        return await prisma.comment.update({
            where: {
                id: targetId
            },
            data: {
                is_deleted: false,
                deleted_at: null
            }
        });
    }

    if (targetType === "MESSAGE") {
        return await prisma.message.update({
            where: {
                id: targetId
            },
            data: {
                is_deleted: false,
                deleted_at: null
            }
        });
    }

    return null;
}

async function deleteTarget(targetType, targetId, reason) {
    if (targetType === "POST") {
        return await prisma.post.update({
            where: {
                id: targetId
            },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
                moderation_status: "REJECTED",
                moderation_reason: reason || "Deleted by moderation",
                moderated_at: new Date()
            }
        });
    }

    if (targetType === "COMMENT") {
        return await prisma.comment.update({
            where: {
                id: targetId
            },
            data: {
                is_deleted: true,
                deleted_at: new Date()
            }
        });
    }

    if (targetType === "MESSAGE") {
        return await prisma.message.update({
            where: {
                id: targetId
            },
            data: {
                is_deleted: true,
                deleted_at: new Date()
            }
        });
    }

    return null;
}

async function applyActionToTarget(targetType, targetId, action, reason) {
    if (action === "NONE" || action === "DISMISS_REPORT") {
        return null;
    }

    if (action === "HIDE_CONTENT" || action === "LOCK_CONTENT") {
        return await hideTarget(targetType, targetId, reason || "Hidden by moderation");
    }

    if (action === "RESTORE_CONTENT") {
        return await restoreTarget(targetType, targetId, reason || "Restored by moderation");
    }

    if (action === "DELETE_CONTENT") {
        return await deleteTarget(targetType, targetId, reason || "Deleted by moderation");
    }

    if (action === "WARN_USER") {
        return null;
    }

    if (action === "LIMIT_USER" || action === "TEMP_BAN_USER") {
        const ownerId = await getTargetOwnerId(targetType, targetId);

        if (!ownerId) {
            return null;
        }

        return await prisma.user.update({
            where: {
                id: ownerId
            },
            data: {
                status: "INACTIVE"
            }
        });
    }

    if (action === "PERMANENT_BAN_USER") {
        const ownerId = await getTargetOwnerId(targetType, targetId);

        if (!ownerId) {
            return null;
        }

        return await prisma.user.update({
            where: {
                id: ownerId
            },
            data: {
                status: "BANNED"
            }
        });
    }

    throw new Error("Unsupported moderation action");
}

async function hydrateCases(cases) {
    return await Promise.all(
        cases.map(async (item) => {
            const target = await getTargetPreview(item.target_type, item.target_id);

            return {
                ...item,
                target
            };
        })
    );
}

const ModerationService = {
    listCases: async (query = {}) => {
        const page = parsePositiveInt(query.page, 1, 100000);
        const limit = parsePositiveInt(query.limit, 10, 50);
        const skip = (page - 1) * limit;

        const where = {};

        if (query.status && STATUSES.includes(query.status)) {
            where.status = query.status;
        }

        if (query.severity && SEVERITIES.includes(query.severity)) {
            where.severity = query.severity;
        }

        if (query.target_type && TARGET_TYPES.includes(query.target_type)) {
            where.target_type = query.target_type;
        }

        if (query.category) {
            where.categories = {
                has: query.category
            };
        }

        if (query.assigned_to_id) {
            where.assigned_to_id = query.assigned_to_id;
        }

        const orderBy = [];

        if (query.sortBy === "oldest") {
            orderBy.push({
                created_at: "asc"
            });
        } else {
            orderBy.push({
                priority_score: "desc"
            });

            orderBy.push({
                created_at: "asc"
            });
        }

        const [items, total] = await Promise.all([
            prisma.reportCase.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    AssignedTo: {
                        select: {
                            id: true,
                            username: true,
                            fullname: true,
                            avatar: true
                        }
                    },
                    ResolvedBy: {
                        select: {
                            id: true,
                            username: true,
                            fullname: true,
                            avatar: true
                        }
                    }
                }
            }),
            prisma.reportCase.count({
                where
            })
        ]);

        const data = await hydrateCases(items);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    getCaseById: async (caseId) => {
        const reportCase = await prisma.reportCase.findUnique({
            where: {
                id: caseId
            },
            include: {
                Reports: {
                    where: {
                        is_deleted: false
                    },
                    orderBy: {
                        created_at: "desc"
                    },
                    include: {
                        Reporter: {
                            select: {
                                id: true,
                                username: true,
                                fullname: true,
                                avatar: true,
                                status: true
                            }
                        }
                    }
                },
                Signals: {
                    orderBy: {
                        created_at: "desc"
                    }
                },
                ActionLogs: {
                    orderBy: {
                        created_at: "desc"
                    },
                    include: {
                        Actor: {
                            select: {
                                id: true,
                                username: true,
                                fullname: true,
                                avatar: true
                            }
                        }
                    }
                },
                AssignedTo: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                },
                ResolvedBy: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                }
            }
        });

        if (!reportCase) {
            return null;
        }

        const target = await getTargetPreview(reportCase.target_type, reportCase.target_id);

        return {
            ...reportCase,
            target
        };
    },

    assignCase: async (caseId, adminId) => {
        const reportCase = await prisma.reportCase.findUnique({
            where: {
                id: caseId
            }
        });

        if (!reportCase) {
            throw new Error("Report case not found");
        }

        if (reportCase.status === "RESOLVED" || reportCase.status === "CLOSED") {
            throw new Error("Cannot assign a resolved or closed case");
        }

        const updated = await prisma.reportCase.update({
            where: {
                id: caseId
            },
            data: {
                assigned_to_id: adminId,
                status: "IN_PROGRESS"
            }
        });

        await prisma.moderationActionLog.create({
            data: {
                case_id: caseId,
                actor_id: adminId,
                action: "NONE",
                previous_status: reportCase.status,
                new_status: "IN_PROGRESS",
                reason: "Case assigned"
            }
        });

        return updated;
    },

    recalculateCase: async (caseId) => {
        const reportCase = await prisma.reportCase.findUnique({
            where: {
                id: caseId
            },
            include: {
                Reports: {
                    where: {
                        is_deleted: false
                    },
                    include: {
                        Reporter: {
                            include: {
                                reporterTrust: true
                            }
                        }
                    }
                }
            }
        });

        if (!reportCase) {
            throw new Error("Report case not found");
        }

        const reports = reportCase.Reports;
        const reportCount = reports.length;
        const categoryInfo = getMostCommonCategory(reports);
        const categoryMain = categoryInfo.categoryMain || reportCase.category_main || "OTHER";
        const categories = categoryInfo.categories.length > 0 ? categoryInfo.categories : [categoryMain];

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const countLastHour = reports.filter((report) => {
            return report.created_at >= oneHourAgo;
        }).length;

        let trustTotal = 0;

        for (const report of reports) {
            trustTotal += report.Reporter.reporterTrust?.trust_score || 0.5;
        }

        const avgTrust = reportCount > 0 ? trustTotal / reportCount : 0.5;
        const ownerId = await getTargetOwnerId(reportCase.target_type, reportCase.target_id);

        let previousViolationCount = 0;

        if (ownerId) {
            previousViolationCount = await prisma.reportCase.count({
                where: {
                    target_type: "USER",
                    target_id: ownerId,
                    resolution: "VALID"
                }
            });
        }

        const base = CATEGORY_BASE_SCORE[categoryMain] || 10;
        const countScore = reportCountScore(reportCount);
        const trustScore = avgTrust * 20;
        const velocity = velocityScore(countLastHour);
        const history = authorHistoryScore(previousViolationCount);

        const priorityScore = Math.round(base + countScore + trustScore + velocity + history);
        const severity = mapSeverity(priorityScore);

        await prisma.moderationSignal.deleteMany({
            where: {
                case_id: caseId,
                type: {
                    in: [
                        "REPORT_COUNT",
                        "REPORTER_TRUST",
                        "TARGET_AUTHOR_HISTORY",
                        "TARGET_VELOCITY"
                    ]
                }
            }
        });

        await prisma.moderationSignal.createMany({
            data: [
                {
                    case_id: caseId,
                    type: "REPORT_COUNT",
                    score: reportCount,
                    weight: countScore,
                    metadata: {
                        report_count: reportCount
                    }
                },
                {
                    case_id: caseId,
                    type: "REPORTER_TRUST",
                    score: avgTrust,
                    weight: trustScore,
                    metadata: {
                        average_trust: avgTrust
                    }
                },
                {
                    case_id: caseId,
                    type: "TARGET_VELOCITY",
                    score: countLastHour,
                    weight: velocity,
                    metadata: {
                        count_last_hour: countLastHour
                    }
                },
                {
                    case_id: caseId,
                    type: "TARGET_AUTHOR_HISTORY",
                    score: previousViolationCount,
                    weight: history,
                    metadata: {
                        target_owner_id: ownerId,
                        previous_violation_count: previousViolationCount
                    }
                }
            ]
        });

        return await prisma.reportCase.update({
            where: {
                id: caseId
            },
            data: {
                report_count: reportCount,
                category_main: categoryMain,
                categories,
                priority_score: priorityScore,
                severity,
                status: reportCase.status === "OPEN" ? "TRIAGED" : reportCase.status,
                last_reported_at: new Date()
            }
        });
    },

    applyAutoActionIfNeeded: async (caseId) => {
        const reportCase = await prisma.reportCase.findUnique({
            where: {
                id: caseId
            }
        });

        if (!reportCase) {
            throw new Error("Report case not found");
        }

        if (!shouldAutoHide(reportCase)) {
            return reportCase;
        }

        const previousTarget = await getTargetPreview(reportCase.target_type, reportCase.target_id);

        await hideTarget(
            reportCase.target_type,
            reportCase.target_id,
            "Auto-hidden due to report severity and priority score"
        );

        const updated = await prisma.reportCase.update({
            where: {
                id: caseId
            },
            data: {
                is_auto_hidden: true,
                auto_action_at: new Date()
            }
        });

        const newTarget = await getTargetPreview(reportCase.target_type, reportCase.target_id);

        await prisma.moderationActionLog.create({
            data: {
                case_id: caseId,
                actor_id: null,
                action: "HIDE_CONTENT",
                previous_status: reportCase.status,
                new_status: reportCase.status,
                previous_data: previousTarget || undefined,
                new_data: newTarget || undefined,
                reason: "Auto-hidden due to report severity and priority score"
            }
        });

        return updated;
    },

    applyAction: async (caseId, adminId, payload = {}) => {
        const action = payload.action;
        const note = payload.note ? String(payload.note).trim() : null;

        if (!action) {
            throw new Error("Action is required");
        }

        if (!ACTIONS.includes(action)) {
            throw new Error("Invalid moderation action");
        }

        const reportCase = await prisma.reportCase.findUnique({
            where: {
                id: caseId
            }
        });

        if (!reportCase) {
            throw new Error("Report case not found");
        }

        if (reportCase.status === "CLOSED") {
            throw new Error("Cannot apply action to a closed case");
        }

        const previousTarget = await getTargetPreview(reportCase.target_type, reportCase.target_id);

        await applyActionToTarget(
            reportCase.target_type,
            reportCase.target_id,
            action,
            note
        );

        const newTarget = await getTargetPreview(reportCase.target_type, reportCase.target_id);

        const updated = await prisma.reportCase.update({
            where: {
                id: caseId
            },
            data: {
                action_taken: action,
                moderator_note: note || reportCase.moderator_note,
                assigned_to_id: reportCase.assigned_to_id || adminId,
                is_auto_hidden: action === "HIDE_CONTENT" ? true : reportCase.is_auto_hidden
            }
        });

        await prisma.moderationActionLog.create({
            data: {
                case_id: caseId,
                actor_id: adminId,
                action,
                previous_status: reportCase.status,
                new_status: updated.status,
                previous_data: previousTarget || undefined,
                new_data: newTarget || undefined,
                reason: note
            }
        });

        return updated;
    },

    resolveCase: async (caseId, adminId, payload = {}) => {
        const resolution = payload.resolution;
        const action = payload.action || "NONE";
        const note = payload.note ? String(payload.note).trim() : null;

        if (!resolution) {
            throw new Error("Resolution is required");
        }

        if (!RESOLUTIONS.includes(resolution)) {
            throw new Error("Invalid report resolution");
        }

        if (!ACTIONS.includes(action)) {
            throw new Error("Invalid moderation action");
        }

        const reportCase = await prisma.reportCase.findUnique({
            where: {
                id: caseId
            },
            include: {
                Reports: true
            }
        });

        if (!reportCase) {
            throw new Error("Report case not found");
        }

        if (reportCase.status === "CLOSED") {
            throw new Error("Cannot resolve a closed case");
        }

        const previousTarget = await getTargetPreview(reportCase.target_type, reportCase.target_id);

        await applyActionToTarget(
            reportCase.target_type,
            reportCase.target_id,
            action,
            note
        );

        const newTarget = await getTargetPreview(reportCase.target_type, reportCase.target_id);

        const updated = await prisma.reportCase.update({
            where: {
                id: caseId
            },
            data: {
                status: "RESOLVED",
                resolution,
                action_taken: action,
                resolved_by_id: adminId,
                assigned_to_id: reportCase.assigned_to_id || adminId,
                moderator_note: note,
                resolved_at: new Date(),
                active_key: null
            }
        });

        await prisma.moderationActionLog.create({
            data: {
                case_id: caseId,
                actor_id: adminId,
                action,
                previous_status: reportCase.status,
                new_status: "RESOLVED",
                previous_data: previousTarget || undefined,
                new_data: newTarget || undefined,
                reason: note
            }
        });

        await ModerationService.updateReporterTrustAfterResolution(
            reportCase.Reports,
            resolution
        );

        return updated;
    },

    closeCase: async (caseId, adminId, payload = {}) => {
        const note = payload.note ? String(payload.note).trim() : null;

        const reportCase = await prisma.reportCase.findUnique({
            where: {
                id: caseId
            }
        });

        if (!reportCase) {
            throw new Error("Report case not found");
        }

        if (reportCase.status !== "RESOLVED") {
            throw new Error("Only resolved cases can be closed");
        }

        const updated = await prisma.reportCase.update({
            where: {
                id: caseId
            },
            data: {
                status: "CLOSED",
                closed_at: new Date(),
                active_key: null
            }
        });

        await prisma.moderationActionLog.create({
            data: {
                case_id: caseId,
                actor_id: adminId,
                action: "NONE",
                previous_status: reportCase.status,
                new_status: "CLOSED",
                reason: note || "Case closed"
            }
        });

        return updated;
    },

    updateReporterTrustAfterResolution: async (reports, resolution) => {
        const isValid = resolution === "VALID" || resolution === "AUTO_RESOLVED";

        for (const report of reports) {
            await prisma.reporterTrust.upsert({
                where: {
                    user_id: report.reporter_id
                },
                update: isValid
                    ? {
                        valid_reports: {
                            increment: 1
                        }
                    }
                    : {
                        invalid_reports: {
                            increment: 1
                        }
                    },
                create: isValid
                    ? {
                        user_id: report.reporter_id,
                        valid_reports: 1,
                        total_reports: 1,
                        trust_score: 0.5
                    }
                    : {
                        user_id: report.reporter_id,
                        invalid_reports: 1,
                        total_reports: 1,
                        trust_score: 0.5
                    }
            });

            const trust = await prisma.reporterTrust.findUnique({
                where: {
                    user_id: report.reporter_id
                }
            });

            const newScore = calculateTrustScore(
                trust.valid_reports,
                trust.invalid_reports,
                trust.total_reports
            );

            const data = {
                trust_score: newScore
            };

            if (newScore <= 0.3 && trust.invalid_reports >= 5) {
                data.cooldown_until = new Date(Date.now() + 24 * 60 * 60 * 1000);
            }

            await prisma.reporterTrust.update({
                where: {
                    user_id: report.reporter_id
                },
                data
            });
        }
    }
};

module.exports = { ModerationService };