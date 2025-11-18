import { useMutation, useQuery } from "@tanstack/react-query";
import postService from "../services/postService";

export function useCreatePost() {
  return useMutation({
    mutationFn: (data) => {
      return postService.createPost(data);
    },
  });
}

export function useGetPosts(page, selectedCateId) {
  return useQuery({
    queryKey: ["post", page, selectedCateId],
    queryFn: (context) =>
      postService.getPosts(context.queryKey[1], context.queryKey[2]),
    refetchOnWindowFocus: false,
  });
}

export function useGetPostById(postId) {
  return useQuery({
    queryKey: ["detail-post", postId],
    queryFn: function (context) {
      return postService.getPostById(context.queryKey[1]);
    },
    enabled: !!postId,
    refetchOnWindowFocus: false,
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

export function useGetPostsOfUser(userId, page, limit) {
  return useQuery({
    queryKey: ["post_of_user", userId, page, limit],
    queryFn: (context) =>
      postService.getPostOfUser(
        context.queryKey[1],
        context.queryKey[2],
        context.queryKey[3]
      ),
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePost() {
  return useMutation({
    mutationFn: function (data) {
      return postService.update(data);
    },
  });
}

export function useGetPostBySearchKey(searchKey, selectedCategoryId) {
  return useQuery({
    queryKey: ["posts", searchKey, selectedCategoryId],
    queryFn: function (context) {
      return postService.useGetPostBySearchKey(
        context.queryKey[1],
        context.queryKey[2]
      );
    },
    enabled: searchKey != "",
  });
}
