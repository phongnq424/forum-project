import { useEffect, useState } from "react";
import CategoryBar from "../components/CategoryBar";
import PostCard2 from "../components/PostCard2";
import SearchBar from "../components/SearchBar";
import { LuFilePlus2 } from "react-icons/lu";
import LoadingScreen from "./LoadingScreen";
import { AddPostDialog } from "../dialogs/AddPostDialog";
import {
  useCreatePost,
  useGetPosts,
  useSavePost,
} from "../../api/hooks/postHook";
import toastHelper from "../../helper/ToastHelper";
import { useGetCategories } from "../../api/hooks/categoriesHook";
import { useToggleReaction } from "../../api/hooks/reactionHook";
import { useNavigate } from "react-router-dom";

const testPosts = [];

function DiscussPage() {
  const [posts, setPosts] = useState(testPosts);
  const [isDialogClosing, setIsDialogClosing] = useState(true);
  const createPost = useCreatePost();
  const getPosts = useGetPosts();
  const getCategories = useGetCategories();
  const toggleReaction = useToggleReaction();
  const savePost = useSavePost();
  const navigate = useNavigate();
  const [selection, setSelection] = useState();
  useEffect(
    function () {
      if (getPosts.isSuccess) {
        const responsePosts = getPosts.data.data;
        setPosts(responsePosts);
      }
      if (getPosts.isError) {
      }
    },
    [getPosts.isSuccess, getPosts.isError, getPosts.data]
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

  const handleSelectPost = function (post) {
    navigate(`/post-detail?postId=${post.id}`, { state: { post } });
  };

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
      if (selection?.id == 0) {
        getPosts.refetch();
        console.log("DDaay");
      }
    },
    [selection]
  );

  // Response for Create Post
  useEffect(
    function () {
      if (createPost.isSuccess) {
        setIsDialogClosing(true);
        toastHelper.success("Create post successfully!");
        getPosts.refetch();
      } else if (createPost.isError) {
        toastHelper.error(createPost.error.message);
      }
    },
    [createPost.isError, createPost.isSuccess]
  );

  return (
    <div className="px-(--primary-padding) pt-5 w-full h-full relative">
      {(getPosts.isLoading ||
        getCategories.isLoading ||
        savePost.isPending) && <LoadingScreen />}
      <SearchBar />
      <div className="flex justify-between pt-5">
        {getCategories.data?.data?.length >= 1 && (
          <CategoryBar
            onChanged={(Selection) => setSelection(Selection)}
            categories={[
              { id: "0", name: "For you" },
              ...getCategories.data.data,
            ]}
          />
        )}
        <button
          onClick={() => setIsDialogClosing(false)}
          className="text-white text-[18px] bg-green px-6 py-2 flex items-center justify-center rounded-md font-medium transition-colors hover:opacity-70 duration-200 ease-linear"
        >
          <LuFilePlus2 className="h-4 w-4 me-2" />
          Create
        </button>
      </div>

      {/* Posts */}
      {posts?.length > 0 && (
        <div className="pt-10 space-y-10">
          {posts.map((item) => (
            <PostCard2
              onSaveClick={(e) => savePost.mutate({ postId: item.id })}
              variant="discuss"
              key={item.id}
              {...item}
              onClick={(e) => {
                console.log(item);
                handleSelectPost(item);
              }}
              onReactionClick={(typeReaction) => {
                toggleReaction.mutate({ postId: item.id, typeReaction });
              }}
            ></PostCard2>
          ))}
        </div>
      )}

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

export default DiscussPage;
