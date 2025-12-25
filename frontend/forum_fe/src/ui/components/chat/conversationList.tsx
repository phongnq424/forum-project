import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) => {
  const filters = [
    { name: "All", active: true },
    { name: "Unread", active: false },
    { name: "Groups", active: false },
  ];

  return (
    <div className="w-80 bg-white/15  flex flex-col h-full rounded-2xl overflow-hidden">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-black border-0 text-foreground placeholder:text-muted-foreground rounded-lg"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-3 flex items-center gap-4">
        {filters.map((filter) => (
          <button
            key={filter.name}
            className={cn(
              "text-sm font-medium transition-colors",
              filter.active
                ? "text-foreground bg-primary/20 px-3 py-1 rounded-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {filter.name}
          </button>
        ))}
        <button className="ml-auto text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-center gap-3 p-4 transition-colors text-left",
              activeId === conv.id ? "bg-black" : "hover:bg-white/10"
            )}
          >
            <div className="relative">
              <img
                src={conv.avatar}
                alt={conv.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground truncate">
                  {conv.name}
                </span>
                <span className="text-xs text-white flex items-center gap-1">
                  <span className="opacity-60">⏱</span> {conv.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conv.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
