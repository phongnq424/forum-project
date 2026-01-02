export type UserInfo = {
  id: string;
  cover: string;
  avatar: string;
  username: string;
  fullName: string;
};

const UserCard = function ({
  user,
  onClick,
}: {
  user: UserInfo;
  onClick?: (id: string) => void;
}) {
  return (
    <div
      className="w-full max-w-md overflow-hidden rounded-xl bg-white/10 shadow hover:cursor-pointer hover:bg-white/20"
      onClick={() => onClick?.(user.id)}
    >
      {/* Cover */}
      <img
        src={user.cover}
        alt={user.username}
        className="h-36 bg-gradient-to-br from-proPurple to-proPink"
      />

      {/* Content */}
      <div className="relative flex gap-4 px-4 pb-4">
        {/* Avatar */}
        <img
          src={user.avatar}
          alt={user.username}
          className="absolute -top-8 left-4 h-16 w-16 rounded-full border-2 border-white object-cover bg-gradient-to-br from-proPurple to-proPink"
        />

        {/* Info */}
        <div className="ml-20 pt-3">
          <p className="text-lg font-semibold">@{user.username}</p>
          <p className="text-lg text-gray-500">{user.fullName}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
