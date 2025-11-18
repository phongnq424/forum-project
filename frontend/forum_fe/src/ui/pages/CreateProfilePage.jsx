import Footer from "../components/Footer";
import CreateProfileForm from "../components/CreateProfileForm";
import { createContext, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import { useLocation } from "react-router-dom";
import General from "../../General/General";
import { useGetMe } from "../../api/hooks/ProfileHook";
import toastHelper from "../../helper/ToastHelper";

export const CreateProfileContext = createContext();

function CreateProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const getMyProfile = useGetMe(false);

  var option = "";
  console.log(location);
  switch (location.pathname) {
    case "/update-profile":
      option = General.optionOfCreateProfilePage.UPDATE;
      getMyProfile.refetch();
      break;
    default:
      option = General.optionOfCreateProfilePage.CREATE;
  }

  useEffect(
    function () {
      if (getMyProfile.isError) {
        toastHelper.error(getMyProfile.error.message);
      }
    },
    [getMyProfile.isError]
  );

  return (
    <CreateProfileContext.Provider value={{ isLoading, setIsLoading, option }}>
      {(isLoading || getMyProfile.isLoading) && <LoadingScreen></LoadingScreen>}

      <div className="w-[90%] px-20 py-5 m-auto">
        {option === General.optionOfCreateProfilePage.CREATE && (
          <CreateProfileForm></CreateProfileForm>
        )}
        {option === General.optionOfCreateProfilePage.UPDATE &&
        getMyProfile.isSuccess &&
        getMyProfile.data ? (
          <CreateProfileForm currentProfile={getMyProfile.data} />
        ) : (
          <></>
        )}
      </div>
    </CreateProfileContext.Provider>
  );
}

export default CreateProfilePage;
