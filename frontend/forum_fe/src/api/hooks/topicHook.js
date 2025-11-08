import { useQuery } from "@tanstack/react-query";
import topicService from "../services/topicService";

export function useGetTopic(isEnable) {
  return useQuery({
    queryKey: ["topics"],
    queryFn: () => topicService.getTopics(),
    enabled: isEnable,
  });
}
