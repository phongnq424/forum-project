import General from "@/General/General";
import axiosClient from "../AxiosClient";

const leaderBoardService = {
  getByChallenge: async function (challengeId: string) {
    try {
      const response = await axiosClient.get(`leaderboards/${challengeId}`);
      return response;
    } catch (error) {
      General.createError(error);
    }
  },
};

export default leaderBoardService;
