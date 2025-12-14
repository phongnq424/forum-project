import { useState } from "react";
import ConversationList from "@/ui/components/chat/conversationList.tsx";
import ChatArea from "@/ui/components/chat/chatArea.tsx";
import ProfilePanel from "@/ui/components/chat/profilePanel.tsx";

const conversations = [
  {
    id: "1",
    name: "Monkey D. Luffy",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Hey, Can you solve this ...",
    time: "1d",
    unread: true,
  },
  {
    id: "2",
    name: "Monkey D. Luffy",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Hey, Can you solve this ...",
    time: "1d",
    unread: true,
  },
  {
    id: "3",
    name: "Monkey D. Luffy",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Hey, Can you solve this ...",
    time: "1d",
    unread: true,
  },
  {
    id: "4",
    name: "Monkey D. Luffy",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Hey, Can you solve this ...",
    time: "1d",
    unread: false,
  },
  {
    id: "5",
    name: "Monkey D. Luffy",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Hey, Can you solve this ...",
    time: "1w",
    unread: false,
  },
];

const messages = [
  {
    id: "1",
    content:
      "Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc a Abc Abc Abc Abc Abcdefgh",
    sent: false,
    time: "10:30",
    status: "read",
  },
  {
    id: "2",
    content:
      "Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc a Abc Abc Abc Abc Abc Abcdefgh",
    sent: true,
    time: "10:32",
    status: "read",
  },
  {
    id: "3",
    content: "Abc Abc",
    sent: true,
    time: "10:33",
    status: "read",
  },
  {
    id: "4",
    content: "Abc",
    sent: false,
    time: "10:35",
    status: "read",
  },
  {
    id: "5",
    content: "Abc",
    sent: false,
    time: "10:35",
    status: "read",
  },
  {
    id: "6",
    content:
      "Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc Abc a Abc Abc Abc Abc Abc Abcdefgh",
    sent: true,
    time: "10:40",
    status: "read",
  },
  {
    id: "7",
    content: "Abc",
    sent: true,
    time: "10:41",
    status: "read",
  },
  {
    id: "8",
    content: "Abc",
    sent: true,
    time: "10:42",
    status: "read",
  },
];

function ChatPage() {
  const [activeConversation, setActiveConversation] = useState("1");
  const [isBlocked, setIsBlocked] = useState(false);

  return (
    <div className="h-(--view-h) px-(--primary-padding) flex flex-col bg-background pt-2">
      <div className="flex-1 flex overflow-hidden rounded-2xl space-x-3">
        <ConversationList
          conversations={conversations}
          activeId={activeConversation}
          onSelect={setActiveConversation}
        />
        <ChatArea
          contactName="Mohamed Salah"
          contactAvatar="https://i.pravatar.cc/150?img=12"
          messages={messages}
          isBlocked={isBlocked}
          onUnblock={() => setIsBlocked(false)}
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
