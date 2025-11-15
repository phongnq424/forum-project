import {
  useParams,
  Link,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  useDeletePost,
  useGetPostById,
  useSavePost,
  useUpdatePost,
} from "../../api/hooks/postHook";
import { MdMoreHoriz } from "react-icons/md";
import { FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { FiMessageCircle, FiShare2 } from "react-icons/fi";
import { useToggleReaction } from "../../api/hooks/reactionHook";
import toastHelper from "../../helper/ToastHelper";
import General from "../../General/General";
import {
  useAddComment,
  useDeleteComment,
  useGetCommentsOfPost,
  useUpdateComment,
} from "../../api/hooks/commentHook";
import LoadingScreen from "./LoadingScreen";
import AppContext from "../Context/AppContext";
import { IoMdSend } from "react-icons/io";
import CustomDropDown2 from "../components/CustomDropDown/CustomDropDown2";
import { AddPostDialog } from "../dialogs/AddPostDialog";

export const DetailPostPageContext = createContext();

const DetailPostPage = () => {
  const [getParams, setParams] = useSearchParams();
  const postId = getParams.get("postId");
  const location = useLocation();
  const [currentPost, setCurrentPost] = useState(location?.state?.post);
  const getPostById = useGetPostById(currentPost.id);
  const toggleReaction = useToggleReaction(null, null);
  const getCommentsOfPost = useGetCommentsOfPost(currentPost.id);
  const appContext = useContext(AppContext);
  const [replyTo, setReplyTo] = useState(null);
  const addComment = useAddComment();
  const [content, setContent] = useState("");
  const deletePost = useDeletePost();
  const navigate = useNavigate();
  const deleteComment = useDeleteComment();
  const savePost = useSavePost();
  const [isDialogClosing, setIsDialogClosing] = useState(true);
  const updatePost = useUpdatePost();
  const updateComment = useUpdateComment();
  useEffect(
    function () {
      if (updatePost.isError) {
        toastHelper.error(updatePost.error.message);
      }
      if (updatePost.isSuccess) {
        toastHelper.success("Update post successfully");
        setIsDialogClosing(true);
        setCurrentPost(updatePost.data);
      }
    },
    [updatePost.isError, updatePost.isSuccess, updatePost.data]
  );
  useEffect(
    function () {
      if (savePost.isError) {
        toastHelper.error(savePost.error.message);
      }

      if (savePost.isSuccess) {
        toastHelper.success(
          savePost.data.saved ? "Save successfully!" : "Unsave successfully!"
        );
      }
    },
    [savePost.isSuccess, savePost.isError, savePost.data]
  );

  const optionsForPost = {
    DELETE: { id: 0, name: "Delete", showFor: [General.showFor.OWN] },
    EDIT: { id: 1, name: "Edit", showFor: [General.showFor.OWN] },
    REPORT: { id: 2, name: "Report", showFor: [General.showFor.VIEWER] },
    asArray() {
      return Object.values(this).filter((item) => typeof item != "function");
    },
  };

  const optionsForCmt = {
    DELETE: { id: 0, name: "Delete", showFor: [General.showFor.OWN] },
    EDIT: { id: 1, name: "Edit", showFor: [General.showFor.OWN] },
    REPORT: { id: 2, name: "Report", showFor: [General.showFor.VIEWER] },
    asArray() {
      return Object.values(this).filter((item) => typeof item != "function");
    },
  };

  const refDropDownForPost = useRef();
  const commentRefs = useRef({});

  function handlePostAction(option) {
    if (option.id === optionsForPost.DELETE.id) {
      deletePost.mutate({ postId });
    } else if (option.id === optionsForPost.EDIT.id) {
      setIsDialogClosing(false);
    }
  }

  // Usestate for edit comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  function handleCommentAction(option, objectId, commentContent = "") {
    if (option.id === optionsForCmt.DELETE.id) {
      deleteComment.mutate({ cmtId: objectId });
    }

    if (option.id == optionsForCmt.EDIT.id) {
      setEditingCommentId(objectId);
      setEditingCommentContent(commentContent);
    }
  }

  useEffect(() => {
    if (deletePost.isError) {
      toastHelper.error(deletePost.error.message);
    }

    if (deletePost.isSuccess) {
      toastHelper.success("Delete post successfully!");
      navigate(-1);
    }
  }, [deletePost.isError, deletePost.isSuccess]);

  useEffect(() => {
    if (deleteComment.isError) {
      toastHelper.error(deleteComment.error.message);
    }

    if (deleteComment.isSuccess) {
      toastHelper.success("Delete comment successfully!");
      getCommentsOfPost.refetch();
    }
  }, [deleteComment.isError, deleteComment.isSuccess]);

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

  // Handle after comment
  useEffect(
    function () {
      if (addComment.isSuccess) {
        setContent("");
        setReplyTo(null);
        getCommentsOfPost.refetch();
      }
      if (addComment.isError) {
        toastHelper.error(addComment.error.message);
      }
    },
    [addComment.isError, addComment.isSuccess]
  );

  // handle edit cmt
  useEffect(
    function () {
      if (updateComment.isSuccess) {
        getCommentsOfPost.refetch();
      }
      if (updateComment.isError) {
        toastHelper.error(updateComment.error.message);
      }
    },
    [updateComment.isError, updateComment.isSuccess, updateComment.data]
  );

  const onReactionClick = function (type) {
    toggleReaction.mutate({ postId, type });
  };

  const onCommentClick = function (content) {};

  const onShareClick = function () {};

  const onSaveClick = function () {
    savePost.mutate({ postId: currentPost.id });
  };

  useEffect(
    function () {
      if (getPostById.isSuccess) {
        setCurrentPost(getPostById.data);
      }
    },
    [getPostById.isSuccess, getPostById.isError]
  );

  if (!currentPost) return <></>;

  const handleOnClickOnUserInfo = function (currentPost) {
    if (appContext?.currentUser?.user_id != currentPost.user.id) {
      navigate(`/profile?id=${currentPost.user.id}`);
    } else {
      navigate(`/profile`);
    }
  };

  return (
    <>
      <main className="h-(--view-h) w-full overflow-hidden px-(--primary-padding)">
        <div className="flex flex-col lg:flex-row justify-between w-full h-(--view-h) overflow-hidden">
          {/* Left side - Large image viewer */}
          <div className="lg:w-[43%] bg-primary flex flex-col items-start justify-start h-(--view-h) overflow-y-auto">
            {/* <button
                  className={`${button_base} ${button_ghost} ${button_icon} gap-2  group text-white hover:[&>*]:text-proPurple hover:text-proPurple ml-10`}
                >
                  <FaArrowLeft className="h-full w-full group-hover" />
                  Back
                </button> */}

            <div className="self-stretch flex flex-col justify-start space-y-5">
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
          <div className="relative flex flex-col lg:w-[53%] overflow-y-auto h-(--view-h) bg-white/5">
            {(getCommentsOfPost.isLoading ||
              addComment.isPending ||
              deletePost.isPending) && <LoadingScreen />}
            <div className="p-4 flex flex-col">
              {/* Author and title */}
              <div className="flex flex-col space-y-4 pb-4">
                {/* Author */}
                <div className="flex items-center justify-between hover:cursor-pointer">
                  <div
                    className="flex items-center gap-3"
                    onClick={function () {
                      handleOnClickOnUserInfo(currentPost);
                    }}
                  >
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

                  <div className="relative">
                    <button
                      className="flex justify-center items-center p-1 rounded-full hover:bg-white/10"
                      onClick={() => refDropDownForPost.current.open()}
                    >
                      <MdMoreHoriz className="text-xl text-white" />
                    </button>
                    <CustomDropDown2
                      onSelect={(option) => handlePostAction(option)}
                      ref={refDropDownForPost}
                      displayField="name"
                      className="right-[20px]"
                      options={optionsForPost.asArray().filter((item) => {
                        if (item.showFor.includes(General.showFor.ALL))
                          return true;
                        if (
                          appContext.currentUser?.user_id ===
                          currentPost.user.id
                        ) {
                          return item.showFor.includes(General.showFor.OWN);
                        } else {
                          return item.showFor.includes(General.showFor.VIEWER);
                        }
                      })}
                    />
                  </div>
                </div>
                {/* Content */}
                <div className="flex flex-col space-y-5">
                  {/* Post title */}
                  <p className="text-2xl font-bold leading-relaxed text-white">
                    {currentPost.title}
                  </p>

                  <div className="flex py-1 px-2 rounded-md space-x-2.5 bg-proPurple w-fit">
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
                    className="flex items-center gap-2 transition-colors hover:text-proPurple text-xl"
                    onClick={() => {
                      onReactionClick?.(General.reactionType.LOVE);
                    }}
                  >
                    <FaRegHeart className="h-fit w-fit" />
                    <span className="text-xl font-medium">
                      {currentPost.likes || -1}
                    </span>
                  </button>

                  <button
                    className="flex items-center gap-2 transition-colors hover:text-proPurple text-xl"
                    onClick={() => {
                      onCommentClick?.(General.reactionType.LOVE);
                    }}
                  >
                    <FiMessageCircle className="h-fit w-fit" />
                    <span className="text-xl font-medium">
                      {currentPost.comments || -1}
                    </span>
                  </button>

                  <div></div>
                </div>
                <div className="flex justify-between basis-[20%]">
                  <button
                    className="flex items-center gap-2 transition-colors hover:text-proPurple text-xl"
                    onClick={() => {
                      onSaveClick?.();
                    }}
                  >
                    <FaRegBookmark className="h-fit w-fit" />
                  </button>

                  <button
                    className="flex items-center gap-2 transition-colors hover:text-proPurple text-xl"
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

              {getCommentsOfPost.data?.length > 0 && (
                <div className="space-y-4 text-white">
                  {getCommentsOfPost.data.map((comment) => {
                    const renderComment = (commentItem, level = 0) => (
                      <div
                        key={commentItem.id}
                        className={`flex gap-2 ${level > 0 ? "ms-6" : ""}`}
                      >
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={
                            commentItem.user?.Profile?.avatar ||
                            commentItem?.User?.Profile?.avatar
                          }
                          alt={
                            commentItem.user?.username ||
                            commentItem.User?.username
                          }
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex space-x-1">
                            {/* Author info */}
                            <div className="bg-black404040 rounded-2xl px-3 py-2 inline-block">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h5 className="font-semibold text-[16px]">
                                  {commentItem.user?.username ||
                                    commentItem.User?.username}
                                </h5>
                              </div>

                              {/* Neu state editingCmntId === id cua comment nay thi */}
                              {editingCommentId === commentItem.id ? (
                                <div className="flex flex-col space-y-2">
                                  <textarea
                                    className="w-full py-2 px-3 max-h-[200px] overflow-y-auto text-[16px] outline-none text-white resize-none rounded-lg bg-white/10 focus:ring-2 focus:ring-proPurple"
                                    value={editingCommentContent}
                                    onChange={(e) =>
                                      setEditingCommentContent(e.target.value)
                                    }
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      disabled={editingCommentContent === ""}
                                      className="px-3 py-1 text-sm bg-proPurple rounded text-white disabled:opacity-50"
                                      onClick={() => {
                                        updateComment.mutate({
                                          id: editingCommentId,
                                          content: editingCommentContent,
                                        });

                                        setEditingCommentId(null);
                                        setEditingCommentContent("");
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="px-3 py-1 text-sm bg-gray-500 rounded text-white"
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingCommentContent("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[14px] break-words break-all whitespace-normal">
                                  {commentItem.content}
                                </p>
                              )}
                            </div>

                            <div className="relative">
                              <CustomDropDown2
                                ref={(el) =>
                                  (commentRefs.current[commentItem.id] = el)
                                }
                                onSelect={(option) =>
                                  handleCommentAction(
                                    option,
                                    commentItem.id,
                                    commentItem.content
                                  )
                                }
                                className="absolute right-0 top-5 z-50"
                                displayField="name"
                                options={optionsForCmt
                                  .asArray()
                                  .filter((item) => {
                                    if (
                                      item.showFor.includes(General.showFor.ALL)
                                    )
                                      return true;
                                    if (
                                      appContext.currentUser?.user_id ===
                                      commentItem.user.id
                                    ) {
                                      return item.showFor.includes(
                                        General.showFor.OWN
                                      );
                                    } else {
                                      return item.showFor.includes(
                                        General.showFor.VIEWER
                                      );
                                    }
                                  })}
                              />

                              <button
                                className="hover:bg-white/10 rounded-full p-1"
                                onClick={() => {
                                  if (!commentRefs.current[commentItem.id])
                                    return;
                                  commentRefs.current[commentItem.id].open();
                                }}
                              >
                                <MdMoreHoriz className="h-5 w-5 text-white" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-1 px-3">
                            <button className="text-[14px] font-semibold text-muted-foreground hover:underline">
                              Rate
                            </button>

                            {level == 0 && (
                              <button
                                className="text-[14px] font-semibold text-muted-foreground hover:underline"
                                onClick={() => setReplyTo(commentItem)}
                              >
                                Reply
                              </button>
                            )}

                            {commentItem.childComments?.length > 0 && (
                              <button className="text-[14px] font-semibold text-muted-foreground hover:underline">
                                View {commentItem.childComments.length} reply
                              </button>
                            )}

                            <span className="text-[14px] text-muted-foreground">
                              {commentItem.createAt}
                            </span>
                          </div>

                          <div className="space-y-1 pt-1.5 text-white">
                            {commentItem.childComments?.length > 0 &&
                              commentItem.childComments.map((child) =>
                                renderComment(child, level + 1)
                              )}
                          </div>
                        </div>
                      </div>
                    );

                    return renderComment(comment);
                  })}
                </div>
              )}
            </div>

            {/* Add comment */}

            <div className="flex flex-col items-center bg-primary sticky h-auto mt-auto right-0 left-0 bottom-0 bg-card px-3 py-1">
              {replyTo && (
                <div className="flex space-x-2 justify-start self-stretch items-center">
                  <p className="text-sm text-white me-5">
                    Reply to <b>{replyTo.user.username}</b>
                  </p>
                  <button
                    className="text-white text-sm hover:underline"
                    onClick={() => setReplyTo(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 w-full py-2 px-2 ">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={appContext.currentUser?.avatar}
                  alt={appContext.currentUser?.username}
                />

                <textarea
                  placeholder="Add your answer"
                  value={content}
                  className="w-full py-2 px-3 max-h-[200px] overflow-y-auto text-[18px] outline-none text-white resize-none rounded-lg bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear"
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 200) + "px";
                  }}
                  rows="1"
                  onChange={(e) => setContent(e.target.value)}
                />
                <button
                  className="px-0 cursor-not-allowed"
                  disabled={!content || content === ""}
                  onClick={() => {
                    addComment.mutate({
                      postId: currentPost.id,
                      content: content,
                      parent: replyTo?.id,
                    });
                  }}
                >
                  <IoMdSend
                    className={`h-10 w-10 text-proPurple hover:${
                      !content || content === ""
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        {!isDialogClosing && (
          <AddPostDialog
            isLoading={updatePost.isPending}
            onClose={() => setIsDialogClosing(true)}
            onSubmit={(submitData) => updatePost.mutate(submitData)}
            currentPost={currentPost}
          />
        )}
      </main>
    </>
  );
};

export default DetailPostPage;
