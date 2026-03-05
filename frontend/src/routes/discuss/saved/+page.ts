// routes/discuss/[id]/+page.ts
import { postSaveService } from "$lib/services/postSaved.service";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
    try {
        const post = await postSaveService.getSavedPosts({ page: 1, limit: 10 }, fetch);
        if (!post) throw error(404, "Post not found");
        return { post };
    } catch (e) {
        throw error(404, "Post not found");
    }
};