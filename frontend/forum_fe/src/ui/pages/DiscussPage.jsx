import { useEffect, useState } from "react";
import CategoryBar from "../components/CategoryBar";
import PostCard2 from "../components/PostCard2";
import SearchBar from "../components/SearchBar";
import { LuFilePlus2 } from "react-icons/lu";
import LoadingScreen from "./LoadingScreen";
import { AddPostDialog } from "../dialogs/AddPostDialog";
import { useCreatePost, useGetPosts } from "../../api/hooks/postHook";
import toastHelper from "../../helper/ToastHelper";
import General from "../../General/General";

const testPosts = [];

function DiscussPage() {
  const [posts, setPosts] = useState(testPosts);
  const [isDialogClosing, setIsDialogClosing] = useState(true);
  const createPost = useCreatePost();
  const getPosts = useGetPosts();
  useEffect(
    function () {
      if (getPosts.isSuccess) {
        const responsePosts = getPosts.data.data;
        const ps = [];
        for (let i = 0; i < responsePosts.length; i++) {
          const curr = responsePosts[i];

          ps.push({
            id: curr.id,
            author: curr.User.username,
            authorImg: curr.User.Profile.avatar,
            date: new Date(curr.created_at).toLocaleDateString(),
            title: curr.title,
            description: curr.content,
            likes: -1,
            comments: -1,
            thumbnail: curr.Image.length > 0 ? curr.Image[0].url : null,
          });

          console.warn(ps);
        }

        setPosts(ps);
      }
      if (getPosts.isError) {
      }
    },
    [getPosts.isSuccess, getPosts.isError]
  );
  // Response for Create Post
  useEffect(
    function () {
      if (createPost.isSuccess) {
        setIsDialogClosing(true);
        toastHelper.success("Create post successfully!");
      } else if (createPost.isError) {
        toastHelper.error(createPost.error.message);
      }
    },
    [createPost.isError, createPost.isSuccess]
  );
  return (
    <div className="px-(--primary-padding) pt-5 w-full h-full relative">
      {getPosts.isLoading && <LoadingScreen />}
      <SearchBar />
      <div className="flex justify-between pt-5">
        <CategoryBar />
        <button
          onClick={() => setIsDialogClosing(false)}
          className="text-white text-[18px] bg-green px-6 py-2 flex items-center justify-center rounded-md font-medium transition-colors hover:opacity-70 duration-200 ease-linear"
        >
          <LuFilePlus2 className="h-4 w-4 me-2" />
          Create
        </button>
      </div>

      {!isDialogClosing && (
        <AddPostDialog
          isLoading={createPost.isPending}
          onClose={() => setIsDialogClosing(true)}
          onSubmit={createPost.mutate}
        />
      )}
      {/* Posts */}
      {posts?.length > 0 && (
        <div className="pt-5 space-y-2.5">
          {posts.map((item) => (
            <PostCard2 variant="discuss" key={item.id} {...item}></PostCard2>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiscussPage;
