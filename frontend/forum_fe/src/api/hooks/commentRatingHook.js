import { useMutation } from "@tanstack/react-query";
import commentRatingService from "../services/commentRatingService";

export function useRateComment() {
  return useMutation({
    mutationFn: (data) =>
      commentRatingService.rate(data.commentId, data.rating),
  });
}
