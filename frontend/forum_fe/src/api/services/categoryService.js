import { da } from "zod/v4/locales";
import General from "../../General/General";
import axiosClient from "../AxiosClient";

const categoryService = {
  getCategories: async function (page) {
    try {
      const response = await axiosClient.get("/categories", {
        params: {
          page: page,
        },
      });
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  getById: async (id) => {
    try {
      const res = await axiosClient.get(`/categories/${id}`);
      return res.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      General.createError(error);
    }
  },

  // POST /categories (ADMIN) - tạo nhiều
  createMany: async (data) => {
    try {
      const res = await axiosClient.post("/categories", data);
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // PUT /categories/:id (ADMIN)
  update: async (id, data) => {
    try {
      const res = await axiosClient.put(`/categories/${id}`, data);
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // DELETE /categories (ADMIN) - xóa nhiều
  removeMany: async (ids) => {
    try {
      console.log(ids);
      const res = await axiosClient.delete("/categories", {
        data: { ids },
      });
      return res; // { deletedCount: number }
    } catch (error) {
      General.createError(error);
    }
  },
};

export default categoryService;
