import type {
    ReportSeverity,
    ReportStatus,
    ReportTargetType,
    ReportCategory,
    ModerationActionType,
    ReportResolution,
} from "$lib/types/report.type";

export function statusLabel(status: ReportStatus) {
    if (status === "OPEN") return "Open";
    if (status === "TRIAGED") return "Triaged";
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

export function typeLabel(type: ReportTargetType) {
    if (type === "USER") return "User";
    if (type === "POST") return "Post";
    if (type === "COMMENT") return "Comment";
    if (type === "MESSAGE") return "Message";
    return "Unknown";
}

export function categoryLabel(category?: ReportCategory | null) {
    if (!category) return "-";

    const map: Record<ReportCategory, string> = {
        SPAM: "Spam",
        HARASSMENT: "Harassment",
        HATE_SPEECH: "Hate Speech",
        SEXUAL_CONTENT: "Sexual Content",
        VIOLENCE: "Violence",
        SELF_HARM: "Self Harm",
        SCAM: "Scam",
        IMPERSONATION: "Impersonation",
        PRIVACY_VIOLATION: "Privacy Violation",
        MISINFORMATION: "Misinformation",
        COPYRIGHT: "Copyright",
        OTHER: "Other",
    };

    return map[category] || category;
}

export function actionLabel(action?: ModerationActionType | null) {
    if (!action) return "-";

    const map: Record<ModerationActionType, string> = {
        NONE: "No Action",
        HIDE_CONTENT: "Hide Content",
        RESTORE_CONTENT: "Restore Content",
        DELETE_CONTENT: "Delete Content",
        LOCK_CONTENT: "Lock Content",
        WARN_USER: "Warn User",
        TEMP_BAN_USER: "Temporary Ban User",
        PERMANENT_BAN_USER: "Permanent Ban User",
        LIMIT_USER: "Limit User",
        DISMISS_REPORT: "Dismiss Report",
    };

    return map[action] || action;
}

export function resolutionLabel(resolution?: ReportResolution | null) {
    if (!resolution) return "-";

    const map: Record<ReportResolution, string> = {
        VALID: "Valid",
        INVALID: "Invalid",
        DUPLICATE: "Duplicate",
        NOT_ENOUGH_EVIDENCE: "Not Enough Evidence",
        AUTO_RESOLVED: "Auto Resolved",
    };

    return map[resolution] || resolution;
}

export function statusColor(status: ReportStatus) {
    if (status === "OPEN") return "danger";
    if (status === "TRIAGED") return "warning";
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