import { useContext, useEffect, useState } from "react";
import ConversationList from "@/ui/components/chat/conversationList.tsx";
import ChatArea from "@/ui/components/chat/chatArea.tsx";
import ProfilePanel from "@/ui/components/chat/profilePanel.tsx";
import AppContext from "../Context/AppContext";
import {
  useGetConversations,
  useGetMessages,
  useJoinChat,
  useLeaveChat,
  useOnReceiveNewMessage,
  useOffReceiveNewMessage,
  useSendMessage,
} from "@/api/hooks/chatHook.ts";
import LoadingScreen from "./LoadingScreen.jsx";
import { is } from "zod/v4/locales";
import { set } from "date-fns";

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function ChatPage() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [myConversations, setMyConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const getConversations = useGetConversations();
  const getMessages = useGetMessages(activeConversation?.conversationId || "");
  const joinChat = useJoinChat();
  const leaveChat = useLeaveChat();
  const onReceiveNewMessage = useOnReceiveNewMessage();
  const offReceiveNewMessage = useOffReceiveNewMessage();
  const sendMessage = useSendMessage();
  const appContext = useContext(AppContext);

  const onNewMessage = function (arg) {
    console.log("New message received from socket:", arg);
    const returnedMessage = arg;
    setMessages((prev) =>
      prev.map((msg, i) => {
        if (
          msg.status === "sending" &&
          msg.content === returnedMessage.content
        ) {
          return {
            sender: {
              id: returnedMessage.Sender.id,
              username: returnedMessage.Sender.username,
              avatar: returnedMessage.Sender.Profile.avatar,
            },
            id: returnedMessage.id,
            content: returnedMessage.content,
            isYours:
              returnedMessage.Sender.id == appContext?.currentUser?.user_id,
            time: returnedMessage.time,
            status: returnedMessage.is_read ? "read" : "sent",
          };
        }
        return msg;
      })
    );
  };

  useEffect(function () {
    console.warn(
      "Test:\n",
      "activeConversation:",
      activeConversation,
      "\n",
      "AppContext:",
      appContext,
      "\n",
      "Messages:",
      messages
    );
  });

  const handleSendMessage = function (content) {
    sendMessage.mutate({
      toUserId: activeConversation?.peer.id || "",
      content: content,
    });
    const newMessage = {
      sender: {
        id: appContext?.currentUser?.user_id,
        username: appContext?.currentUser?.username,
        avatar: appContext?.currentUser?.avatar,
      },
      id: "",
      content: content,
      isYours: true,
      time: null,
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  useEffect(
    function () {
      if (sendMessage.isError) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.status === "sending") {
              return {
                ...msg,
                status: "failed",
              };
            }
            return msg;
          })
        );
      }
    },
    [sendMessage.isSuccess, sendMessage.isError, sendMessage.data]
  );

  useEffect(
    function () {
      joinChat.mutate({ chatId: activeConversation?.conversationId || "" });
      onReceiveNewMessage.mutate({ onNewMessage });

      return function () {
        leaveChat.mutate({ chatId: activeConversation?.conversationId || "" });
        offReceiveNewMessage.mutate({ onNewMessage });
      };
    },
    [activeConversation]
  );

  useEffect(
    function () {
      if (getConversations.isSuccess) {
        setMyConversations(
          getConversations.data.map(function (con, i) {
            return {
              id: con.conversationId,
              name: con.name || con.peer.username,
              avatar: con.avatar,
              lastMessage: con.latestMsg.content,
              time: timeAgo(con.latestMsg.sent_at),
              unread: !con.is_read,
            };
          })
        );

        setActiveConversation(getConversations.data[0] || null);
      }
      if (getConversations.isError) {
        console.error("Error fetching conversations:", getConversations.error);
      }
    },
    [
      getConversations.data,
      getConversations.isSuccess,
      getConversations.isError,
    ]
  );

  useEffect(
    function () {
      if (getMessages.isSuccess) {
        setMessages(
          getMessages.data.map(function (msg, i) {
            return {
              sender: {
                id: msg.Sender.id,
                username: msg.Sender.username,
                avatar: msg.Sender.Profile.avatar,
              },
              id: msg.id,
              content: msg.content,
              isYours: msg.Sender.id == appContext?.currentUser?.user_id,
              time: msg.time,
              status: msg.is_read ? "read" : "sent",
            };
          })
        );
      }
      if (getMessages.isError) {
        console.error("Error fetching messages:", getMessages.error);
      }
    },
    [getMessages.data, getMessages.isSuccess, getMessages.isError]
  );

  if (getConversations.isLoading || getMessages.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-(--view-h) px-(--primary-padding) flex flex-col bg-background pt-2">
      <div className="flex-1 flex overflow-hidden rounded-2xl space-x-3">
        <ConversationList
          conversations={myConversations}
          activeId={activeConversation?.conversationId || ""}
          onSelect={setActiveConversation}
        />
        <ChatArea
          contactName={
            activeConversation?.name ??
            activeConversation?.peer?.username ??
            "Unknown"
          }
          contactAvatar={activeConversation?.avatar}
          messages={messages}
          isBlocked={isBlocked}
          onUnblock={() => setIsBlocked(false)}
          onHandleSendMessage={handleSendMessage}
        />
        <ProfilePanel
          name="Mohamed Salah"
          avatar="https://i.pravatar.cc/150?img=12"
        />
      </div>
    </div>
  );
}

export default ChatPage;
