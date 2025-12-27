import General from "../../General/General";
import axiosClient from "../AxiosClient";

const chatService = {
  /* ================= CHAT 1-1 ================= */

  createChat: async function (toUserId: string) {
    try {
      const request = {
        userId: toUserId,
      };
      const response = await axiosClient.post("conversations/chat", request);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  getMyChats: async function () {
    try {
      const response = await axiosClient.get("conversations/chat/me");
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  getMessages: async function (conversationId: string) {
    try {
      const response = await axiosClient.get(
        `conversations/chat/${conversationId}/messages`
      );
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  sendMessage: async function (conversationId: string, content: string) {
    try {
      const request = {
        toUserId: conversationId,
        content: content,
      };

      const response = await axiosClient.post(
        "conversations/chat/messages",
        request
      );
      return response;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw General.createError(error);
    }
  },

  /* ================= GROUP ================= */

  leaveGroup: async function (conversationId: string) {
    try {
      const response = await axiosClient.post(`/group/${conversationId}/leave`);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default chatService;
