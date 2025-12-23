import { useMutation, useQuery } from "@tanstack/react-query";
import commentService from "../services/commentService";

export function useGetCommentsOfPost(postId) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: (context) => commentService.getCommentsOfPost(context.queryKey[1]),
    enabled: !!postId,
    refetchOnWindowFocus: false,
  });
}

export function useAddComment() {
  return useMutation({
    mutationFn: function (data) {
      return commentService.addComment(data.postId, data.parent, data.content);
    },
  });
}

export function useDeleteComment() {
  return useMutation({
    mutationFn: ({ cmtId }) => commentService.delete(cmtId),
  });
}

export function useUpdateComment() {
  return useMutation({
    mutationFn: ({ cmtId, content }) =>
      commentService.updateComment(cmtId, content),
  });
}
