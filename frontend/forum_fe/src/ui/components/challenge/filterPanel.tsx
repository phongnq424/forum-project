import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Difficulty, type Status, tags } from "./mockData";

interface FilterPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDifficulty: Difficulty | null;
  onDifficultyChange: (difficulty: Difficulty | null) => void;
  selectedStatus: Status | "All";
  onStatusChange: (status: Status | "All") => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];
const statuses: (Status | "All")[] = [
  "All",
  "Solved",
  "Attempted",
  "Not Started",
];

export function FilterPanel({
  searchQuery,
  onSearchChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  selectedTags,
  onTagsChange,
}: FilterPanelProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const displayedTags = showAllTags ? tags : tags.slice(0, 8);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onSearchChange("");
    onDifficultyChange(null);
    onStatusChange("All");
    onTagsChange([]);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDifficulty ||
    selectedStatus !== "All" ||
    selectedTags.length > 0;

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border border-border">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search
        </label>
        <Input
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-input border-border"
        />
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Difficulty
        </label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => (
            <Badge
              key={difficulty}
              variant={
                selectedDifficulty === difficulty ? "secondary" : "default"
              }
              onClick={() =>
                onDifficultyChange(
                  selectedDifficulty === difficulty ? null : difficulty
                )
              }
              className="cursor-pointer"
            >
              {difficulty}
            </Badge>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Status</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Badge
              key={status}
              variant={selectedStatus === status ? "secondary" : "default"}
              onClick={() => onStatusChange(status)}
              className="cursor-pointer"
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Tags</label>
        <div className="flex flex-wrap gap-2">
          {displayedTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "secondary" : "default"}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        {tags.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showAllTags ? "Show less" : `Show ${tags.length - 8} more`}
          </Button>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <Filter className="w-4 h-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );
}
