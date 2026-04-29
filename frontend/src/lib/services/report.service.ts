import { api } from "$lib/services/api";
import { ENDPOINTS } from "$lib/constants";
import type { Report, ReportListParams, ReportListResponse, ReportStatus } from "$lib/types/report.type";

export const reportService = {
    list(params: ReportListParams): Promise<ReportListResponse> {
        return api.get<ReportListResponse>(ENDPOINTS.REPORTS.BASE, { params });
    },

    updateStatus(id: string, status: ReportStatus): Promise<Report> {
        return api.put<Report>(ENDPOINTS.REPORTS.BY_ID(id), { status });
    }
};