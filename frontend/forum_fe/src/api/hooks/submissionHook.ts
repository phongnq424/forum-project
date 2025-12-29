import { useMutation, useQuery } from "@tanstack/react-query";
import submissionService from "../services/submissionService";

export function useSubmitCode() {
  return useMutation({
    mutationFn: (data: {
      challengeId: string;
      code: string;
      languageId: string;
    }) =>
      submissionService.submit({
        challenge_id: data.challengeId,
        code: data.code,
        language_id: data.languageId,
      }),
  });
}

export function useGetMySubmissionsByChallenge(challenge_id: string) {
  return useQuery({
    queryKey: ["submissions", "user", challenge_id],
    queryFn: (context) => {
      return submissionService.listByUserAndChallenge(
        context.queryKey[2] ?? ""
      );
    },
  });
}
