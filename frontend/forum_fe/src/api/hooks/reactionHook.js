import { useMutation } from "@tanstack/react-query";
import reactionService from "../services/reactionService";

export function useToggleReaction() {
  return useMutation({
    mutationFn: ({ postId, typeReaction }) => {
      return reactionService.toggle(postId, typeReaction);
    },
  });
}
