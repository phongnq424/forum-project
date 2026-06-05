export type VisualizerCategory =
    | "SEARCH"
    | "SORTING"
    | "GRAPH"
    | "DATA_STRUCTURE"
    | "DYNAMIC_PROGRAMMING";

export type VisualizerDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface VisualizerItem {
    slug: string;
    title: string;
    description: string;
    category: VisualizerCategory;
    difficulty: VisualizerDifficulty;
    estimatedTime: number;
    tags: string[];
    featured?: boolean;
}