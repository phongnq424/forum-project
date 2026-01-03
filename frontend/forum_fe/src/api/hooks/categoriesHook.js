import { useQuery, useMutation } from "@tanstack/react-query";
import categoryService from "../services/categoryService";
import { fa } from "zod/v4/locales";

export const useGetCategories = function (page = 1) {
  return useQuery({
    queryKey: ["categories", page],
    queryFn: function (context) {
      return categoryService.getCategories(context.queryKey[1]);
    },
    refetchOnWindowFocus: false,
  });
};

export const useGetCategoryById = (id, enabled = true) =>
  useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryService.getById(id),
    enabled: !!id && enabled,
  });

/* ==================== MUTATION ==================== */

export const useCreateCategories = () => {
  return useMutation({
    mutationFn: ({ data }) => {
      categoryService.createMany(
        data.filter(function (item) {
          return item.name && item.name.trim().length > 0;
        })
      );
    }, // data: [{name, description}]
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
  });
};

export const useDeleteCategories = () => {
  return useMutation({
    mutationFn: ({ ids }) => categoryService.removeMany(ids),
  });
};
