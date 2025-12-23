import { useEffect, useRef, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

import ImagePicker from "../components/ImagePicker";
import LoadingScreen from "../pages/LoadingScreen";
import toastHelper from "../../helper/ToastHelper";
import CustomDropDown from "../components/CustomDropDown/CustomDropDown";
import { useGetCategories } from "../../api/hooks/categoriesHook";

export const AddPostDialog = ({
  onClose,
  onSubmit,
  isLoading,
  currentPost = null,
}) => {
  const [postContent, setPostContent] = useState(
    currentPost?.description || ""
  );
  const [postTitle, setPostTitle] = useState(currentPost?.title || "");
  const [images, setImages] = useState([]);
  const [postTopic, setPostTopic] = useState();
  const [category, setCategory] = useState(null);
  const getCategories = useGetCategories();
  const refTopicDropDown = useRef();
  const refCateDropDown = useRef();

  useEffect(
    function () {
      if (getCategories.isError) {
        toastHelper.error(getCategories.error.message);
        return <></>;
      }
    },
    [getCategories.data, getCategories.isSuccess, getCategories.isError]
  );

  const generalStyle =
    "outline-none flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[20px] " +
    "font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none " +
    "disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer";

  const iconSize2 = "h-7 w-7";
  const ghostStyle = "hover:bg-accent hover:text-accent-foreground";

  return (
    <div className="fixed flex top-1 pt-10 inset-0 z-10 flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[90%] h-[90%] bg-[#404040] rounded-xl shadow-2xl flex flex-col justify-between">
        {(isLoading || getCategories.isLoading) && (
          <LoadingScreen></LoadingScreen>
        )}
        {/* Header */}
        <div className="flex items-center justify-between h-[10%] px-4 py-3 rounded-t-xl bg-black">
          <h2 className="text-2xl font-bold text-white">CREATE POST</h2>
          <button
            onClick={onClose}
            className={`${generalStyle} ${iconSize2} ${ghostStyle} rounded-full hover:bg-secondary transition-colors [&>svg]:w-full [&>svg]:h-full`}
          >
            <IoMdCloseCircle className="text-white" />
          </button>
        </div>

        {/* body */}
        <div className=" px-5 py-5 h-[90%] flex flex-col justify-between">
          <div className="w-full h-[85%] flex justify-between">
            {/* Title, content, ... */}
            <div className="flex flex-col space-y-2.5 basis-[55%]">
              <div className="">
                <h1 className="text-white text-[18px] font-semibold">Title</h1>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="What do you want to ask?"
                  className="p-2 text-white w-full h-fit bg-primary rounded-xl placeholder:text-muted-foreground text-lg resize-none focus:outline-none"
                />
              </div>

              <div className="flex space-x-5">
                <div className="flex flex-col items-start">
                  <h1 className="text-white text-[18px] basis-[30%] font-semibold">
                    Category
                  </h1>

                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder=""
                      value={category?.name}
                      readOnly
                      onClick={() => refCateDropDown?.current?.open()}
                      className="p-2 hover:cursor-pointer text-white w-full h-fit bg-primary rounded-xl placeholder:text-muted-foreground text-lg resize-none focus:outline-none"
                    ></input>
                    <CustomDropDown
                      ref={refCateDropDown}
                      options={getCategories.data?.data}
                      onSelected={(value) => {
                        setCategory(value);
                      }}
                      displayField="name"
                      initIndexSelected={
                        currentPost === null
                          ? 0
                          : getCategories.data?.data?.findIndex((c) =>
                              c.Topic.some(
                                (tp) => tp.id === currentPost.topic.id
                              )
                            ) || 0
                      }
                      variant="addPost"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  <h1 className="text-white text-[18px] basis-[30%] font-semibold">
                    Topic
                  </h1>

                  <div className="relative w-full">
                    {/* Ô input hiện tại */}
                    <input
                      type="text"
                      placeholder=""
                      value={postTopic?.name}
                      readOnly
                      onClick={() => refTopicDropDown?.current?.open()}
                      className="p-2 hover:cursor-pointer text-white w-full h-fit bg-primary rounded-xl placeholder:text-muted-foreground text-lg resize-none focus:outline-none"
                    ></input>

                    <CustomDropDown
                      ref={refTopicDropDown}
                      options={category?.Topic}
                      onSelected={(value) => {
                        setPostTopic(value);
                      }}
                      displayField="name"
                      initIndexSelected={
                        currentPost === null
                          ? 0
                          : category?.Topic?.findIndex(
                              (tp) => tp.id === currentPost.topic.id
                            ) || 0
                      }
                      variant="addPost"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <h1 className="text-white text-[18px] font-semibold">
                  Content
                </h1>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Detail"
                  className="p-2 text-white rounded-xl w-full h-full bg-primary text-foreground placeholder:text-muted-foreground text-lg resize-none overflow-auto focus:outline-none"
                />
              </div>
            </div>

            {/* Add to Post */}
            <div className="basis-[42%] h-full">
              <div className="rounded-xl bg-primary flex flex-col p-3 h-full space-y-2">
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
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
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

          <div className="mt-2.5 h-[10%]">
            <button
              disabled={!postContent.trim() || !postTitle.trim()}
              className={`${generalStyle} bg-proPurple w-full h-full flex-col justify-center font-semibold transition-all disabled:bg-mute text-white text-2xl disabled:opacity-50`}
              onClick={() => {
                onSubmit({
                  postTitle,
                  postContent,
                  images,
                  topic: postTopic.id,
                  id: currentPost?.id || "",
                });
              }}
            >
              {currentPost ? "Save Change" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

async function convertUrlsToFiles(urls) {
  return Promise.all(
    urls.map(async (url) => {
      const filename = url.split("/").pop();
      return await urlToFile(url, filename);
    })
  );
}
