import { FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { FiMessageCircle, FiShare2 } from "react-icons/fi";
import Button from "../elements/Button";
import General from "../../General/General";
const PostCard2 = ({
  variant = "",
  author = "",
  authorImg = "",
  title = "",
  description = "",
  likes = -1,
  comments = -1,
  thumbnail = "",
  date,
  isLiked = true,
  isSaved = false,
  isShared = false,
  onClick,
  onReactionClick,
  onCommentClick,
  onSaveClick,
  onShareClick,
}) => {
  const variants = {
    discuss: (
      <div
        className="text-white bg-white/10 hover:cursor-pointer flex items-start gap-4 p-6 rounded-xl transition-all duration-300 group hover:bg-white/20"
        onClick={onClick}
      >
        {/* Left Section */}
        <div className="flex-1 space-y-3">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden shrink-0">
              <img
                src={authorImg}
                alt={author}
                className="h-full w-full object-cover bg-gradient-to-br from-proPurple to-proPink"
              />
            </div>
            <div className="flex flex-col text-sm items-start">
              <div className="flex space-x-5">
                <span className="font-[18px] text-white/80">{author}</span>
                <span className="text-white/60 font-[18px]">{date}</span>
              </div>

              <h3 className="text-lg text-[18px] font-semibold text-white">
                {title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2 max-w-[1000px]">
            <p className="text-sm text-white/80 w-full min-h-[42px] whitespace-normal break-words line-clamp-2 font-[16px]">
              {description}
            </p>
          </div>

          {/* Engagement */}
          <div className="flex items-center justify-between w-2/5 text-white/70">
            <div className="flex justify-between basis-[75%]">
              <Button
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? "text-proPurple" : "text-white"
                } hover:opacity-50`}
                isStopPropagation={true}
                onClick={() => {
                  onReactionClick?.(General.reactionType.LOVE);
                }}
                is
              >
                <FaRegHeart className="h-5 w-5" />
                <span className="text-sm font-medium">{likes}</span>
              </Button>

              <Button
                className={`flex items-center gap-2 transition-colors text-white hover:opacity-50`}
                isStopPropagation={true}
                onClick={() => onCommentClick?.()}
              >
                <FiMessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{comments}</span>
              </Button>

              <div></div>
            </div>
            <div className="flex justify-between basis-[20%]">
              <Button
                className={`flex items-center gap-2 transition-colors ${
                  isSaved ? "text-proPurple" : "text-white"
                } hover:opacity-50`}
                isStopPropagation={true}
                onClick={(e) => onSaveClick?.(e)}
              >
                <FaRegBookmark className="h-5 w-5" />
              </Button>

              <Button
                className={`flex items-center gap-2 transition-colors ${
                  isShared ? "text-proPurple" : "text-white"
                } hover:opacity-50`}
                isStopPropagation={true}
                onClick={() => onShareClick?.()}
              >
                <FiShare2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-proPurple to-proPink">
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    ),
  };

  return variants[variant];
};

export default PostCard2;
