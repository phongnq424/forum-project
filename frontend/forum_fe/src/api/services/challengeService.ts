import General from "../../General/General";
import axiosClient from "../AxiosClient";

export interface ChallengeRequest {
  title: string;
  description: string;
  difficulty?: string;
  startDate?: string;
  endDate?: string;
}

const challengeService = {
  /* ================= CHALLENGE ================= */

  // ADMIN
  createChallenge: async function (request: ChallengeRequest) {
    try {
      const response = await axiosClient.post("/challenges", request);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // PUBLIC
  getChallenges: async function (page: number) {
    try {
      const response = await axiosClient.get("/challenges", {
        params: {
          page: page,
        },
      });
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // PUBLIC
  getChallengeById: async function (id: string) {
    try {
      const response = await axiosClient.get(`/challenges/${id}`);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // ADMIN
  updateChallenge: async function (
    id: string,
    request: Partial<ChallengeRequest>
  ) {
    try {
      const response = await axiosClient.put(`/challenges/${id}`, request);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // ADMIN
  deleteChallenge: async function (id: string) {
    try {
      const response = await axiosClient.delete(`/challenges/${id}`);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default challengeService;
