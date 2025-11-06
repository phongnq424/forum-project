import { useQuery } from "@tanstack/react-query";
import categoryService from "../services/categoryService";

export const useGetCategories = function () {
  return useQuery({
    queryKey: ["categories"],
    queryFn: function () {
      return categoryService.getCategories();
    },
  });
};
