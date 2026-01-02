import {
  createContext,
  use,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  useGetPostsSaved,
  useSavePost,
} from "../../api/hooks/postHook";

import { useCreateChat } from "../../api/hooks/chatHook";

import { useGetProfileByUserId } from "../../api/hooks/ProfileHook";
import LoadingScreen from "./LoadingScreen";
import { useToggleReaction } from "../../api/hooks/reactionHook";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toastHelper from "../../helper/ToastHelper";
import { AddPostDialog } from "../dialogs/AddPostDialog";
import AppContext from "../Context/AppContext";
import PaginationInput from "../components/PaginationInput";
import { FaUserFriends } from "react-icons/fa";
import TabIcon from "../components/TabIcon";
import { UserFollowCard } from "../components/UserFollowCard";
import { IoSearch, IoServer } from "react-icons/io5";
import {
  useGetFollowersByUserId,
  useGetFollowingByUserId,
  useRemoveFollower,
  useToggleFollow,
} from "../../api/hooks/followHook";
import { useBlockUser, useGetBlockUser } from "../../api/hooks/blockHook";

const ProfilePageContext = createContext();

const ProfilePage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const toggleFollow = useToggleFollow();
  const createChat = useCreateChat();

  const userId = query.get("id") || "";
  const [currentProfile, setCurrentProfile] = useState(null);
  const navigate = useNavigate();

  function handleClickChat(userId) {
    createChat.mutate({ toUserId: userId });
  }

  useEffect(
    function () {
      if (createChat.isSuccess) {
        navigate("/chat", {
          state: { conversationId: createChat.data.id },
        });
      }
      if (createChat.isError) {
        toastHelper.error(createChat.error.message);
      }
    },
    [createChat.isSuccess, createChat.isError, createChat.data]
  );

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
      }
      if (toggleFollow.isError) {
        toastHelper.error(toggleFollow.error.message);
      }
    },
    [toggleFollow.isError, toggleFollow.isSuccess, toggleFollow.data]
  );

  const blockUser = useBlockUser();
  useEffect(
    function () {
      if (blockUser.isSuccess) {
        console.log(blockUser.data);
        setCurrentProfile(function (prev) {
          return { ...prev, isBlocked: blockUser.data.blocked };
        });
      }
      if (blockUser.isError) {
        toastHelper.error(blockUser.error.message);
      }
    },
    [blockUser.isError, blockUser.isSuccess, blockUser.data]
  );

  if (getProfile.isLoading || createChat.isPending) {
    return <LoadingScreen></LoadingScreen>;
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
              handleToggleBlock={(id) => {
                blockUser.mutate({ targetUserId: id });
              }}
              handleClickChat={(userId) => handleClickChat(userId)}
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
      return <RenderComments></RenderComments>;
  }
}

