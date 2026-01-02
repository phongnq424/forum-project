import { useMutation, useQuery } from "@tanstack/react-query";
import challengeService, {
  type ChallengeRequest,
} from "../services/challengeService";

/* ================= QUERY ================= */

// GET /challenges
export function useGetChallenges(page: number, isEnable: boolean = true) {
  return useQuery({
    queryKey: ["challenges", page],
    queryFn: () => challengeService.getChallenges(page),
    enabled: isEnable,
  });
}

// GET /challenges/:id
export function useGetChallengeById(id: string, isEnable: boolean = true) {
  return useQuery({
    queryKey: ["challenge", id],
    queryFn: () => challengeService.getChallengeById(id),
    enabled: !!id && isEnable,
  });
}

/* ================= MUTATION ================= */

// POST /challenges (ADMIN)
export function useCreateChallenge() {
  return useMutation({
    mutationFn: (data: ChallengeRequest) =>
      challengeService.createChallenge(data),
  });
}

// PUT /challenges/:id (ADMIN)
export function useUpdateChallenge() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ChallengeRequest>;
    }) => challengeService.updateChallenge(id, data),
  });
}

// DELETE /challenges/:id (ADMIN)
export function useDeleteChallenge() {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      challengeService.deleteChallenge(id),
  });
}
