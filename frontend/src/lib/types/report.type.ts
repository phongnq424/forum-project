export type ReportStatus =
    | "OPEN"
    | "TRIAGED"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReportTargetType = "USER" | "POST" | "COMMENT" | "MESSAGE";

export type ReportCategory =
    | "SPAM"
    | "HARASSMENT"
    | "HATE_SPEECH"
    | "SEXUAL_CONTENT"
    | "VIOLENCE"
    | "SELF_HARM"
    | "SCAM"
    | "IMPERSONATION"
    | "PRIVACY_VIOLATION"
    | "MISINFORMATION"
    | "COPYRIGHT"
    | "OTHER";

export type ReportResolution =
    | "VALID"
    | "INVALID"
    | "DUPLICATE"
    | "NOT_ENOUGH_EVIDENCE"
    | "AUTO_RESOLVED";

export type ModerationActionType =
    | "NONE"
    | "HIDE_CONTENT"
    | "RESTORE_CONTENT"
    | "DELETE_CONTENT"
    | "LOCK_CONTENT"
    | "WARN_USER"
    | "TEMP_BAN_USER"
    | "PERMANENT_BAN_USER"
    | "LIMIT_USER"
    | "DISMISS_REPORT";

export type ModerationSignalType =
    | "USER_REPORT"
    | "REPORT_COUNT"
    | "REPORTER_TRUST"
    | "AI_TEXT_SCORE"
    | "AI_IMAGE_SCORE"
    | "TARGET_AUTHOR_HISTORY"
    | "TARGET_VELOCITY"
    | "DUPLICATE_REPORT"
    | "RATE_LIMIT_TRIGGER";

export interface ReportUserSummary {
    id: string;
    username?: string | null;
    fullname?: string | null;
    avatar?: string | null;
    status?: string | null;
}

export interface ReportTargetPreview {
    id: string;
    user_id?: string | null;
    sender_id?: string | null;
    conversation_id?: string | null;
    post_id?: string | null;
    username?: string | null;
    fullname?: string | null;
    avatar?: string | null;
    status?: string | null;
    title?: string | null;
    content?: string | null;
    comment_detail?: string | null;
    moderation_status?: string | null;
    moderation_reason?: string | null;
    is_deleted?: boolean | null;
    created_at?: string | null;
    sent_at?: string | null;
    User?: ReportUserSummary | null;
    Sender?: ReportUserSummary | null;
}

export interface CreateReportPayload {
    target_type: ReportTargetType;
    target_id: string;
    category: ReportCategory;
    reason: string;
    evidence?: string | null;
}

export interface Report {
    id: string;
    case_id: string;
    reporter_id: string;
    category: ReportCategory;
    reason: string;
    evidence?: string | null;
    reporter_ip?: string | null;
    user_agent?: string | null;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    Reporter?: ReportUserSummary | null;
    Case?: ReportCase | null;
}

export interface ReporterTrust {
    id: string;
    user_id: string;
    trust_score: number;
    valid_reports: number;
    invalid_reports: number;
    total_reports: number;
    last_reported_at?: string | null;
    cooldown_until?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ModerationSignal {
    id: string;
    case_id: string;
    type: ModerationSignalType;
    score: number;
    weight: number;
    metadata?: Record<string, unknown> | null;
    created_at: string;
}

export interface ModerationActionLog {
    id: string;
    case_id: string;
    actor_id?: string | null;
    action: ModerationActionType;
    previous_status?: ReportStatus | null;
    new_status?: ReportStatus | null;
    previous_data?: Record<string, unknown> | null;
    new_data?: Record<string, unknown> | null;
    reason?: string | null;
    created_at: string;
    Actor?: ReportUserSummary | null;
}

export interface ReportCase {
    id: string;
    active_key?: string | null;
    target_type: ReportTargetType;
    target_id: string;
    status: ReportStatus;
    severity: ReportSeverity;
    priority_score: number;
    report_count: number;
    category_main?: ReportCategory | null;
    categories: ReportCategory[];
    is_auto_hidden: boolean;
    auto_action_at?: string | null;
    assigned_to_id?: string | null;
    resolved_by_id?: string | null;
    resolution?: ReportResolution | null;
    action_taken?: ModerationActionType | null;
    moderator_note?: string | null;
    first_reported_at: string;
    last_reported_at: string;
    created_at: string;
    updated_at: string;
    resolved_at?: string | null;
    closed_at?: string | null;
    Reports?: Report[];
    Signals?: ModerationSignal[];
    ActionLogs?: ModerationActionLog[];
    AssignedTo?: ReportUserSummary | null;
    ResolvedBy?: ReportUserSummary | null;
    target?: ReportTargetPreview | null;
}

export interface ReportListParams {
    page?: number;
    limit?: number;
    category?: ReportCategory | "";
}

export interface ReportCaseListParams {
    page?: number;
    limit?: number;
    status?: ReportStatus | "";
    severity?: ReportSeverity | "";
    target_type?: ReportTargetType | "";
    category?: ReportCategory | "";
    assigned_to_id?: string;
    sortBy?: "oldest" | "priority";
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ReportListResponse {
    data: Report[];
    meta: PaginationMeta;
}

export interface ReportCaseListResponse {
    data: ReportCase[];
    meta: PaginationMeta;
}

export interface AssignCaseResponse {
    data: ReportCase;
}

export interface ApplyModerationActionPayload {
    action: ModerationActionType;
    note?: string | null;
}

export interface ResolveReportCasePayload {
    resolution: ReportResolution;
    action?: ModerationActionType;
    note?: string | null;
}

export interface CloseReportCasePayload {
    note?: string | null;
}

export interface ApiMessageResponse<T> {
    message: string;
    data: T;
}

export interface ApiListResponse<T> {
    message: string;
    data: T[];
    meta: PaginationMeta;
}