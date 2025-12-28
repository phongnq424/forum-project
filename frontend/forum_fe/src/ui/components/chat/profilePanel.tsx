import General from "@/General/General";
import { User, DoorOpen } from "lucide-react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { useLeaveGroup } from "@/api/hooks/chatHook";
import { useEffect } from "react";
import toastHelper from "../../../helper/ToastHelper";

interface ProfilePanelProps {
  name: string;
  avatar: string;
  userId: string;
  type: string;
  conversationId: string;
}

const ProfilePanel = ({
  name,
  avatar,
  type,
  userId,
  conversationId,
}: ProfilePanelProps) => {
  const navigate = useNavigate();
  const leaveGroup = useLeaveGroup();
  useEffect(
    function () {
      if (leaveGroup.isSuccess) {
        toastHelper.success("Leave Group Successfully");
      }
      if (leaveGroup.isError) {
        toastHelper.error(leaveGroup.error.message);
      }
    },
    [leaveGroup.data, leaveGroup.isSuccess, leaveGroup.isError]
  );
  const params = {
    id: userId,
  };
  const search = `${createSearchParams(params)}`;
  const actionsChat = [
    {
      icon: User,
      label: "View Profile",
      onClick: () => {
        navigate({
          pathname: `/profile`,
          search: search,
        });
      },
    },
  ];

  const actionGroup = [
    {
      icon: DoorOpen,
      label: "Leave Group",
      onClick: () => {
        leaveGroup.mutate({ conversationId });
      },
    },
  ];

  let actions = actionsChat; // Default: Chat
  if (type === General.typesConversation.GROUPS.name) {
    actions = actionGroup;
  }
  return (
    <div className="w-72 bg-white/15 p-6 flex flex-col items-center rounded-2xl">
      {/* Avatar */}
      <div className="relative mb-6">
        <img
          src={avatar}
          alt={name}
          className="w-32 h-32 rounded-full object-cover border-4 border-primary/30"
        />
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-foreground text-center mb-8 truncate overflow-hidden w-full">
        {name}
      </h3>

      {/* Actions */}
      <div className="w-full space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="w-full flex items-center gap-4 px-5 py-3 bg-black hover:bg-black/50 rounded-xl transition-colors group"
            onClick={action.onClick}
          >
            <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfilePanel;
