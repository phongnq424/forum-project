export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReportType = "USER" | "POST" | "COMMENT" | "MESSAGE" | "UNKNOWN";

export interface Report {
    id: string;
    title: string;
    description: string;
    reportedBy: string;
    reportedUser?: string | null;
    reportedContent?: string | null;
    type: ReportType;
    status: ReportStatus;
    severity: ReportSeverity;
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

export interface ReplyReportPayload {
    message: string;
}

export interface ReportReply {
    id: string;
    report_id: string;
    message: string;
    created_at: string;
    updated_at?: string;
}

export interface ReportListParams {
    page?: number;
    limit?: number;
    q?: string;
    status?: ReportStatus | "";
    severity?: ReportSeverity | "";
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