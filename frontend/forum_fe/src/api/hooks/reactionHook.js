import { useMutation } from "@tanstack/react-query";
import reactionService from "../services/reactionService";

export function useToggleReaction(postId, typeReaction) {
  return useMutation({
    mutationFn: ({ postId, typeReaction }) => {
      console.warn(postId + " " + typeReaction);
      return reactionService.toggle(postId, typeReaction);
    },
  });
}
