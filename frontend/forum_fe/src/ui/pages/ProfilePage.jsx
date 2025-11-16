import { createContext, useContext, useEffect, useRef, useState } from "react";
import CategoryBar from "../components/CategoryBar";
import ProfileCard from "../components/ProfileCard";
import { BsPostcard } from "react-icons/bs";
import { TbMessageCircleFilled } from "react-icons/tb";
import PostCard2 from "../components/PostCard2";
import { PiMedalFill } from "react-icons/pi";
import SearchBar from "../components/SearchBar";
import { LuFilePlus } from "react-icons/lu";
import {
  useCreatePost,
  useGetPostsOfUser,
  useSavePost,
} from "../../api/hooks/postHook";

import { useGetMe, useGetProfileByUserId } from "../../api/hooks/ProfileHook";
import LoadingScreen from "./LoadingScreen";
import { useToggleReaction } from "../../api/hooks/reactionHook";
import { useLocation, useNavigate } from "react-router-dom";
import toastHelper from "../../helper/ToastHelper";
import { AddPostDialog } from "../dialogs/AddPostDialog";
import AppContext from "../Context/AppContext";
import PaginationInput from "../components/PaginationInput";
import { FaUserFriends } from "react-icons/fa";
import TabIcon from "../components/TabIcon";
import { UserFollowCard } from "../components/UserFollowCard";
import { IoSearch, IoServer } from "react-icons/io5";
import {
  useGetFollowingByUserId,
  useToggleFollow,
} from "../../api/hooks/followHook";

const ProfilePageContext = createContext();

