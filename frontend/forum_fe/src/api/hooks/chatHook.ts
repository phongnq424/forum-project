import { useMutation, useQuery } from "@tanstack/react-query";
import chatService from "../services/chatService";
import chatSocketService from "@/socket/chatSocketService";

export function useGetConversations(isEnable: boolean = true) {
  return useQuery({
    queryKey: ["conversations", isEnable],
    queryFn: () => chatService.getMyChats(),
    enabled: isEnable,
  });
}

export function useGetMessages(conversationId: string, type: string) {
  return useQuery({
    queryKey: ["conversations-messages", conversationId, type],
    queryFn: (context) =>
      chatService.getMessages(
        context.queryKey[1] as string,
        context.queryKey[2] as string
      ),
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
      type,
    }: {
      toUserId: string;
      content: string;
      type: string;
    }) {
      return chatService.sendMessage(toUserId, content, type);
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

export function useCreateGroupChat() {
  return useMutation({
    mutationFn: function ({
      name,
      avatar,
      userIds,
    }: {
      name: string;
      avatar: string;
      userIds: string[];
    }) {
      return chatService.createGroupChat({
        name,
        avatar,
        userIds,
      });
    },
  });
}

export function useGetGroups(isEnable: boolean = true) {
  return useQuery({
    queryKey: ["groups", isEnable],
    queryFn: () => chatService.getMyGroups(),
    enabled: isEnable,
  });
}

export function useLeaveGroup() {
  return useMutation({
    mutationFn: ({ conversationId }: { conversationId: string }) =>
      chatService.leaveGroup(conversationId),
  });
}
