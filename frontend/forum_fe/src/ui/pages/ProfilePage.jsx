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

const ProfilePageContext = createContext();

const ProfilePage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const userId = query.get("id") || "";

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
  ];

  const [selectedCategory, setSelectedCategory] = useState();
  let getProfile;

  if (userId === "") {
    getProfile = useGetMe();
  } else {
    getProfile = useGetProfileByUserId(userId);
  }

  useEffect(
    function () {
      if (getProfile.isError) {
        toastHelper.error(getProfile.error.message);
      }
    },
    [getProfile.isError]
  );

  var userProfile = null;
  if (getProfile.isLoading) {
    return <LoadingScreen></LoadingScreen>;
  }

  if (getProfile.isSuccess) {
    userProfile = {
      user_id: getProfile.data?.User?.id || "",
      fullName: getProfile.data?.fullname || "No Fullname",
      username: getProfile.data?.User?.username || "No Username",
      avatar: getProfile.data?.avatar || "",
      bio: getProfile.data?.bio || "No bio",
      followers: getProfile.data?.followers || -1,
      following: getProfile.data?.following || -1,
      posts: getProfile.data?.posts || -1,
      comments: getProfile.data?.comments || -1,
    };
  } else {
    return <></>;
  }

  return (
    <ProfilePageContext.Provider value={{ currentUserProfile: userProfile }}>
      <div className="bg-primary px-(--primary-padding) py-[20px] ">
        <main className="mx-auto space-y-7">
          <div className="w-[75%] mx-auto space-y-7">
            <ProfileCard {...userProfile} isOwnProfile={userId === ""} />
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
        {getPostOfUser.isSuccess &&
          getPostOfUser.data &&
          getPostOfUser.data.data &&
          getPostOfUser.data.data.map((item) => {
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

        <PaginationInput
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 0}
          onChange={(page) => setCurrentPage(page)}
        />
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

export default ProfilePage;
