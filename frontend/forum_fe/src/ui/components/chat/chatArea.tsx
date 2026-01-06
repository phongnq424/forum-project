import {
  Phone,
  Video,
  AlertCircle,
  Check,
  CheckCheck,
  LoaderCircle,
  CircleCheckBig,
  Eye,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IoMdSend } from "react-icons/io";
import { useEffect, useRef, useState } from "react";

interface Message {
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  id: string;
  content: string;
  isYours: boolean;
  time: string;
  status: "sent" | "sending" | "read" | "fail";
}

interface ChatAreaProps {
  contactName: string;
  contactAvatar: string;
  messages: Message[];
  isBlocked?: boolean;
  onUnblock?: () => void;
  onHandleSendMessage?: (content: string) => void;
}

const ChatArea = ({
  contactName,
  contactAvatar,
  messages,
  isBlocked,
  onUnblock,
  onHandleSendMessage,
}: ChatAreaProps) => {
  const [content, setContent] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  function handleSendMessage() {
    console.log("Sending message:", content);
    onHandleSendMessage?.(content);
    setContent("");
  }

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white/15  rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 shadow-sm shadow-white/50 rounded-2xl">
        <div className="flex items-center gap-3">
          <img
            src={contactAvatar}
            alt={contactName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {contactName}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <a
            className="text-muted-foreground hover:text-foreground transition-colors"
            href="../../../videoCall/videoCall.html"
            target="blank"
          >
            <Video className="w-5 h-5" />
          </a>
          <button className="w-8 h-8 rounded-full border-2 border-muted-foreground flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto py-6 px-3 space-y-4 scrollbar-thin"
        ref={messagesContainerRef}
      >
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2 animate-fade-in",
              message.isYours ? "justify-end" : "justify-start"
            )}
          >
            {!message.isYours && (
              <img
                src={message.sender.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div
              className={cn(
                "max-w-md px-4 pt-3 pb-1 rounded-2xl",
                message.isYours
                  ? "bg-proPurple text-white rounded-br-md"
                  : "bg-proPurple text-white rounded-bl-md"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-[10px] text-white/40">{message.time}</p>
            </div>
            {message.isYours && (
              <div className="text-proPurple">
                {message.status === "sending" && (
                  <LoaderCircle className="w-4 h-4" />
                )}
                {message.status === "sent" && (
                  <CircleCheckBig className="w-4 h-4" />
                )}
                {message.status === "read" && <Eye className="w-4 h-4" />}
                {message.status === "fail" && (
                  <Ban className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Blocked Banner */}
      {isBlocked && (
        <div className="flex items-center justify-center gap-4 p-3 bg-transparent border-t-2 border-white/50 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-sm text-white">
              You have blocked this user
            </span>
          </div>
          <button
            onClick={onUnblock}
            className="px-4 py-1.5 bg-black hover:opacity-50 rounded-full text-sm font-medium text-foreground transition-colors"
          >
            Unblock
          </button>
        </div>
      )}

      {!isBlocked && (
        <div className="flex items-center gap-2 w-full p-3 bg-transparent border-t-2 border-white/50 rounded-2xl ">
          <textarea
            ref={textAreaRef}
            placeholder="Add your message"
            value={content}
            className="w-full py-2 px-3 max-h-[200px] overflow-y-auto text-[16px] outline-none text-white resize-none rounded-lg bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear"
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height =
                Math.min(e.currentTarget.scrollHeight, 200) + "px";
            }}
            onKeyDown={function (e) {
              if (e.key == "Enter" && !content.trim()) {
                e.preventDefault();
                return;
              }
              if (e.key == "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
                if (textAreaRef.current) {
                  textAreaRef.current.style.height = "auto";
                }
              }
            }}
            rows={1}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="px-0 disable:cursor-not-allowed"
            disabled={!content || content === ""}
            onClick={() => {
              handleSendMessage();
            }}
          >
            <IoMdSend
              className={`h-10 w-10 text-proPurple hover:${
                !content || content === ""
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
