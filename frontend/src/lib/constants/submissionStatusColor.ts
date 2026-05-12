import type { SubmissionStatus } from "$lib/types/submission.type";

export const submissionStatusColor: Record<string, string> = {
    ACCEPTED: "bg-green",
    PARTIAL: "bg-blue",
    WA: "bg-red",
    CE: "bg-orange",
    RE: "bg-orange",
    TLE: "bg-yellow",
    MLE: "bg-purple",
    IE: "bg-gray",
    PENDING: "bg-gray",
    RUNNING: "bg-blue",
};