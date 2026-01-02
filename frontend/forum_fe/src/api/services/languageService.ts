import axiosClient from "@/api/AxiosClient";
import General from "@/General/General";

export interface CreateLanguageDTO {
  name: string;
  code: string;
}

export interface UpdateLanguageDTO {
  name?: string;
  code?: string;
}

export interface RemoveManyDTO {
  ids: string[];
}

const languageService = {
  // GET /languages
  getAll: async (): Promise<any> => {
    try {
      const res = await axiosClient.get("/languages");
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // GET /languages/:id
  getById: async (id: string): Promise<any> => {
    try {
      const res = await axiosClient.get(`/languages/${id}`);
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // POST /languages (ADMIN)
  createMany: async (data: CreateLanguageDTO[]): Promise<any> => {
    try {
      const res = await axiosClient.post("/languages", data);
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // PUT /languages/:id (ADMIN)
  update: async (id: string, data: UpdateLanguageDTO): Promise<any> => {
    try {
      const res = await axiosClient.put(`/languages/${id}`, data);
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // DELETE /languages (ADMIN)
  removeMany: async (ids: string[]): Promise<any> => {
    try {
      const res = await axiosClient.delete<{ message: string }>("/languages", {
        data: { ids } satisfies RemoveManyDTO,
      });
      return res;
    } catch (error) {
      General.createError(error);
    }
  },
};

export default languageService;