const ProfilePage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const toggleFollow = useToggleFollow();

  const userId = query.get("id") || "";
  const [currentProfile, setCurrentProfile] = useState(null);

  const categories = [
    { id: 1, name: "Posts", icon: <BsPostcard className="text-[24px]" /> },
    {
      id: 2,
      name: "Comments",
      icon: <TbMessageCircleFilled className="text-[24px]" />,
    },
    {
      id: 3,
      name: "Achievements",
      icon: <PiMedalFill className="text-[24px]" />,
    },

    {
      id: 4,
      name: "Connections",
      icon: <FaUserFriends className="text-[24px]" />,
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState();
  const getProfile = useGetProfileByUserId(userId);
  useEffect(
    function () {
      setCurrentProfile(getProfile.data);
    },
    [getProfile.isSuccess, getProfile.isError, getProfile.data]
  );

  useEffect(
    function () {
      if (toggleFollow.isSuccess) {
        setCurrentProfile(function (prev) {
          return { ...prev, isFollowing: toggleFollow.data.followed };
        });
        console.warn(toggleFollow.data);
      }
      if (toggleFollow.isError) {
        toastHelper.error(toggleFollow.error.message);
      }
    },
    [toggleFollow.isError, toggleFollow.isSuccess, toggleFollow.data]
  );

  if (getProfile.isLoading) {
    return <LoadingScreen></LoadingScreen>;
  }

  if (currentProfile === null) {
    return <></>;
  }

  return (
    <ProfilePageContext.Provider value={{ currentUserProfile: currentProfile }}>
      <div className="bg-primary px-(--primary-padding) py-[20px] ">
        <main className="mx-auto space-y-7">
          <div className="w-[75%] mx-auto space-y-7">
            <ProfileCard
              {...currentProfile}
              isOwnProfile={userId === ""}
              handleToggleFollow={(id) =>
                toggleFollow.mutate({ targetUserId: id })
              }
            />
            <CategoryBar
              categories={categories}
              onChanged={(i) => setSelectedCategory(i)}
            ></CategoryBar>
          </div>

          <div className="mt-5 min-h-full bg-white/10 rounded-4xl text-white px-5 py-5">
            {selectedCategory && (
              <RenderByCategory selectedCategory={selectedCategory} />
            )}
          </div>
        </main>
      </div>
    </ProfilePageContext.Provider>
  );
};

function RenderByCategory({ selectedCategory }) {
  switch (selectedCategory.id) {
    case 1:
      return <RenderPosts />;
    case 4:
      return <RenderConnections />;
    default:
      return <></>;
  }
}

function RenderPosts() {
  const createPost = useCreatePost();
  const profilePageContext = useContext(ProfilePageContext);
  const appContext = useContext(AppContext);
  const [isDialogClosing, setIsDialogClosing] = useState(true);
  const savePost = useSavePost();
  const navigate = useNavigate();
  const toggleReaction = useToggleReaction();
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);

  const getPostOfUser = useGetPostsOfUser(
    profilePageContext.currentUserProfile.user_id,
    currentPage,
    pagination?.limit
  );
  const handleSelectPost = function (post) {
    navigate(`/post-detail?postId=${post.id}`, { state: { post } });
  };

  useEffect(
    function () {
      if (getPostOfUser.isError) {
        toastHelper.error(getMyPosts.error.message);
      }

      if (getPostOfUser.isSuccess) {
        setPagination(getPostOfUser.data.pagination);
        setPosts(getPostOfUser.data.data);
      }
    },
    [getPostOfUser.isError, getPostOfUser.isSuccess, getPostOfUser.data]
  );

  useEffect(
    function () {
      if (savePost.isSuccess) {
        toastHelper.success(
          savePost.data.saved ? "Save successfully!" : "Unsave successfully!"
        );
        setPosts((prev) =>
          prev.map((p) => {
            return p.id === savePost.data.postId
              ? {
                  ...p,
                  isSaved: savePost.data.saved,
                }
              : p;
          })
        );
      }
      if (savePost.isError) {
        toastHelper.error(savePost.error.message);
      }
    },
    [savePost.isSuccess, savePost.isError]
  );

  useEffect(
    function () {
      if (toggleReaction.isSuccess) {
        toastHelper.success("Love: " + !toggleReaction.data.removed);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === toggleReaction.data.postId
              ? {
                  ...p,
                  likes: p.likes + (toggleReaction.data.removed ? -1 : 1),
                  isLiked: !toggleReaction.data.removed,
                }
              : p
          )
        );
      }
      if (toggleReaction.isError) {
        console.log(toggleReaction.error.message);
      }
    },
    [toggleReaction.isError, toggleReaction.isSuccess]
  );

  useEffect(
    function () {
      if (createPost.isSuccess) {
        setIsDialogClosing(true);
        toastHelper.success("Create post successfully!");
        getPostOfUser.refetch();
      } else if (createPost.isError) {
        toastHelper.error(createPost.error.message);
      }
    },
    [createPost.isError, createPost.isSuccess]
  );

  // Scroll len dau
  const [hasMounted, setHasMounted] = useState(false);
  const containerPostsRef = useRef();
  useEffect(
    function () {
      if (hasMounted) {
        containerPostsRef.current.scrollIntoView({ behavior: "smooth" });
      } else {
        setHasMounted(true);
      }
    },
    [currentPage]
  );

  return (
    <div className="space-y-5 flex flex-col min-h-full" ref={containerPostsRef}>
      {getPostOfUser.isPending && <LoadingScreen />}
      <SearchBar />
      {profilePageContext.currentUserProfile?.user_id ===
        appContext.currentUser?.user_id && (
        <button
          onClick={() => setIsDialogClosing(false)}
          className="self-end text-white text-[18px] bg-green px-6 py-2 flex items-center justify-center rounded-md font-medium transition-colors hover:opacity-70 duration-200 ease-linear"
        >
          <LuFilePlus className="h-4 w-4 me-2" />
          Create
        </button>
      )}
      <div className="space-y-10" ref={containerPostsRef}>
        {posts.map((item) => {
          item.author = profilePageContext.currentUserProfile.username;
          item.authorImg = profilePageContext.currentUserProfile.avatar;
          item.user = {
            id: profilePageContext.currentUserProfile.user_id,
            username: profilePageContext.currentUserProfile.username,
            Profile: {
              avatar: profilePageContext.currentUserProfile.avatar,
            },
          };

          return (
            <PostCard2
              onSaveClick={(e) => savePost.mutate({ postId: item.id })}
              variant="discuss"
              key={item.id}
              {...item}
              onClick={(e) => {
                handleSelectPost(item);
              }}
              onReactionClick={(typeReaction) => {
                toggleReaction.mutate({ postId: item.id, typeReaction });
              }}
            ></PostCard2>
          );
        })}

        {pagination && pagination?.totalPages > 1 && (
          <PaginationInput
            totalPages={pagination?.totalPages}
            onChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
      {!isDialogClosing && (
        <AddPostDialog
          isLoading={createPost.isPending}
          onClose={() => setIsDialogClosing(true)}
          onSubmit={(submitData) => createPost.mutate(submitData)}
        />
      )}
    </div>
  );
}

function RenderConnections() {
  const options = {
    FOLLOWING: {
      id: 0,
      name: "Following",
    },

    FOLLOWERS: {
      id: 1,
      name: "Followers",
    },

    asArray() {
      return Object.values(this).filter((item) => typeof item != "function");
    },
  };

  const profilePageContext = useContext(ProfilePageContext);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const getFollowing = useGetFollowingByUserId(
    profilePageContext.currentUserProfile?.user_id,
    currentPage,
    pagination?.limit
  );
  const toggleFollow = useToggleFollow();
  useEffect(
    function () {
      if (toggleFollow.isSuccess) {
        setUsers(function (prev) {
          return prev.map(function (item) {
            return toggleFollow.data.followedId === item.followedId
              ? { ...item, isFollowing: toggleFollow.data.followed }
              : { ...item };
          });
        });
      }
      if (toggleFollow.isError) {
        toastHelper.error(toggleFollow.error.message);
      }
    },
    [toggleFollow.isError, toggleFollow.isSuccess, toggleFollow.data]
  );

  const handleOnChangeOption = function (selectedOption) {
    if (selectedOption.id === options.FOLLOWERS.id) {
    } else if (selectedOption.id === options.FOLLOWING.id) {
    }
  };

  useEffect(
    function () {
      if (getFollowing.isSuccess) {
        setPagination(getFollowing.data.pagination);
        setUsers(getFollowing.data.data);
      }

      if (getFollowing.isError) {
        toastHelper.error(getFollowing.error.message);
      }
    },
    [getFollowing.isSuccess, getFollowing.isError, getFollowing.data]
  );

  return (
    <>
      <TabIcon
        options={options.asArray()}
        onChange={(selectedOption) => handleOnChangeOption(selectedOption)}
      />

      <div className="relative w-full md:w-96 basis-[60%] mt-5">
        <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />
        <input
          type="text"
          className="flex h-10 outline-none w-full rounded-2xl bg-white/20 px-10 py-5 text-base placeholder:text-muted-foreground"
          placeholder="Search"
          onKeyDown={function (e) {
            if (e.key == "Enter") {
            }
          }}
        />
      </div>

      {users?.length < 1 && (
        <p className="text-white text-center text-2xl py-10">
          No following available
        </p>
      )}

      {users?.length >= 1 && (
        <div className="grid grid-cols-2 gap-4 py-10">
          {users.map(function (item, index) {
            const info = {
              username: item.followedUsername,
              avatarUrl: item.followedProfile.avatar,
              userId: item.followedId,
              isFollowing: item.isFollowing,
            };
            return (
              <UserFollowCard
                key={index}
                {...info}
                onFollow={function (userId) {
                  toggleFollow.mutate({ targetUserId: userId });
                }}
              />
            );
          })}
        </div>
      )}

      {pagination && pagination?.totalPages <= 1 && (
        <PaginationInput
          onChange={(page) => setCurrentPage(page)}
          totalPages={pagination?.totalPages}
        />
      )}
    </>
  );
}

export default ProfilePage;
