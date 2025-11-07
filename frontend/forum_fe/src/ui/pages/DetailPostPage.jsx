import {
  useParams,
  Link,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";
import { useGetPostById } from "../../api/hooks/postHook";
import { FaArrowLeft } from "react-icons/fa";
import { MdMoreHoriz } from "react-icons/md";
import Button from "../elements/Button";
import { FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { FiMessageCircle, FiShare2 } from "react-icons/fi";
import { useToggleReaction } from "../../api/hooks/reactionHook";
import toastHelper from "../../helper/ToastHelper";
import General from "../../General/General";

const button_ghost = "hover:bg-accent hover:text-accent-foreground";
const button_base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
const button_icon = "h-10 w-10";

const DetailPostPage = () => {
  const [getParams, setParams] = useSearchParams();
  const postId = getParams.get("postId");
  const location = useLocation();
  const [currentPost, setCurrentPost] = useState(location?.state?.post);
  const getPostById = useGetPostById(currentPost.id);
  const toggleReaction = useToggleReaction(null, null);

  useEffect(
    function () {
      if (toggleReaction.isSuccess) {
        toastHelper.success("Love: " + !toggleReaction.data.removed);
      }
      if (toggleReaction.isError) {
        toastHelper.error(toggleReaction.error);
      }
    },
    [toggleReaction.isSuccess, toggleReaction.isError]
  );

  const onReactionClick = function (type) {
    toggleReaction.mutate({ postId, type });
  };

  const onCommentClick = function (content) {};

  const onShareClick = function () {};

  const onSaveClick = function () {};

  useEffect(
    function () {
      if (getPostById.isSuccess) {
        setCurrentPost(getPostById.data);
      }
    },
    [getPostById.isSuccess, getPostById.isError]
  );

  if (!currentPost) return <></>;

  return (
    <main className="min-h-screen w-full px-(--primary-padding)">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left side - Large image viewer */}
        <div className="lg:w-[45%] bg-black flex flex-col items-start justify-start h-screen overflow-y-auto">
          {/* <button
            className={`${button_base} ${button_ghost} ${button_icon} gap-2  group text-white hover:[&>*]:text-proPurple hover:text-proPurple ml-10`}
          >
            <FaArrowLeft className="h-full w-full group-hover" />
            Back
          </button> */}

          <div className="self-stretch flex flex-col justify-start">
            {currentPost.images &&
              currentPost.images.length >= 1 &&
              currentPost.images.map((item) => (
                <img
                  key={item.url}
                  src={item.url}
                  alt="Post content"
                  className="max-h-screen w-auto object-contain"
                />
              ))}
          </div>
        </div>

        {/* Right side - Post details and comments */}
        <div className="lg:w-[55%] bg-card overflow-y-auto">
          <div className="p-4">
            {/* Author and title */}
            <div className="flex flex-col space-y-4 pb-4">
              {/* Author */}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-15 w-15 rounded-full bg-secondary overflow-hidden shrink-0">
                    <img
                      src={currentPost.authorImg}
                      alt={currentPost.author}
                      className="h-full w-full object-cover bg-gradient-to-br from-proPurple to-proPink"
                    />
                  </div>

                  <div className="flex flex-col text-sm items-start">
                    <div className="flex space-y-1 flex-col">
                      <span className="text-2xl text-white/80">
                        {currentPost.author}
                      </span>
                      <span className="text-white/60 font-[18px]">
                        {currentPost.date}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className={`${button_base} ${button_ghost} ${button_icon} h-8 w-8 rounded-full hover:bg-secondary`}
                >
                  <MdMoreHoriz className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div
                className="flex flex-col gap-1.5
              "
              >
                {/* Post title */}
                <p className="text-2xl font-bold leading-relaxed text-white">
                  {currentPost.title}
                </p>

                <div className="flex py-2 px-4 rounded-md space-x-2.5 bg-proPurple w-fit">
                  <p className="text-lg leading-relaxed text-white">
                    {currentPost.topic.name}
                  </p>
                </div>
                {/* Post content */}
                <p className="text-lg leading-relaxed text-white">
                  {currentPost.description}
                </p>
              </div>
            </div>

            <div className="mb-2 h-[1px] bg-black404040" />

            {/* Action buttons */}
            <div className="flex items-center justify-around mb-3 text-white">
              <div className="flex justify-between basis-[75%]">
                <button
                  className="flex items-center gap-2 transition-colors hover:text-proPurple text-2xl"
                  onClick={() => {
                    onReactionClick?.(General.reactionType.LOVE);
                  }}
                >
                  <FaRegHeart className="h-fit w-fit" />
                  <span className="text-2xl font-medium">
                    {currentPost.likes || -1}
                  </span>
                </button>

                <button
                  className="flex items-center gap-2 transition-colors hover:text-proPurple text-2xl"
                  onClick={() => {
                    onCommentClick?.(General.reactionType.LOVE);
                  }}
                >
                  <FiMessageCircle className="h-fit w-fit" />
                  <span className="text-2xl font-medium">
                    {currentPost.comments || -1}
                  </span>
                </button>

                <div></div>
              </div>
              <div className="flex justify-between basis-[20%]">
                <button
                  className="flex items-center gap-2 transition-colors hover:text-proPurple text-2xl"
                  onClick={() => {
                    onSaveClick?.(General.reactionType.LOVE);
                  }}
                >
                  <FaRegBookmark className="h-fit w-fit" />
                </button>

                <button
                  className="flex items-center gap-2 transition-colors hover:text-proPurple text-2xl"
                  onClick={() => {
                    onShareClick?.(General.reactionType.LOVE);
                  }}
                >
                  <FiShare2 className="h-fit w-fit" />
                </button>
              </div>
            </div>

            <div className="mb-2 h-[1px] bg-black404040" />

            {/* Sort comments */}
            {/* <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Most relevant ▼
                </Button>
              </div> */}

            {/* Comments section */}
            {/* <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-secondary rounded-2xl px-3 py-2 inline-block">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h5 className="font-semibold text-sm">
                            {comment.author}
                          </h5>
                          {comment.isTopFan && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-[10px] bg-primary/10 text-primary border-0"
                            >
                              <Crown className="h-2.5 w-2.5 mr-0.5" />
                              Top fan
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm break-words">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 px-3">
                        <button className="text-xs font-semibold text-muted-foreground hover:underline">
                          Like
                        </button>
                        <button className="text-xs font-semibold text-muted-foreground hover:underline">
                          Reply
                        </button>
                        {comment.likes > 0 && (
                          <>
                            <button className="text-xs font-semibold text-muted-foreground hover:underline">
                              Edited
                            </button>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 fill-primary text-primary" />
                              <span className="text-xs font-semibold">
                                {comment.likes}
                              </span>
                            </div>
                          </>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {comment.time}
                        </span>
                      </div>
                      {comment.replies && (
                        <button className="flex items-center gap-2 mt-2 px-3 text-xs font-semibold text-muted-foreground hover:underline">
                          <div className="w-6 h-px bg-muted-foreground/30" />
                          View {comment.replies} reply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div> */}

            {/* Add comment */}
            {/* <div className="flex gap-2 mt-4 sticky bottom-0 bg-card pt-3 pb-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Write a comment..."
                    className="rounded-full bg-secondary border-0 focus-visible:ring-1 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-muted"
                    >
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-muted"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div> */}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DetailPostPage;
