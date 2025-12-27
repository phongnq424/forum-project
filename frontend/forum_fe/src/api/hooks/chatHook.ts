import { useMutation, useQuery } from "@tanstack/react-query";
import chatService from "../services/chatService";
import chatSocketService from "@/socket/chatSocketService";

export function useGetConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatService.getMyChats(),
  });
}

export function useGetMessages(conversationId: string) {
  return useQuery({
    queryKey: ["conversations-messages", conversationId],
    queryFn: (context) =>
      chatService.getMessages(context.queryKey[1] as string),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });
}

export function useJoinChat() {
  return useMutation({
    mutationFn: function ({ chatId }: { chatId: string }) {
      return Promise.resolve(chatSocketService.joinChat(chatId));
    },
  });
}

export function useLeaveChat() {
  return useMutation({
    mutationFn: function ({ chatId }: { chatId: string }) {
      return Promise.resolve(chatSocketService.leaveChat(chatId));
    },
  });
}

export function useOnReceiveNewMessage() {
  return useMutation({
    mutationFn: function ({
      onNewMessage,
    }: {
      onNewMessage: (...args: any[]) => void;
    }) {
      return Promise.resolve(chatSocketService.onNewMessage(onNewMessage));
    },
  });
}

export function useOffReceiveNewMessage() {
  return useMutation({
    mutationFn: function ({
      onNewMessage,
    }: {
      onNewMessage: (...args: any[]) => void;
    }) {
      return Promise.resolve(chatSocketService.offNewMessage(onNewMessage));
    },
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: function ({
      toUserId,
      content,
    }: {
      toUserId: string;
      content: string;
    }) {
      return chatService.sendMessage(toUserId, content);
    },
  });
}

export function useCreateChat() {
  return useMutation({
    mutationFn: function ({ toUserId }: { toUserId: string }) {
      return chatService.createChat(toUserId);
    },
  });
}
