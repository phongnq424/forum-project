import { FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({
  user_id = "",
  fullName = "Full Name",
  username = "username",
  avatar = "d",
  bio = "bio bio bio",
  followers = 1,
  following = 0,
  posts = 0,
  comments = 0,
  isOwnProfile = false,
  isFollowing = false,
  handleToggleFollow = null,
  handleToggleBlock = null,
}) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white/10 rounded-4xl py-4 px-10 w-full mx-auto text-white">
      <div className="flex items-center justify-between space-x-6">
        {/* Avatar */}
        <div className="h-40 w-40 rounded-full overflow-hidden shrink-0">
          <img
            src={avatar}
            alt={username}
            className="h-full w-full object-cover bg-gradient-to-br from-proPurple to-proPink"
          />
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center">
            <h1 className="text-[24px] font-bold">{fullName}</h1>
            <div className="w-2 h-2 rounded-full bg-white mx-2.5"></div>
            <p className="text-[18px] text-lg">{`@${username}`}</p>
          </div>

          <p className="text-[18px] text-lg italic">{`${bio}`}</p>

          <div className="flex space-x-5 w-full">
            <p className="text-[18px] text-lg hover:cursor-pointer hover:underline hover:text-proPurple">
              <b>{followers}</b> Follower{followers > 1 ? "s" : ""}
            </p>
            <p className="text-[18px] text-lg hover:cursor-pointer hover:underline hover:text-proPurple">
              <b>{following}</b> Following
            </p>
            <p className="text-[18px] text-lg hover:cursor-pointer hover:underline hover:text-proPurple">
              <b>{posts}</b> Post{posts > 1 ? "s" : ""}
            </p>
            <p className="text-[18px] text-lg hover:cursor-pointer hover:underline hover:text-proPurple">
              <b>{comments}</b> Comment{comments > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex p-0 m-0 space-x-5">
            {isOwnProfile && (
              <button
                onClick={() => navigate("/update-profile")}
                className="min-w-fit mt-5 bg-proPurple w-fit hover:bg-proPurple/50 text-lg gap-2 flex px-5 py-1 rounded-xl items-center"
              >
                <FaPen className="h-5 w-5" />
                Edit Profile
              </button>
            )}

            {!isOwnProfile && (
              <>
                <button
                  onClick={function () {
                    handleToggleFollow?.(user_id);
                  }}
                  className={`min-w-fit mt-5 text-lg gap-2 flex px-5 py-1 rounded-xl items-center ${
                    isFollowing
                      ? "bg-primary w-fit hover:bg-white/10"
                      : "bg-proPurple w-fit hover:bg-proPurple/50"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  onClick={function () {
                    handleToggleBlock?.(user_id);
                  }}
                  className="min-w-fit mt-5 bg-red-500 w-fit hover:bg-red-500/50 text-lg gap-2 flex px-5 py-1 rounded-xl items-center"
                >
                  Block
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
