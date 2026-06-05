import type { VisualizerItem } from "$lib/types/visualizer.type";

export const visualizers: VisualizerItem[] = [
    {
        slug: "binary-search",
        title: "Binary Search",
        description:
            "Visualize how low, mid and high pointers move inside a sorted array.",
        category: "SEARCH",
        difficulty: "EASY",
        estimatedTime: 10,
        tags: ["Array", "Search", "Divide and Conquer"],
        featured: true,
    },
    {
        slug: "dijkstra",
        title: "Dijkstra Algorithm",
        description:
            "Create nodes, connect weighted edges and visualize shortest path relaxation step by step.",
        category: "GRAPH",
        difficulty: "MEDIUM",
        estimatedTime: 25,
        tags: ["Graph", "Shortest Path", "Weighted Graph"],
        featured: true,
    },
    {
        slug: "bfs",
        title: "Breadth-First Search",
        description:
            "Explore graph traversal level by level using a queue-based visualization.",
        category: "GRAPH",
        difficulty: "EASY",
        estimatedTime: 15,
        tags: ["Graph", "Queue", "Traversal"],
    },
    {
        slug: "dfs",
        title: "Depth-First Search",
        description:
            "Visualize recursive and stack-based graph traversal through connected nodes.",
        category: "GRAPH",
        difficulty: "EASY",
        estimatedTime: 15,
        tags: ["Graph", "Stack", "Traversal"],
    },
    {
        slug: "merge-sort",
        title: "Merge Sort",
        description:
            "Visualize divide, conquer and merge phases of merge sort.",
        category: "SORTING",
        difficulty: "MEDIUM",
        estimatedTime: 18,
        tags: ["Sorting", "Recursion", "Divide and Conquer"],
    },
    {
        slug: "stack-queue",
        title: "Stack and Queue",
        description:
            "Visualize push, pop, enqueue and dequeue operations.",
        category: "DATA_STRUCTURE",
        difficulty: "EASY",
        estimatedTime: 12,
        tags: ["Stack", "Queue", "Data Structure"],
    },
];