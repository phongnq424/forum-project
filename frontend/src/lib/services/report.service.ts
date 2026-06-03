import { api } from "$lib/services/api";
import { ENDPOINTS } from "$lib/constants";
import type {
    CreateReportPayload,
    Report,
    ReportListParams,
    ReportListResponse,
    ReportReply,
    ReportSeverity,
    ReportStatus,
    ReplyReportPayload,
} from "$lib/types/report.type";

export const reportService = {
    create(payload: CreateReportPayload): Promise<Report> {
        return api.post<Report>(ENDPOINTS.REPORTS.BASE, payload);
    },

    list(params: ReportListParams = {}): Promise<ReportListResponse> {
        return api.get<ReportListResponse>(ENDPOINTS.REPORTS.BASE, {
            params,
        });
    },

    getById(id: string): Promise<Report> {
        return api.get<Report>(ENDPOINTS.REPORTS.BY_ID(id));
    },

    updateStatus(id: string, status: ReportStatus): Promise<Report> {
        return api.put<Report>(`${ENDPOINTS.REPORTS.BY_ID(id)}/status`, {
            status,
        });
    },

    updateSeverity(id: string, severity: ReportSeverity): Promise<Report> {
        return api.put<Report>(`${ENDPOINTS.REPORTS.BY_ID(id)}/severity`, {
            severity,
        });
    },

    reply(id: string, message: string): Promise<ReportReply> {
        const payload: ReplyReportPayload = { message };

        return api.post<ReportReply>(
            `${ENDPOINTS.REPORTS.BY_ID(id)}/replies`,
            payload,
        );
    },

    delete(id: string): Promise<Report> {
        return api.delete<Report>(ENDPOINTS.REPORTS.BY_ID(id));
    },
};