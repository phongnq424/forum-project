import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTestcaseZip } from "@/api/services/testcaseService";

interface UploadTestcaseParams {
  challengeId: string;
  file: File;
}

export function useUploadTestcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, file }: UploadTestcaseParams) =>
      uploadTestcaseZip(challengeId, file),
  });
}
