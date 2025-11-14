import { FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({
  fullName = "Full Name",
  username = "username",
  avatar = "d",
  bio = "bio bio bio",
  followers = 1,
  following = 0,
  posts = 0,
  comments = 0,
  isOwnProfile = false,
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
                className="min-w-fit mt-5 bg-secondary w-fit hover:shadow-[0_0_10px_var(--color-proPurple)] text-lg gap-2 flex border-2 border-white/10 px-5 py-1 rounded-xl items-center shadow-[0_0_10px_rgba(255,255,255,50)]"
              >
                <FaPen className="h-5 w-5" />
                Edit Profile
              </button>
            )}

            {!isOwnProfile && (
              <>
                <button
                  onClick={function () {}}
                  className="min-w-fit mt-5 bg-secondary w-fit hover:shadow-[0_0_10px_var(--color-proPurple)] text-lg gap-2 flex border-2 border-white/10 px-5 py-1 rounded-xl items-center shadow-[0_0_10px_rgba(255,255,255,50)]"
                >
                  <FaPen className="h-5 w-5" />
                  Follow
                </button>

                <button
                  onClick={function () {}}
                  className="min-w-fit mt-5 bg-secondary w-fit hover:shadow-[0_0_10px_red] text-lg gap-2 flex border-2 border-white/10 px-5 py-1 rounded-xl items-center shadow-[0_0_10px_rgba(255,255,255,50)]"
                >
                  <FaPen className="h-5 w-5" />
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
