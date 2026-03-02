import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    ToggleReactionResponse,
    Reaction
} from "$lib/types/reaction.type";

export const reactionService = {

    toggleReaction(postId: string)
        : Promise<ToggleReactionResponse> {

        return api.post(
            ENDPOINTS.REACTIONS.TOGGLE,
            null,
            {
                params: {
                    postId,
                    type: "LOVE"
                }
            }
        );
    },

    getReactionsByPost(postId: string)
        : Promise<Reaction[]> {

        return api.get(
            ENDPOINTS.REACTIONS.BY_POST(postId)
        );
    },

    getReactionsByUser(userId: string)
        : Promise<Reaction[]> {
        return api.get(
            ENDPOINTS.REACTIONS.BY_USER(userId)
        );
    }

};