import { useMutation, useQuery } from "@tanstack/react-query";
import postService from "../services/postService";

export function useCreatePost() {
  return useMutation({
    mutationFn: (data) => {
      return postService.createPost(data);
    },
  });
}

export function useGetPosts() {
  return useQuery({
    queryKey: ["post"],
    queryFn: () => postService.getPosts(),
  });
}

export function useGetPostById(postId) {
  return useQuery({
    queryKey: ["detail-post", postId],
    queryFn: function (context) {
      return postService.getPostById(context.queryKey[1]);
    },
    enabled: !!postId,
  });
}

export function useSavePost() {
  return useMutation({
    mutationFn: (data) => {
      return postService.save(data.postId);
    },
  });
}

export function useDeletePost() {
  return useMutation({
    mutationFn: ({ postId }) => postService.delete(postId),
  });
}
