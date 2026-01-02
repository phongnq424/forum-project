import { useQuery } from "@tanstack/react-query";
import leaderBoardService from "../services/leaderboardService";

export const useGetLeaderBoardByChallengeId = function (challengeId: string) {
  return useQuery({
    queryKey: ["leaderboard", challengeId],
    queryFn: function (context) {
      return leaderBoardService.getByChallenge(context.queryKey[1] ?? "");
    },
    enabled: !!challengeId,
  });
};
