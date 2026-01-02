import { NavLink } from "react-router-dom";
import AppContext from "../../Context/AppContext.jsx";
import { useContext } from "react";

interface LeaderboardItemProps {
  rank: number;
  username: string;
  fullname: string;
  score: number;
  avatar: string;
  userId: string;
}

export function LeaderboardItem({
  rank,
  username,
  fullname,
  score,
  avatar,
  userId,
}: LeaderboardItemProps) {
  const appContext = useContext(AppContext) as any;

  return (
    <NavLink
      className="flex items-center p-4 space-x-2.5 bg-white/10 rounded-xl shadow-sm hover:bg-white/20 transition hover:cursor-pointer"
      to={
        appContext?.currentUser?.user_id === userId
          ? "/profile"
          : {
              pathname: `/profile`,
              search: new URLSearchParams({ id: userId }).toString(),
            }
      }
    >
      {/* Rank */}
      <div className="text-center font-semibold text-gray-700 basis-[10%]">
        {rank}
      </div>

      {/* Avatar */}
      <img
        src={avatar}
        alt={username}
        className="w-10 h-10 rounded-full object-cover"
      />

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate overflow-hidden">{username}</div>
        <div className="text-sm text-gray-400 truncate overflow-hidden">
          {fullname}
        </div>
      </div>

      {/* Score */}
      <div className="font-semibold text-right min-w-[60px] basis-[10%]">
        {score}
      </div>
    </NavLink>
  );
}
