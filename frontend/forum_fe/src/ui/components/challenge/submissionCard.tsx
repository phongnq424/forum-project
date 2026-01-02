import { cn } from "@/lib/utils";

type SubmissionStatus = "ACCEPTED" | "WA" | "TLE" | "MLE" | string;

interface SubmissionCardProps {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  score: number;
  code: string;
  languageName: string;
  onClick: (submission: {
    id: string;
    submittedAt: string;
    status: SubmissionStatus;
    score: number;
    code: string;
    languageName: string;
  }) => void;
}

const statusStyle: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700",
  WA: "bg-red-100 text-red-700",
};

export default function SubmissionCard({
  id,
  submittedAt,
  status,
  score,
  languageName,
  code,
  onClick,
}: SubmissionCardProps) {
  const statusClass = statusStyle[status] || "bg-yellow-100 text-yellow-700";

  return (
    <div
      className="flex items-center justify-between rounded-xl bg-black px-4 py-3 shadow-sm hover:cursor-pointer hover:bg-white/15"
      onClick={() =>
        onClick({
          id: id,
          submittedAt: submittedAt,
          status: status,
          score: score,
          code: code,
          languageName: languageName,
        })
      }
    >
      {/* Left */}
      <div className="flex flex-col space-y-2">
        <div className="text-xs text-muted-foreground">
          Submitted at: {submittedAt}
        </div>

        <div className="text-xs text-muted-foreground">
          Language: {languageName}
        </div>

        <span
          className={cn(
            "w-fit rounded-md px-2 py-0.5 text-xs font-semibold",
            statusClass
          )}
        >
          {status}
        </span>
      </div>

      {/* Right */}
      <div className="text-lg font-semibold">{score} pts</div>
    </div>
  );
}
