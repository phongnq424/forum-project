import { createContext, useContext, useEffect, useState } from "react";
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

import { useGetMe } from "../../api/hooks/ProfileHook";
import LoadingScreen from "./LoadingScreen";
import { useToggleReaction } from "../../api/hooks/reactionHook";
import { useNavigate } from "react-router-dom";
import toastHelper from "../../helper/ToastHelper";
import { AddPostDialog } from "../dialogs/AddPostDialog";

const ProfilePageContext = createContext();

const ProfilePage = () => {
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
  const getProfile = useGetMe();

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
            <ProfileCard {...userProfile} />
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
  switch (selectedCategory) {
    case 1:
      return <RenderPosts />;
    default:
      return <></>;
  }
}

function RenderPosts() {
  const createPost = useCreatePost();
  const profilePageContext = useContext(ProfilePageContext);
  const [isDialogClosing, setIsDialogClosing] = useState(true);
  const getPostOfUser = useGetPostsOfUser(
    profilePageContext.currentUserProfile.user_id
  );
  const savePost = useSavePost();
  const navigate = useNavigate();
  const toggleReaction = useToggleReaction();
  const handleSelectPost = function (post) {
    navigate(`/post-detail?postId=${post.id}`, { state: { post } });
  };

  useEffect(
    function () {
      if (getPostOfUser.isError) {
        toastHelper.error(getMyPosts.error.message);
      }
    },
    [getPostOfUser.isError]
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

  return (
    <div className="space-y-5 flex flex-col">
      {getPostOfUser.isPending && <LoadingScreen />}
      <SearchBar />
      <button
        onClick={() => setIsDialogClosing(false)}
        className="self-end text-white text-[18px] bg-green px-6 py-2 flex items-center justify-center rounded-md font-medium transition-colors hover:opacity-70 duration-200 ease-linear"
      >
        <LuFilePlus className="h-4 w-4 me-2" />
        Create
      </button>
      <div className="space-y-10">
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
