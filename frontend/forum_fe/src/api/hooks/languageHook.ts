import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import languageService from "@/api/services/languageService";
import type {
  CreateLanguageDTO,
  UpdateLanguageDTO,
  RemoveManyDTO,
} from "@/api/services/languageService";

/* ==================== QUERY ==================== */

export const useGetLanguages = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["languages"],
    queryFn: () => languageService.getAll(),
    enabled,
  });

export const useGetLanguageById = (id?: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ["language", id],
    queryFn: () => languageService.getById(id as string),
    enabled: !!id && enabled,
  });

/* ==================== MUTATION ==================== */

export const useCreateLanguages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: CreateLanguageDTO[] }) =>
      languageService.createMany(data),
  });
};

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLanguageDTO }) =>
      languageService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });
};

export const useDeleteLanguages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: function (ids: string[]) {
      return languageService.removeMany(ids);
    },
  });
};
