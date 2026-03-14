
export type SubmissionStatus =
    | "PENDING"
    | "RUNNING"
    | "ACCEPTED"
    | "WA"
    | "TLE"
    | "MLE"
    | "CE"
    | "IE";

/**
 * Base submission entity
 */
export interface Submission {
    id: string;
    challenge_id: string;
    user_id: string;
    language_id: string;

    code: string;

    score: number | null;
    status: SubmissionStatus;

    submitted_at: string;
}

export interface SubmitPayload {
    challenge_id: string;
    language_id: string;
    code: string;
}

export interface SubmitResponse {
    id: string;
    status: "PENDING";
}

export type SubmissionListResponse = Submission[];

export interface SubmissionDetail extends Submission {
    Challenge?: {
        id: string;
        title: string;
        time_limit: number;
    };

    Language?: {
        id: string;
        name: string;
        code: string;
    };

    User?: {
        id: string;
        email: string;
        username: string;
    };
}

export interface TestcaseResult {
    testcaseId: string;
    result: SubmissionStatus;
    score: number;
}

/**
 * Payload worker gửi về backend
 */
export interface SubmissionResultPayload {
    submissionId: string;
    score: number;
    status: SubmissionStatus;
    testcases: TestcaseResult[];
}
