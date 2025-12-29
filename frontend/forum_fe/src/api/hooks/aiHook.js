import { useMutation } from "@tanstack/react-query";
import aiService from "../services/aiService";

export function useChatbot() {
  return useMutation({
    mutationFn: async function ({ message }) {
      console.log(message);
      return await aiService.chatbot({ message });
    },
  });
}
