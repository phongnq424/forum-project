import type {
    Report,
    ReportSeverity,
    ReportStatus,
    ReportTarget,
    ReportType,
} from "$lib/types/report.type";

export function statusLabel(status: ReportStatus) {
    if (status === "OPEN") return "Open";
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "RESOLVED") return "Resolved";
    return "Closed";
}

export function severityLabel(severity: ReportSeverity) {
    if (severity === "LOW") return "Low";
    if (severity === "MEDIUM") return "Medium";
    if (severity === "HIGH") return "High";
    return "Critical";
}

export function typeLabel(type: ReportType) {
    if (type === "USER") return "User";
    if (type === "POST") return "Post";
    if (type === "COMMENT") return "Comment";
    if (type === "MESSAGE") return "Message";
    return "Unknown";
}

export function statusColor(status: ReportStatus) {
    if (status === "OPEN") return "danger";
    if (status === "IN_PROGRESS") return "warning";
    if (status === "RESOLVED") return "success";
    return "default";
}

export function severityColor(severity: ReportSeverity) {
    if (severity === "LOW") return "info";
    if (severity === "MEDIUM") return "warning";
    if (severity === "HIGH") return "warning";
    return "danger";
}

export function formatDate(value?: string | null) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString();
}

export function formatDateTime(value?: string | null) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString();
}

export function getTargetFromReport(report: Report): ReportTarget {
    if (report.target) {
        return report.target;
    }

    return {
        id: null,
        type: report.type,
        title:
            report.reportedUser ||
            report.reportedContent ||
            report.title ||
            "Reported target",
        content: report.reportedContent || null,
        owner: null,
        url: null,
    };
}

export function getRiskText(report: Report) {
    const count = report.targetReportCount ?? 0;

    if (report.severity === "CRITICAL") {
        return "Requires immediate moderation attention.";
    }

    if (count >= 10) {
        return "This target has been reported many times and should be reviewed urgently.";
    }

    if (count >= 5) {
        return "This target has multiple reports and may require priority review.";
    }

    if (count >= 2) {
        return "This target has repeated reports.";
    }

    return "Single or low-frequency report.";
}

export function shouldShowRecommendedSeverity(report: Report) {
    return Boolean(
        report.recommendedSeverity &&
        report.recommendedSeverity !== report.severity,
    );
}