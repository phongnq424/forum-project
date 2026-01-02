import { use, useContext, useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSearchUsers } from "@/api/hooks/ProfileHook.js";
import LoadingScreen from "./LoadingScreen.jsx";
import UserCard, { type UserInfo } from "../components/UserCard.js";
import { useNavigate } from "react-router-dom";
import AppContext from "../Context/AppContext";

function ContactPage() {
  const [keyword, setKeyword] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const searchUser = useSearchUsers(q, true);
  const nav = useNavigate();
  const appContext = useContext(AppContext) as any;

  function onSearch() {
    if (keyword.trim().length <= 0) return;

    setQ(keyword.trim());
    setKeyword("");
  }

  function navigateToDetailProfile(id: string) {
    if (appContext?.currentUser?.user_id != id) {
      nav(`/profile?id=${id}`);
    } else {
      nav(`/profile`);
    }
  }

  useEffect(() => {
    if (searchUser.isSuccess) {
      console.log(searchUser.data);
    }
  }, [searchUser.data, searchUser.isSuccess, searchUser.isError]);

  if (searchUser.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="px-[200px] pt-5 w-full min-h-full relative flex flex-col">
      <div className="relative md:w-[500px] basis-[60%]">
        <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />

        <input
          type="text"
          className="flex h-10 outline-none w-full rounded-2xl bg-white/20 px-10 py-5 text-base placeholder:text-muted-foreground"
          placeholder="Search"
          value={keyword}
          onChange={(v) => setKeyword(v.target.value)}
          onKeyDown={function (e) {
            if (e.key == "Enter") {
              onSearch();
            }
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-6 py-10">
        {searchUser.data?.map((user: any) => {
          const userInfo: UserInfo = {
            id: user?.id ?? "",
            cover: user?.cover ?? "",
            avatar: user?.Profile?.avatar ?? "",
            username: user?.username ?? "",
            fullName: user?.Profile?.fullname ?? "",
          };

          return (
            <UserCard
              key={userInfo.id}
              user={userInfo}
              onClick={(id) => {
                navigateToDetailProfile(id);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ContactPage;
