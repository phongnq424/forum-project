import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/ui/components/challenge/difficultyBadge";
import { StatusIcon } from "@/ui/components/challenge/statusIcon";
import type { Challenge } from "./mockData";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
}

export function ChallengeCard({ challenge, index }: ChallengeCardProps) {
  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className={cn(
        "block p-4 rounded-lg bg-white/10 hover:bg-white/20",
        "transition-all duration-200 hover:shadow-md",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <StatusIcon status={challenge.status} />

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-white/70 text-sm">#{challenge.id}</span>
            <h3 className="text-white font-medium truncate">
              {challenge.title}
            </h3>
          </div>

          <h3 className="text-white/50 font-medium text-[12px]">
            {challenge.createAt.toLocaleDateString()}
          </h3>
        </div>

        {/* Right Side: Difficulty & Acceptance */}
        <div className="flex items-center gap-4 shrink-0">
          <DifficultyBadge difficulty={challenge.difficulty} />
        </div>
      </div>
    </Link>
  );
}
