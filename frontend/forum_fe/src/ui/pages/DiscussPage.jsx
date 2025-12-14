import { useEffect, useRef, useState } from "react";
import CategoryBar from "../components/CategoryBar";
import PostCard2 from "../components/PostCard2";
import SearchBar from "../components/SearchBar";
import { LuFilePlus2 } from "react-icons/lu";
import LoadingScreen from "./LoadingScreen";
import { AddPostDialog } from "../dialogs/AddPostDialog";
import {
  useCreatePost,
  useGetPostBySearchKey,
  useGetPosts,
  useSavePost,
} from "../../api/hooks/postHook";
import toastHelper from "../../helper/ToastHelper";
import { useGetCategories } from "../../api/hooks/categoriesHook";
import { useToggleReaction } from "../../api/hooks/reactionHook";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaginationInput from "../components/PaginationInput";
import ChatbotPopup from "../components/chatbot/ChatbotPopup.tsx";

const testPosts = [];

function DiscussPage() {
  const [posts, setPosts] = useState(testPosts);
  const [isDialogClosing, setIsDialogClosing] = useState(true);
  const createPost = useCreatePost();

  const [searchParams, setSearchParams] = useSearchParams();
  const cateId = searchParams.get("cateId");
  const page = searchParams.get("page") ?? "1";
  const prevCateId = useRef(cateId);

  const navigate = useNavigate();
  const getCategories = useGetCategories();
  const toggleReaction = useToggleReaction();
  const savePost = useSavePost();

  const [searchKey, setSearchKey] = useState("");
  const [pagination, setPagination] = useState({});
  const getPosts = useGetPosts(page, cateId);

  const getPostsBySearchKey = useGetPostBySearchKey(searchKey, cateId);
  useEffect(
    function () {
      if (getPostsBySearchKey.isSuccess) {
        setPosts(getPostsBySearchKey.data.data);
        setSearchKey("");
      }
      if (getPostsBySearchKey.isError) {
        toastHelper.error(getPostsBySearchKey.error.message);
      }
    },
    [
      getPostsBySearchKey.isSuccess,
      getPostsBySearchKey.isError,
      getPostsBySearchKey.data,
    ]
  );

  const handleOnSearch = function (searchKey) {
    setSearchKey(searchKey);
  };

  useEffect(
    function () {
      if (getPosts.isSuccess) {
        const responsePosts = getPosts.data.data;
        setPosts(responsePosts);
        setPagination(getPosts.data.pagination);
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
        console.log(savePost.data);
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

  const handleSelectPost = function (post) {
    navigate(`/post-detail?postId=${post.id}`, { state: { post } });
  };

  useEffect(
    function () {
      if (toggleReaction.isSuccess) {
        toastHelper.success("Love: " + !toggleReaction.data.removed);
        console.log(toggleReaction.data);
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
      if (cateId != prevCateId.current) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", 1);
          return newParams;
        });
      }
    },
    [cateId]
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
    [page]
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
    <div
      className="pl-(--primary-padding) pr-50 pt-5 w-full min-h-full relative flex flex-col"
      ref={containerPostsRef}
    >
      {(getPosts.isLoading ||
        getCategories.isLoading ||
        savePost.isPending) && <LoadingScreen />}
      <SearchBar onSearch={(searchKey) => handleOnSearch(searchKey)} />
      <div className="flex justify-between pt-5">
        {getCategories.data?.data?.length >= 1 && (
          <CategoryBar
            onChanged={function (selectedCategory) {
              setSearchParams(function (prev) {
                const newParams = new URLSearchParams(prev);
                newParams.set("cateId", selectedCategory.id);
                return newParams;
              });
            }}
            categories={[
              { id: "all", name: "For you" },
              ...getCategories.data.data,
            ]}
            initIndex={
              getCategories.data?.data?.findIndex(function (i) {
                return i.id === cateId;
              }) + 1
            }
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
      <div className="space-y-5 flex flex-col">
        {posts && (
          <div className="pt-10 space-y-10">
            {posts.length < 1 && (
              <p className="text-white text-center text-2xl">
                No posts available
              </p>
            )}
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

        {pagination && pagination?.totalPages > 1 && (
          <PaginationInput
            currentPage={Number(page)}
            totalPages={pagination?.totalPages || 0}
            onChange={function (page) {
              setSearchParams(function (prev) {
                const newParams = new URLSearchParams(prev);
                newParams.set("page", page);
                return newParams;
              });
            }}
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

      <ChatbotPopup />
    </div>
  );
}

export default DiscussPage;
