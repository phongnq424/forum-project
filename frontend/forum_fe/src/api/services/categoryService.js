import General from "../../General/General";
import axiosClient from "../AxiosClient";

const categoryService = {
  getCategories: async function () {
    try {
      const response = await axiosClient.get("/categories");
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default categoryService;
