import type { SubmissionStatus } from "$lib/types/submission.type";

export const submissionStatusColor: Record<string, string> = {
    PENDING: "bg-gray",
    RUNNING: "bg-blue",
    ACCEPTED: "bg-green",
    WA: "bg-red",
    TLE: "bg-orange",
    MLE: "bg-purple",
    CE: "bg-yellow",
    IE: "bg-gray"
};