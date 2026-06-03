export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReportType = "USER" | "POST" | "COMMENT" | "MESSAGE" | "UNKNOWN";

export interface ReportUserSummary {
    id: string;
    username?: string | null;
    fullname?: string | null;
    avatar?: string | null;
}

export interface ReportTarget {
    id: string | null;
    type: ReportType;
    title?: string | null;
    content?: string | null;
    owner?: ReportUserSummary | null;
    url?: string | null;
}

export interface ReportReply {
    id: string;
    report_id: string;
    message: string;
    created_at: string;
    updated_at?: string | null;
}

export interface Report {
    id: string;
    title: string;
    description: string;

    type: ReportType;
    status: ReportStatus;
    severity: ReportSeverity;
    recommendedSeverity?: ReportSeverity | null;

    reporter?: ReportUserSummary | null;
    reportedBy: string;

    target?: ReportTarget | null;

    reportedUser?: string | null;
    reportedContent?: string | null;

    targetReportCount?: number;

    replies?: ReportReply[];

    createdAt: string;
    updatedAt: string;
}

export interface CreateReportPayload {
    type: Exclude<ReportType, "UNKNOWN">;
    targetId: string;
    reason: string;
    title?: string;
    severity?: ReportSeverity;
}

export interface UpdateReportStatusPayload {
    status: ReportStatus;
}

export interface UpdateReportSeverityPayload {
    severity: ReportSeverity;
}

export interface ReplyReportPayload {
    message: string;
}

export interface ReportListParams {
    page?: number;
    limit?: number;
    q?: string;
    status?: ReportStatus | "";
    severity?: ReportSeverity | "";
    type?: ReportType | "";
}

export interface ReportListResponse {
    data: Report[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}