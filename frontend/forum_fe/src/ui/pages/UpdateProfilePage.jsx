import Footer from "../components/Footer";
import CreateProfileForm from "../components/CreateProfileForm";
import { createContext, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import { useGetMe } from "../../api/hooks/ProfileHook";
import toastHelper from "../../helper/ToastHelper";

export const UpdateProfilePage = createContext();

function CreateProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const getMyProfile = useGetMe();

  useEffect(
    function () {
      if (getMyProfile.isError) {
        toastHelper.error(getMyProfile.error.message);
      }
    },
    [getMyProfile.isError]
  );
  return (
    <CreateProfileContext.Provider value={{ isLoading, setIsLoading }}>
      {(isLoading || getMyProfile.isLoading) && <LoadingScreen></LoadingScreen>}
      {getMyProfile.isSuccess && getMyProfile.data && (
        <div className="w-[90%] px-20 py-5 m-auto">
          <CreateProfileForm></CreateProfileForm>
        </div>
      )}

      <Footer></Footer>
    </CreateProfileContext.Provider>
  );
}

export default UpdateProfilePage;
