export type UserInfo = {
  id: string;
  avatar: string;
  username: string;
  fullName: string;
};

const UserCard = function ({
  user,
  onClick,
}: {
  user: UserInfo;
  onClick?: (user: UserInfo) => void;
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-xl bg-white/10 shadow hover:cursor-pointer hover:bg-white/20"
      onClick={() => onClick?.(user)}
    >
      {/* Content */}
      <div className="flex gap-1 p-1 items-center">
        {/* Avatar */}
        <img
          src={user.avatar}
          alt={user.username}
          className="h-8 w-8 rounded-full border-2 border-white object-cover bg-gradient-to-br from-proPurple to-proPink"
        />

        {/* Info */}
        <div className="ml-1 flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">@{user.username}</p>
          <p className="text-sm text-gray-500 truncate">{user.fullName}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
