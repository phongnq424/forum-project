import axiosClient from "@/api/AxiosClient";
import General from "@/General/General";

const submissionService = {
  // POST /submissions
  submit: async (data: {
    challenge_id: string;
    code: string;
    language_id: string;
  }): Promise<any> => {
    try {
      console.log(data);
      const res = await axiosClient.post("/submissions", data);
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // GET /submissions/:id
  getById: async (id: string): Promise<any> => {
    try {
      const res = await axiosClient.get(`/submissions/${id}`);
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // GET /submissions/challenge/:challenge_id
  listByChallenge: async (challengeId: string): Promise<any> => {
    try {
      const res = await axiosClient.get(
        `/submissions/challenge/${challengeId}`
      );
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // GET /submissions/user/:user_id
  listByUser: async (user_id: string): Promise<any> => {
    try {
      const res = await axiosClient.get(`/submissions/user/${user_id}`);
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },

  // GET /submissions/user/:user_id/challenge/:challenge_id
  listByUserAndChallenge: async (
    challengeId: string,
    user_id: string
  ): Promise<any> => {
    try {
      const res = await axiosClient.get(
        `/submissions/user/${user_id}/challenge/${challengeId}`
      );

      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default submissionService;
