import { postService } from "$lib/services/post.service";
import type { PageLoad } from "./$types";

type PostListResult = Awaited<ReturnType<typeof postService.listPosts>>;

export const load: PageLoad = async ({ fetch }) => {
    try {
        const initialPosts = await Promise.race<PostListResult>([
            postService.listPosts(
                { page: 1, limit: 10, sortBy: "Newest" },
                fetch,
            ),
            new Promise<PostListResult>((_, reject) => {
                setTimeout(
                    () => reject(new Error("Initial posts loading timeout")),
                    8000,
                );
            }),
        ]);

        return {
            initialPosts,
            error: null,
        };
    } catch (e) {
        console.warn("Failed to load initial posts:", e);

        return {
            initialPosts: {
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0,
                },
            },
            error: "Failed to load posts",
        };
    }
};