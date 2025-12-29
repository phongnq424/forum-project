import { CircleX } from "lucide-react";

export type SelectedUserInfo = {
  id: string;
  avatar: string;
  username: string;
  fullName: string;
};

const SelectedUserCard = function ({
  user,
  onRemove,
}: {
  user: SelectedUserInfo;
  onRemove?: (user: SelectedUserInfo) => void;
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-white/10 shadow hover:cursor-pointer hover:bg-white/20">
      {/* Content */}
      <div className="flex gap-1 p-1 items-center justify-between">
        {/* Avatar */}
        <img
          src={user.avatar}
          alt={user.username}
          className="h-5 w-5 rounded-full border-2 border-white object-cover bg-gradient-to-br from-proPurple to-proPink"
        />

        {/* Info */}
        <div className="ml-1 flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">@{user.username}</p>
        </div>

        {/* Remove button */}
        <button onClick={() => onRemove?.(user)}>
          <CircleX className="h-4 w-4 text-white/50" />
        </button>
      </div>
    </div>
  );
};

export default SelectedUserCard;
