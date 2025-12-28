import { useContext, useEffect, useState } from "react";
import ConversationList from "@/ui/components/chat/conversationList.tsx";
import ChatArea from "@/ui/components/chat/chatArea.tsx";
import ProfilePanel from "@/ui/components/chat/profilePanel.tsx";
import AppContext from "../Context/AppContext";
import toastHelper from "../../helper/ToastHelper.jsx";
import {
  useGetConversations,
  useGetMessages,
  useJoinChat,
  useLeaveChat,
  useOnReceiveNewMessage,
  useOffReceiveNewMessage,
  useSendMessage,
  useGetGroups,
} from "@/api/hooks/chatHook.ts";
import LoadingScreen from "./LoadingScreen.jsx";
import General from "../../General/General.js";
function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const types = General.typesConversation.asArray();

function ChatPage() {
  const [typeConversation, setTypeConversation] = useState(types[0].name);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [myConversations, setMyConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const getConversations = useGetConversations(
    typeConversation === General.typesConversation.CHATS.name
  );
  const getMessages = useGetMessages(
    activeConversation?.conversationId || "",
    typeConversation
  );
  const joinChat = useJoinChat();
  const leaveChat = useLeaveChat();
  const onReceiveNewMessage = useOnReceiveNewMessage();
  const offReceiveNewMessage = useOffReceiveNewMessage();
  const sendMessage = useSendMessage();
  const appContext = useContext(AppContext);
  const getGroups = useGetGroups(
    typeConversation === General.typesConversation.GROUPS.name
  );

  const onNewMessage = function (arg) {
    console.log("New message received from socket:", arg);
    const returnedMessage = arg;

    if (returnedMessage.conversationId) {
      return;
    }

    if (!(returnedMessage.Sender?.id === appContext?.currentUser?.user_id)) {
      setMessages((prev) => [
        ...prev,
        {
          sender: {
            id: returnedMessage.Sender?.id,
            username: returnedMessage.Sender?.username,
            avatar: returnedMessage.Sender?.Profile?.avatar,
          },
          id: returnedMessage.id,
          content: returnedMessage.content,
          isYours:
            returnedMessage.Sender?.id === appContext?.currentUser?.user_id,
          time: new Date(returnedMessage.sent_at).toLocaleString(),
          status: returnedMessage.is_read ? "read" : "sent",
        },
      ]);
      return;
    }
  };

  useEffect(
    function () {
      if (getGroups.isSuccess) {
        console.log(getGroups.data);
      }
      if (getGroups.isError) {
        toastHelper.error(getGroups.error.message);
      }
    },
    [getGroups.isSuccess, getGroups.isError, getGroups.data]
  );

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
    let to = "";
    if (typeConversation === General.typesConversation.CHATS.name) {
      to = activeConversation?.peer?.id || "";
    } else if (typeConversation === General.typesConversation.GROUPS.name) {
      to = activeConversation?.conversationId;
    }

    sendMessage.mutate({
      toUserId: to,
      content: content,
      type: typeConversation,
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
      time: "Sending...",
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  useEffect(
    function () {
      if (sendMessage.isSuccess) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.status === "sending") {
              return {
                ...msg,
                status: "sent",
                time: new Date(
                  sendMessage.data.message.sent_at
                ).toLocaleString(),
              };
            }
            return msg;
          })
        );
      }
      if (sendMessage.isError) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.status === "sending") {
              return {
                ...msg,
                status: "failed",
                time: "Failed",
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
              id: con?.conversationId,
              name: con?.name || con?.peer?.username,
              avatar: con?.avatar,
              lastMessage: con?.latestMsg?.content,
              time: timeAgo(con?.latestMsg?.sent_at),
              unread: con?.unreadCount > 0,
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
      if (getGroups.isSuccess) {
        setMyConversations(
          getGroups.data.map(function (con, i) {
            return {
              id: con?.conversationId,
              name: con?.name || con?.peer?.username,
              avatar: con?.avatar,
              lastMessage: con?.latestMsg?.content,
              time: timeAgo(con?.latestMsg?.sent_at),
              unread: con?.unreadCount > 0,
            };
          })
        );

        setActiveConversation(getGroups.data[0] || null);
      }
      if (getGroups.isError) {
        console.error("Error fetching conversations:", getGroups.error);
      }
    },
    [getGroups.data, getGroups.isSuccess, getGroups.isError]
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
              time: new Date(msg.sent_at).toLocaleString(),
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

  if (getConversations.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-(--view-h) px-(--primary-padding) flex flex-col bg-background pt-2">
      <div className="flex-1 flex overflow-hidden rounded-2xl space-x-3">
        <ConversationList
          conversations={myConversations}
          activeId={activeConversation?.conversationId || ""}
          onSelect={(id) => {
            if (typeConversation === General.typesConversation.CHATS.name) {
              setActiveConversation(
                getConversations.data?.find((c) => c.conversationId === id) ??
                  getConversations.data[0]
              );
            } else if (
              typeConversation === General.typesConversation.GROUPS.name
            ) {
              setActiveConversation(
                getGroups.data?.find((c) => c.conversationId === id) ??
                  getGroups.data[0]
              );
            }
          }}
          typeConversation={typeConversation}
          setTypeConversation={setTypeConversation}
          types={types}
        />

        {getMessages.isLoading && <LoadingScreen />}
        {!getMessages.isLoading && (
          <>
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
              name={
                typeConversation === General.typesConversation.CHATS.name
                  ? activeConversation?.peer?.username
                  : typeConversation === General.typesConversation.GROUPS.name
                  ? activeConversation?.name
                  : ""
              }
              avatar={
                typeConversation === General.typesConversation.CHATS.name
                  ? activeConversation?.avatar
                  : typeConversation === General.typesConversation.GROUPS.name
                  ? activeConversation?.avatar
                  : ""
              }
              type={typeConversation}
              userId={activeConversation?.peer?.id}
              conversationId={activeConversation?.conversationId}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
