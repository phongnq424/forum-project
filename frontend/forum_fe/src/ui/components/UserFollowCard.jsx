import { FaUserPlus } from "react-icons/fa6";
import { FaUserMinus } from "react-icons/fa6";

export const UserFollowCard = ({
  name = "Name",
  username = "Username",
  avatarUrl = "",
  userId = "",
  onFollow,
  onRemove,
  onChoose,
  isFollowing,
}) => {
  return (
    <div
      className="flex items-center gap-4 bg-primary hover:bg-primary/50 hover:cursor-pointer transition-colors rounded-3xl p-4 pr-6"
      onClick={function (e) {
        onChoose?.(userId);
      }}
    >
      {/* Avatar */}
      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-background flex items-center justify-center bg-gray-700 text-white">
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-lg truncate">{name}</h3>
        <p className="text-muted-foreground text-sm truncate">@{username}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className={`h-fit w-fit px-3 py-1 rounded-full bg-icon-button ${
            isFollowing
              ? "bg-transparent hover:bg-white/10"
              : "bg-proPurple hover:bg-proPurple/50"
          } text-white flex items-center justify-center`}
          onClick={(e) => {
            e.stopPropagation();
            onFollow?.(userId);
          }}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};
