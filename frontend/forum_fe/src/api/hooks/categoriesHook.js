import { useQuery } from "@tanstack/react-query";
import categoryService from "../services/categoryService";
import { fa } from "zod/v4/locales";

export const useGetCategories = function () {
  return useQuery({
    queryKey: ["categories"],
    queryFn: function () {
      return categoryService.getCategories();
    },
    refetchOnWindowFocus: false,
  });
};
