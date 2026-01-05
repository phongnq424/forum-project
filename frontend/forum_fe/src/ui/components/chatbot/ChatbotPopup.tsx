import { useState, useRef, useEffect, useContext } from "react";
import { X, Send, User, BotMessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatbot } from "@/api/hooks/aiHook";
import AppContext from "@/ui/Context/AppContext.jsx";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  isError: boolean;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hi there! 👋 How can I help you today?",
    sender: "bot",
    isError: false,
    timestamp: new Date(),
  },
];

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatbot = useChatbot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const appContext: any = useContext(AppContext);

  useEffect(
    function () {
      if (chatbot.isSuccess) {
        setMessages((prev) => [
          ...prev,
          {
            id: "1",
            content: chatbot.data.reply,
            sender: "bot",
            timestamp: new Date(),
            isError: false,
          },
        ]);
      }
      if (chatbot.isError) {
        setMessages((prev) => [
          ...prev,
          {
            id: new Date().toISOString(),
            content: chatbot.error.message,
            sender: "bot",
            isError: true,
            timestamp: new Date(),
          },
        ]);
      }
    },
    [chatbot.data, chatbot.isSuccess, chatbot.isError]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: new Date().toISOString(),
        content: inputValue,
        sender: "user",
        timestamp: new Date(),
        isError: false,
      },
    ]);
    chatbot.mutate({ message: inputValue });
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl bg-purple-700 chat-shadow overflow-hidden border-2 border-proPurple">
          {/* Header */}
          <div className="chat-button-gradient p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <BotMessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">
                  Chat Assistant
                </h3>
                <p className="text-xs text-primary-foreground/80">
                  Always here to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-black">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 animate-message-in",
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                    message.sender === "user"
                      ? "bg-chat-bubble-user"
                      : "bg-muted"
                  )}
                >
                  {message.sender === "user" ? (
                    <img
                      className="bg-red-500 w-full h-full rounded-full"
                      src={appContext.currentUser.avatar}
                    ></img>
                  ) : (
                    <BotMessageSquare className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[70%] px-4 py-2.5 rounded-2xl  bg-white/20",
                    message.isError ? "border-2 border-red-500" : ""
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {chatbot.isPending && (
              <div className="flex gap-2 animate-message-in">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <BotMessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-chat-bubble-bot px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t-2 border-proPurple bg-black">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  inputValue.trim()
                    ? "bg-proPurple hover:scale-105 active:scale-95"
                    : "bg-proPurple/50 hover:cursor-not-allowed"
                )}
              >
                <Send
                  className={cn(
                    "w-4 h-4",
                    inputValue.trim() ? "text-primary-foreground" : ""
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
          isOpen
            ? ""
            : "chat-button-gradient chat-button-shadow hover:scale-110 active:scale-95",
          "bg-proPurple hover:bg-proPurple/50"
        )}
      >
        {/* Pulse effect when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full chat-button-gradient animate-pulse-ring" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <BotMessageSquare className="w-6 h-6 text-primary-foreground" />
        )}
      </button>
    </div>
  );
}
