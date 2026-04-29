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
            data: reports.map(ReportService._formatReport),
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
        return ReportService._formatReport(report);
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
    }
};

module.exports = { ReportService };