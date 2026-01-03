import { useQuery, useMutation } from "@tanstack/react-query";
import topicService from "../services/topicService";

export function useGetTopic(page = 1, isEnable = true) {
  return useQuery({
    queryKey: ["topics", page],
    queryFn: (c) => topicService.getTopics(c.queryKey[1]),
    enabled: isEnable,
    refetchOnWindowFocus: false,
  });
}

export const useCreateTopics = () => {
  return useMutation({
    mutationFn: ({ data }) => {
      return topicService.createMany(
        data.filter(
          (item) =>
            item?.name?.trim().length >= 1 &&
            item?.category_id?.trim().length >= 1
        )
      );
    },
  });
};

// UPDATE
export const useUpdateTopic = () => {
  return useMutation({
    mutationFn: ({ id, data }) => topicService.update(id, data),
  });
};

// DELETE MANY
export const useDeleteTopics = () => {
  return useMutation({
    mutationFn: ({ ids }) => {
      return topicService.deleteMany(ids);
    },
  });
};
