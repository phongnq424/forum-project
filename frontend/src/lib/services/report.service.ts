import { api } from "$lib/services/api";
import { ENDPOINTS } from "$lib/constants";
import type {
    ApiListResponse,
    ApiMessageResponse,
    ApplyModerationActionPayload,
    CloseReportCasePayload,
    CreateReportPayload,
    Report,
    ReportCase,
    ReportCaseListParams,
    ReportCaseListResponse,
    ReportListParams,
    ReportListResponse,
    ResolveReportCasePayload,
} from "$lib/types/report.type";

function unwrapData<T>(response: T | ApiMessageResponse<T>): T {
    if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        "message" in response
    ) {
        return (response as ApiMessageResponse<T>).data;
    }

    return response as T;
}

function unwrapList<T>(
    response: ApiListResponse<T> | { data: T[]; meta: ReportListResponse["meta"] },
): { data: T[]; meta: ReportListResponse["meta"] } {
    return {
        data: response.data,
        meta: response.meta,
    };
}

export const reportService = {
    async create(payload: CreateReportPayload): Promise<Report> {
        const response = await api.post<ApiMessageResponse<Report> | Report>(
            ENDPOINTS.REPORTS.BASE,
            payload,
        );

        return unwrapData(response);
    },

    async listMine(params: ReportListParams = {}): Promise<ReportListResponse> {
        const response = await api.get<ApiListResponse<Report>>(
            ENDPOINTS.REPORTS.ME,
            {
                params,
            },
        );

        return unwrapList(response);
    },

    async listCases(
        params: ReportCaseListParams = {},
    ): Promise<ReportCaseListResponse> {
        const response = await api.get<ApiListResponse<ReportCase>>(
            ENDPOINTS.REPORTS.CASES.BASE,
            {
                params,
            },
        );

        return unwrapList(response);
    },

    async getCaseById(id: string): Promise<ReportCase> {
        const response = await api.get<ApiMessageResponse<ReportCase> | ReportCase>(
            ENDPOINTS.REPORTS.CASES.BY_ID(id),
        );

        return unwrapData(response);
    },

    async assignCase(id: string): Promise<ReportCase> {
        const response = await api.post<ApiMessageResponse<ReportCase> | ReportCase>(
            ENDPOINTS.REPORTS.CASES.ASSIGN(id),
            {},
        );

        return unwrapData(response);
    },

    async applyAction(
        id: string,
        payload: ApplyModerationActionPayload,
    ): Promise<ReportCase> {
        const response = await api.post<ApiMessageResponse<ReportCase> | ReportCase>(
            ENDPOINTS.REPORTS.CASES.ACTION(id),
            payload,
        );

        return unwrapData(response);
    },

    async resolveCase(
        id: string,
        payload: ResolveReportCasePayload,
    ): Promise<ReportCase> {
        const response = await api.post<ApiMessageResponse<ReportCase> | ReportCase>(
            ENDPOINTS.REPORTS.CASES.RESOLVE(id),
            payload,
        );

        return unwrapData(response);
    },

    async closeCase(
        id: string,
        payload: CloseReportCasePayload = {},
    ): Promise<ReportCase> {
        const response = await api.post<ApiMessageResponse<ReportCase> | ReportCase>(
            ENDPOINTS.REPORTS.CASES.CLOSE(id),
            payload,
        );

        return unwrapData(response);
    },
};