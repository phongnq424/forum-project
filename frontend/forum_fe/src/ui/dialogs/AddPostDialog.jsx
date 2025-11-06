import { useEffect, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

import ImagePicker from "../components/ImagePicker";
import { useGetTopic } from "../../api/hooks/topicHook";
import LoadingScreen from "../pages/LoadingScreen";
import { set } from "date-fns";
import toastHelper from "../../helper/ToastHelper";
import CustomDropDown from "../components/CustomDropDown/CustomDropDown";

export const AddPostDialog = ({ onClose, onSubmit, isLoading }) => {
  if (!onClose) {
    console.log("Dialog close");
  }
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [images, setImages] = useState([]);
  const [postTopic, setPostTopic] = useState();
  const [topics, setTopics] = useState([]);

  const getTopics = useGetTopic(false);

  useEffect(() => {
    if (getTopics.isSuccess) {
      setTopics(getTopics.data.data);
    }
    if (getTopics.isError) {
      toastHelper.error(getTopics.error.message);
    }
  }, [getTopics.isSuccess, getTopics.isError]);

  useEffect(() => {
    getTopics.refetch();
  }, []);

  const generalStyle =
    "outline-none flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[20px] " +
    "font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none " +
    "disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer";

  const iconSize = "h-10 w-10";
  const iconSize2 = "h-7 w-7";
  const ghostStyle = "hover:bg-accent hover:text-accent-foreground";

  return (
    <div className="fixed flex top-1 pt-10 inset-0 z-10 flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[80vw] h-[80vh] bg-[#404040] rounded-xl shadow-2xl">
        {(isLoading || getTopics.isLoading) && <LoadingScreen></LoadingScreen>}
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 rounded-t-xl bg-black">
          <h2 className="text-2xl font-bold text-white">CREATE POST</h2>
          <button
            onClick={onClose}
            className={`${generalStyle} ${iconSize2} ${ghostStyle} rounded-full hover:bg-secondary transition-colors [&>svg]:w-full [&>svg]:h-full`}
          >
            <IoMdCloseCircle className="text-white" />
          </button>
        </div>

        {/* body */}
        <div className="w-full overflow-auto flex p-2.5">
          <div className="flex flex-col justify-between basis-[55%]">
            {/* Text Input */}
            <div className="px-5">
              <h1 className="text-white text-[18px] font-semibold">
                Post's title
              </h1>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="What do you want to ask?"
                className="p-2 text-white w-full h-fit bg-primary rounded-xl placeholder:text-muted-foreground text-lg resize-none focus:outline-none"
              />
            </div>

            <div className="px-5 flex items-center w-[50%]">
              <h1 className="text-white text-[18px] basis-[40%] font-semibold">
                Topic
              </h1>

              {topics?.length >= 1 && (
                <CustomDropDown
                  options={topics}
                  displayField="name"
                  onChange={(value) => setPostTopic(value.id)}
                  indexValueSelected={0}
                  variant="addPost"
                />
              )}
            </div>

            <div className="px-5">
              <h1 className="text-white text-[18px] font-semibold">
                Post's content
              </h1>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Detail"
                className="p-2 text-white rounded-xl w-full h-[270px]  bg-primary text-foreground placeholder:text-muted-foreground text-lg resize-none focus:outline-none"
              />
            </div>
          </div>

          {/* Add to Post */}
          <div className="basis-[42%] h-[450px] pt-6 pb-2">
            <div className="rounded-xl bg-primary p-3 h-full flex flex-col space-y-2">
              <div className="flex justify-between w-full text-sm font-medium text-white/70">
                Add to your post
                <div className="w-7 h-7">
                  <ImagePicker
                    variant="post"
                    onChange={(file) => setImages((prev) => [...prev, file])}
                  />
                </div>
              </div>

              <div className="flex flex-col overflow-auto space-y-5 p-2">
                {images.map((item, index) => (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(item)}
                      alt={item.name}
                      className="object-cover w-full bg-gray-400"
                    />

                    <button
                      className="absolute right-0.5 top-0.5 w-5 h-5 text-red-600 font-bold hover:cursor-pointer"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <IoMdCloseCircle className="w-full h-full" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5">
          <button
            disabled={!postContent.trim() || !postTitle.trim()}
            className={`${generalStyle} bg-proPurple w-full h-12 font-semibold transition-all disabled:bg-mute text-white text-2xl disabled:opacity-50`}
            onClick={() =>
              onSubmit({
                postTitle,
                postContent,
                images,
                topic: postTopic,
              })
            }
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};
