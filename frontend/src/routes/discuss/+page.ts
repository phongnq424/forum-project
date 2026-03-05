import { postService } from "$lib/services/post.service";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    try {
        const initialPosts = await postService.listPosts({ page: 1, limit: 10, sortBy: "Newest" }, fetch);
        return { initialPosts };
    } catch (e) {
        throw error(404, "Post not found");
    }
};