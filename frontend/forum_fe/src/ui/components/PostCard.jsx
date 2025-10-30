import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import logoReact from "../../assets/react.svg";

const PostCard = ({
  title,
  author,
  image,
  likes,
  comments,
  avatar,
  top,
  left,
}) => {
  return (
    <div
      className={`top-${top} left-${left} left-[100px] group relative overflow-hidden rounded-2xl border border-transparent shadow-[0_0_20px_2px] p-6 shadow-[rgba(255,255,255,0.5)] transition-all duration-300 hover:border-proPurple hover:shadow-proPurple w-[300px]`}
    >
      {/* Author */}
      <div className="mb-4 flex flex-row items-center gap-3">
        <div className="h-10 w-10">
          <img
            src={avatar || logoReact}
            alt={author}
            className="h-full w-full rounded-full"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      {/* Image */}
      <div className="mb-4 overflow-hidden f-fit h-48 w-full">
        <img
          src={image || logoReact}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="basis-[60%] flex justify-between">
          <button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">{likes}</span>
          </button>

          <button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{comments}</span>
          </button>
        </div>

        <div className="basis-[20%] flex justify-between">
          <button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <Bookmark className="h-5 w-5" />
          </button>

          <button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
