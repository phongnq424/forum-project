import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UsersRound } from "lucide-react";
import CreateGroupDialog from "./createGroupDialog";
import { useSearchUsers } from "../../../api/hooks/ProfileHook.js";
import { useEffect, useState } from "react";
import type { output, ZodObject, ZodString, ZodArray } from "zod";
import type { $strip } from "zod/v4/core";

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
  typeConversation: string;
  setTypeConversation: (newVal: string | ((prevVal: string) => string)) => void;
  types: { name: string }[];
}

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  typeConversation,
  setTypeConversation,
  types,
}: ConversationListProps) => {
  const [keyword, setKeyword] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<any>([]);

  const searchUser = useSearchUsers(keyword, keyword.trim().length > 0);

  useEffect(
    function () {
      if (searchUser.isSuccess) {
        setSearchedUsers(searchUser.data);
      }
    },
    [searchUser.data, searchUser.isSuccess, searchUser.isError]
  );

  return (
    <div className="w-80 bg-white/15  flex flex-col h-full rounded-2xl overflow-hidden">
      {/* Search */}
      <div className="p-4 flex justify-between gap-x-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-black border-0 text-foreground placeholder:text-muted-foreground rounded-lg"
          />
        </div>

        <CreateGroupDialog
          handleOnSearch={(kw) => setKeyword(kw)}
          searchedUsers={searchedUsers}
          className="w-[40vw] sm:max-w-none h-[70vh] border-none bg-black404040"
        />
      </div>

      {/* types */}
      <div className="px-4 pb-3 flex items-center gap-4">
        {types.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setTypeConversation(filter.name)}
            className={cn(
              "text-sm font-medium transition-colors",
              filter.name === typeConversation
                ? "text-foreground bg-primary/70 px-3 py-1 rounded-md"
                : "text-muted-foreground hover:text-foreground px-3 py-1"
            )}
          >
            {filter.name}
          </button>
        ))}
        <button className="ml-auto text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Conversations chat */}
      {(typeConversation === types[0]?.name || true) && (
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
                <p
                  className={`text-sm text-muted-foreground truncate ${
                    conv.unread ? "font-extrabold text-white" : ""
                  }`}
                >
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
