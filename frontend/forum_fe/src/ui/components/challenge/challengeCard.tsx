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
        {/* Main Content */}
        <div className="flex flex-col items-center gap-3 mb-2 justify-between flex-1">
          <p className="text-white/70 text-sm">#{challenge.id}</p>
          <h3 className="text-white font-medium truncate text-xl overflow-hidden ">
            {challenge.title}
          </h3>
        </div>

        {/* Right Side: Difficulty & Acceptance */}
        <div className="flex flex-col items-center gap-3 mb-2 justify-between basis-[20%]">
          <div className="flex items-center gap-4 shrink-0">
            <DifficultyBadge difficulty={challenge.difficulty} />
          </div>
          <h3 className="text-white/50 font-medium text-sm flex justify-center">
            {challenge.createAt.toLocaleDateString()}
          </h3>
        </div>
      </div>
    </Link>
  );
}
