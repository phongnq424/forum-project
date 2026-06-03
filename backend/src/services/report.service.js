const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ReportService = {
    create: async (reporterId, data) => {
        const { type, targetId, reason, title, severity = "MEDIUM" } = data;

        if (!type || !targetId || !reason?.trim()) {
            throw new Error("Missing required fields");
        }

        return prisma.$transaction(async (tx) => {
            const report = await tx.report.create({
                data: {
                    reporter_id: reporterId,
                    title: title || `Report ${type}`,
                    reason,
                    severity,
                    status: "OPEN"
                }
            });

            if (type === "USER") {
                await tx.reportUser.create({
                    data: {
                        id: report.id,
                        reported_user_id: targetId
                    }
                });
            } else if (type === "POST") {
                await tx.reportPost.create({
                    data: {
                        id: report.id,
                        reported_post_id: targetId
                    }
                });
            } else if (type === "COMMENT") {
                await tx.reportComment.create({
                    data: {
                        id: report.id,
                        reported_comment_id: targetId
                    }
                });
            } else if (type === "MESSAGE") {
                await tx.reportMessage.create({
                    data: {
                        id: report.id,
                        reported_message_id: targetId
                    }
                });
            } else {
                throw new Error("Invalid report type");
            }

            return report;
        });
    },

    list: async (query) => {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where = {
            is_deleted: false
        };

        if (query.status) where.status = query.status;
        if (query.severity) where.severity = query.severity;

        ReportService._applyTypeFilter(where, query.type);

        if (query.q) {
            where.OR = [
                { title: { contains: query.q, mode: "insensitive" } },
                { reason: { contains: query.q, mode: "insensitive" } },
                {
                    Reporter: {
                        username: { contains: query.q, mode: "insensitive" }
                    }
                }
            ];
        }

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    Reporter: {
                        select: {
                            id: true,
                            username: true,
                            fullname: true,
                            avatar: true
                        }
                    },
                    ReportUser: {
                        include: {
                            ReportedUser: {
                                select: {
                                    id: true,
                                    username: true,
                                    fullname: true
                                }
                            }
                        }
                    },
                    ReportPost: {
                        include: {
                            ReportedPost: {
                                select: {
                                    id: true,
                                    title: true,
                                    content: true
                                }
                            }
                        }
                    },
                    ReportComment: {
                        include: {
                            ReportedComment: {
                                select: {
                                    id: true,
                                    comment_detail: true
                                }
                            }
                        }
                    },
                    ReportMessage: {
                        include: {
                            ReportedMessage: {
                                select: {
                                    id: true,
                                    content: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.report.count({ where })
        ]);

        return {
            data: await Promise.all(reports.map(ReportService._formatReportAsync)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    getById: async (id) => {
        const report = await prisma.report.findFirst({
            where: {
                id,
                is_deleted: false
            },
            include: {
                Reporter: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                },
                ReportUser: {
                    include: {
                        ReportedUser: {
                            select: {
                                id: true,
                                username: true,
                                fullname: true
                            }
                        }
                    }
                },
                ReportPost: {
                    include: {
                        ReportedPost: {
                            select: {
                                id: true,
                                title: true,
                                content: true
                            }
                        }
                    }
                },
                ReportComment: {
                    include: {
                        ReportedComment: {
                            select: {
                                id: true,
                                comment_detail: true
                            }
                        }
                    }
                },
                ReportMessage: {
                    include: {
                        ReportedMessage: {
                            select: {
                                id: true,
                                content: true
                            }
                        }
                    }
                },
                ReportReply: {
                    orderBy: { created_at: "asc" }
                }
            }
        });

        if (!report) return null;
        return ReportService._formatReportAsync(report);
    },

    updateStatus: async (id, status) => {
        return prisma.report.update({
            where: { id },
            data: { status }
        });
    },

    delete: async (id) => {
        return prisma.report.update({
            where: { id },
            data: { is_deleted: true }
        });
    },

    reply: async (reportId, message) => {
        if (!message?.trim()) throw new Error("Message is required");

        return prisma.reportReply.create({
            data: {
                report_id: reportId,
                message
            }
        });
    },

    _getReportType: (report) => {
        if (report.ReportUser) return "USER";
        if (report.ReportPost) return "POST";
        if (report.ReportComment) return "COMMENT";
        if (report.ReportMessage) return "MESSAGE";
        return "UNKNOWN";
    },

    _applyTypeFilter: (where, type) => {
        if (!type) return;

        if (type === "USER") {
            where.ReportUser = { isNot: null };
            return;
        }

        if (type === "POST") {
            where.ReportPost = { isNot: null };
            return;
        }

        if (type === "COMMENT") {
            where.ReportComment = { isNot: null };
            return;
        }

        if (type === "MESSAGE") {
            where.ReportMessage = { isNot: null };
            return;
        }
    },

    _getReportedTarget: (report) => {
        if (report.ReportUser?.ReportedUser) {
            return report.ReportUser.ReportedUser.username;
        }

        if (report.ReportPost?.ReportedPost) {
            return report.ReportPost.ReportedPost.title;
        }

        if (report.ReportComment?.ReportedComment) {
            return report.ReportComment.ReportedComment.comment_detail;
        }

        if (report.ReportMessage?.ReportedMessage) {
            return report.ReportMessage.ReportedMessage.content;
        }

        return null;
    },

    _formatReport: (report) => {
        return {
            id: report.id,
            title: report.title || `Report ${ReportService._getReportType(report)}`,
            description: report.reason,
            reportedBy:
                report.Reporter?.fullname ||
                report.Reporter?.username ||
                "Unknown",
            reportedUser: report.ReportUser?.ReportedUser?.username || null,
            reportedContent: ReportService._getReportedTarget(report),
            type: ReportService._getReportType(report),
            status: report.status,
            severity: report.severity,
            createdAt: report.created_at,
            updatedAt: report.updated_at
        };
    },
    _getReportedTargetInfo: (report) => {
        if (report.ReportUser?.ReportedUser) {
            const user = report.ReportUser.ReportedUser;

            return {
                id: user.id,
                type: "USER",
                title: user.fullname || user.username || "Reported user",
                content: user.username || null,
                owner: null,
                url: `/profile/${user.id}`
            };
        }

        if (report.ReportPost?.ReportedPost) {
            const post = report.ReportPost.ReportedPost;

            return {
                id: post.id,
                type: "POST",
                title: post.title || "Reported post",
                content: post.content || null,
                owner: post.User
                    ? {
                        id: post.User.id,
                        username: post.User.username,
                        fullname: post.User.fullname,
                        avatar: post.User.avatar
                    }
                    : null,
                url: `/discuss/${post.id}`
            };
        }

        if (report.ReportComment?.ReportedComment) {
            const comment = report.ReportComment.ReportedComment;

            return {
                id: comment.id,
                type: "COMMENT",
                title: "Reported comment",
                content: comment.comment_detail || null,
                owner: comment.User
                    ? {
                        id: comment.User.id,
                        username: comment.User.username,
                        fullname: comment.User.fullname,
                        avatar: comment.User.avatar
                    }
                    : null,
                url: null
            };
        }

        if (report.ReportMessage?.ReportedMessage) {
            const message = report.ReportMessage.ReportedMessage;

            return {
                id: message.id,
                type: "MESSAGE",
                title: "Reported message",
                content: message.content || null,
                owner: message.Sender
                    ? {
                        id: message.Sender.id,
                        username: message.Sender.username,
                        fullname: message.Sender.fullname,
                        avatar: message.Sender.avatar
                    }
                    : null,
                url: null
            };
        }

        return {
            id: null,
            type: "UNKNOWN",
            title: "Unknown target",
            content: null,
            owner: null,
            url: null
        };
    },
    _getTargetCountWhere: (type, targetId) => {
        if (!type || !targetId) return null;

        if (type === "USER") {
            return {
                is_deleted: false,
                ReportUser: {
                    is: {
                        reported_user_id: targetId
                    }
                }
            };
        }

        if (type === "POST") {
            return {
                is_deleted: false,
                ReportPost: {
                    is: {
                        reported_post_id: targetId
                    }
                }
            };
        }

        if (type === "COMMENT") {
            return {
                is_deleted: false,
                ReportComment: {
                    is: {
                        reported_comment_id: targetId
                    }
                }
            };
        }

        if (type === "MESSAGE") {
            return {
                is_deleted: false,
                ReportMessage: {
                    is: {
                        reported_message_id: targetId
                    }
                }
            };
        }

        return null;
    },
    _getRecommendedSeverity: (type, targetReportCount, currentSeverity) => {
        if (currentSeverity === "CRITICAL") return "CRITICAL";

        if (targetReportCount >= 10) return "CRITICAL";

        if (targetReportCount >= 5) return "HIGH";

        if (targetReportCount >= 2) {
            if (type === "USER" || type === "MESSAGE") return "HIGH";
            return "MEDIUM";
        }

        return currentSeverity || "MEDIUM";
    },
    _formatReportAsync: async (report) => {
        const type = ReportService._getReportType(report);
        const target = ReportService._getReportedTargetInfo(report);

        let targetReportCount = 0;

        const countWhere = ReportService._getTargetCountWhere(type, target.id);

        if (countWhere) {
            targetReportCount = await prisma.report.count({
                where: countWhere
            });
        }

        const recommendedSeverity = ReportService._getRecommendedSeverity(
            type,
            targetReportCount,
            report.severity
        );

        return {
            id: report.id,
            title: report.title || `Report ${type}`,
            description: report.reason,

            reporter: report.Reporter
                ? {
                    id: report.Reporter.id,
                    username: report.Reporter.username,
                    fullname: report.Reporter.fullname,
                    avatar: report.Reporter.avatar
                }
                : null,

            reportedBy:
                report.Reporter?.fullname ||
                report.Reporter?.username ||
                "Unknown",

            type,
            target,
            reportedUser: report.ReportUser?.ReportedUser?.username || null,
            reportedContent: target.content,

            targetReportCount,
            recommendedSeverity,

            status: report.status,
            severity: report.severity,

            replies: report.ReportReply || [],

            createdAt: report.created_at,
            updatedAt: report.updated_at
        };
    },
};

module.exports = { ReportService };