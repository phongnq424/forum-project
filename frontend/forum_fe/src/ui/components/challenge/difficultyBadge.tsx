import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "./mockData";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variantMap: Record<string, "easy" | "medium" | "hard"> = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
  };

  const variant = variantMap[difficulty.toLowerCase()] || "easy";

  return (
    <Badge className="border-none text-sm" variant={variant}>
      {difficulty}
    </Badge>
  );
}
