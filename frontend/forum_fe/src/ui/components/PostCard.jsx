import logoReact from "../../assets/react.svg";
import Button from "../elements/Button";
import { FaBookmark, FaHeart } from "react-icons/fa";
import { TbMessageCircleFilled } from "react-icons/tb";
import { IoMdShare } from "react-icons/io";

const PostCard = ({ title, author, image, likes, comments, avatar }) => {
  return (
    <div
      className={`group pointer-events-auto w-[350px] h-fit relative overflow-hidden rounded-2xl border border-transparent bg-transparent shadow-[0_0_20px_2px] p-6 shadow-[rgba(255,255,255,0.5)] transition-all duration-300 hover:shadow-proPurple hover:cursor-pointer hover:scale-105`}
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
          <h3 className="font-semibold text-foreground text-[20px]">{title}</h3>
        </div>
      </div>

      {/* Image */}
      <div className="mb-4 overflow-hidden f-fit h-48 w-full rounded-xl">
        <img
          src={image || logoReact}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="basis-[60%] flex justify-between">
          <Button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <FaHeart className="h-5 w-5" />
            <span className="text-sm font-medium">{likes}</span>
          </Button>

          <Button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <TbMessageCircleFilled className="h-5 w-5" />
            <span className="text-sm font-medium">{comments}</span>
          </Button>
        </div>

        <div className="basis-[20%] flex justify-between">
          <Button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <FaBookmark className="h-5 w-5" />
          </Button>

          <Button className="flex items-center gap-2 transition-colors hover:text-proPurple">
            <IoMdShare className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