function RenderPosts() {
  const postSelections = {
    MY_POSTS: "My Posts",
    SAVED_POST: "Saved Posts",
    asArray: function () {
      return Object.values(this).filter((i) => typeof i != "function");
    },
  };
  const [postSelection, setPostSelection] = useState(
    postSelections.asArray()[0]
  );
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
    profilePageContext.currentUserProfile?.user_id,
    currentPage,
    pagination?.limit,
    postSelection === postSelections.MY_POSTS
  );

  const getPostSaved = useGetPostsSaved(
    currentPage,
    postSelection === postSelections.SAVED_POST
  );

  const handleSelectPost = function (post) {
    navigate(`/post-detail?postId=${post.id}`, { state: { post } });
  };

  useEffect(
    function () {
      if (getPostSaved.isSuccess) {
        setPagination(getPostSaved.data.pagination);
        setPosts(getPostSaved.data.data);
      }

      if (getPostSaved.isError) {
        toastHelper.error(getPostSaved.error.message);
      }
    },
    [getPostSaved.data, getPostSaved.isSuccess, getPostSaved.isError]
  );

  useEffect(
    function () {
      if (getPostOfUser.isError) {
        toastHelper.error(getPostOfUser.error.message);
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
      {profilePageContext.currentUserProfile?.user_id ===
        appContext.currentUser?.user_id && (
        <div className="flex space-x-5">
          <div className="rounded-lg flex space-x-2 bg-black w-fit text-xl items-center">
            {postSelections.asArray().map(function (s, i) {
              return (
                <div
                  key={i}
                  onClick={() => setPostSelection(s)}
                  className={`rounded-lg px-5 py-2 hover:cursor-pointer ${
                    s === postSelection ? "bg-proPurple" : ""
                  }`}
                >
                  {s}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsDialogClosing(false)}
            className="self-end text-white text-[18px] bg-green px-6 py-2 flex items-center justify-center rounded-md font-medium transition-colors hover:opacity-70 duration-200 ease-linear"
          >
            <LuFilePlus className="h-4 w-4 me-2" />
            Create
          </button>
        </div>
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

    BLOCK: {
      id: 2,
      name: "Block",
    },

    asArray() {
      return Object.values(this).filter((item) => typeof item != "function");
    },
  };

  const [selectedTab, setSelectedTab] = useState();
  const profilePageContext = useContext(ProfilePageContext);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const getFollowing = useGetFollowingByUserId(
    profilePageContext.currentUserProfile?.user_id,
    currentPage,
    selectedTab?.id,
    selectedTab?.id === options.FOLLOWING.id
  );

  const getFollower = useGetFollowersByUserId(
    profilePageContext.currentUserProfile?.user_id,
    currentPage,
    selectedTab?.id,
    selectedTab?.id === options.FOLLOWERS.id
  );

  const toggleFollow = useToggleFollow();
  const appContext = useContext(AppContext);
  const removeFollower = useRemoveFollower();
  const getBlockedUser = useGetBlockUser(
    appContext?.currentUser.userId,
    currentPage,
    selectedTab?.id,
    selectedTab?.id === options.BLOCK.id
  );

  useEffect(
    function () {
      if (toggleFollow.isSuccess) {
        setUsers(function (prev) {
          return prev.map(function (item) {
            return toggleFollow.data.followedId === item.otherId
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

  useEffect(
    function () {
      if (getFollower.isSuccess) {
        setPagination(getFollower.data?.pagination);
        setUsers(getFollower.data?.data);
      }

      if (getFollower.isError) {
        toastHelper.error(getFollower.error.message);
      }
    },
    [getFollower.isSuccess, getFollower.isError, getFollower.data]
  );

  useEffect(
    function () {
      if (removeFollower.isSuccess) {
        setUsers(function (prev) {
          return prev.filter(
            (item) => item.otherId !== removeFollower.data.user_id
          );
        });
      }

      if (removeFollower.isError) {
        toastHelper.error(removeFollower.error.message);
      }
    },
    [removeFollower.isError, removeFollower.isSuccess, removeFollower.data]
  );

  useEffect(
    function () {
      if (getBlockedUser.isSuccess) {
        setPagination(getBlockedUser.data.pagination);
        setUsers(getBlockedUser.data.data);
      }

      if (getBlockedUser.isError) {
        toastHelper.error(getBlockedUser.error.message);
      }
    },
    [getBlockedUser.isSuccess, getBlockedUser.isError, getBlockedUser.data]
  );

  const navigate = useNavigate();

  return (
    <>
      <TabIcon
        options={options.asArray()}
        onChanged={(selectedOption) => {
          setSelectedTab(selectedOption);
        }}
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
          {selectedTab?.id === options.FOLLOWERS.id && "No follower available"}
          {selectedTab?.id === options.FOLLOWING.id && "No following available"}
          {selectedTab?.id === options.BLOCK.id && "No blocked user available"}
        </p>
      )}

      {(selectedTab?.id === options.FOLLOWERS.id ||
        selectedTab?.id === options.FOLLOWING.id ||
        selectedTab?.id === options.BLOCK.id) &&
        users?.length >= 1 && (
          <div className="grid grid-cols-2 gap-4 py-10">
            {users.map(function (item, index) {
              const info = {
                username: item.otherUsername,
                avatarUrl: item.otherProfile.avatar,
                userId: item.otherId,
                isFollowing: item.isFollowing,
                isFollowMe: item.isFollowMe,
                isBlocked: item.isBlocked,
              };

              return (
                <UserFollowCard
                  key={index}
                  {...info}
                  isShowButtons={
                    appContext.currentUser?.user_id ===
                    profilePageContext.currentUserProfile?.user_id
                  }
                  onFollowClick={function (userId) {
                    toggleFollow.mutate({ targetUserId: userId });
                  }}
                  onChoose={function (userId) {
                    if (appContext?.currentUser?.user_id != userId) {
                      navigate(`/profile?id=${userId}`);
                    } else {
                      navigate(`/profile`);
                    }
                  }}
                  onRemoveClick={function (userId) {
                    removeFollower.mutate({ followerId: userId });
                  }}
                  onBlockClick={function (userId) {
                    blockUser.mutate({ targetUserId: userId });
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

const RenderFollower = function () {
  return <></>;
};

const RenderComments = function () {
  return <></>;
};

export default ProfilePage;
