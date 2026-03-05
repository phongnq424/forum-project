// routes/discuss/[id]/+page.ts
import { postService } from "$lib/services/post.service";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
    try {

        const post = await postService.getPost(params.id, fetch);
        if (!post) throw error(404, "Post not found");
        return { post };
    } catch (e) {
        throw error(404, "Post not found");
    }
};