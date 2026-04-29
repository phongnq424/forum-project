export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Report {
    id: string;
    title: string;
    description: string;
    reportedBy: string;
    reportedUser?: string | null;
    reportedContent?: string | null;
    type: string;
    status: ReportStatus;
    severity: ReportSeverity;
    createdAt: string;
    updatedAt: string;
}

export interface ReportListParams {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    severity?: string;
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