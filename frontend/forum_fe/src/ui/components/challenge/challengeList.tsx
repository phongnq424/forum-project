import { useState, useMemo } from "react";
import { FilterPanel } from "./filterPanel";
import { ChallengeCard } from "./challengeCard";
import type { Challenge, Difficulty, Status } from "./mockData";

export type ChallengeListProps = {
  challenges: Challenge[];
};

export default function ChallengeList({ challenges }: ChallengeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status | "All">("All");

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      // Search filter
      if (
        searchQuery &&
        !challenge.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty && challenge.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "All" && challenge.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedDifficulty, selectedStatus]);

  const stats = useMemo(() => {
    const solved = challenges.filter((c) => c.status === "Solved").length;
    const attempted = challenges.filter((c) => c.status === "Attempted").length;
    return { total: challenges.length, solved, attempted };
  }, []);

  return (
    <>
      <div className="flex-1">
        <main className="container py-8">
          {/* Stats Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Coding Challenges
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">
                  {stats.total}
                </span>{" "}
                problems
              </span>
              <span>•</span>
              <span className="text-easy">
                <span className="font-semibold">{stats.solved}</span> solved
              </span>
              <span>•</span>
              <span className="text-medium">
                <span className="font-semibold">{stats.attempted}</span>{" "}
                attempted
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Filter Panel */}
            {/* <aside className="w-72 shrink-0">
              <div className="sticky top-20">
                <FilterPanel
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={setSelectedDifficulty}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
            </aside> */}

            {/* Challenge List */}
            <div className="flex-1 grid grid-cols-2 gap-3">
              {filteredChallenges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No challenges match your filters.
                </div>
              ) : (
                filteredChallenges.map((challenge, index) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    index={index}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
