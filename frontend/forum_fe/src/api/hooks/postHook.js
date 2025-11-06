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
