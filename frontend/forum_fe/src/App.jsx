import { useNavigate } from "react-router-dom";
import "./App.css";
import PageRouters from "./RouterForPage/PageRouters";
import { ToastContainer } from "react-toastify";
import AppContext from "./ui/Context/AppContext";
import { useEffect, useState } from "react";
import { useGetMe } from "./api/hooks/ProfileHook";
import LoadingScreen from "./ui/pages/LoadingScreen";

function App() {
  console.log("APP RENDER");

  const [isLogged, setIsLogged] = useState(
    (localStorage.getItem("token") || "") != ""
  );

  const [flagGetCurrentUserAgain, getCurrentUserAgain] = useState(true);

  const getMe = useGetMe(isLogged);

  useEffect(
    function () {
      if (getMe.isSuccess) {
        localStorage.setItem("meId", getMe.data.user_id);
      }
    },
    [getMe.isSuccess]
  );

  const nav = useNavigate();

  useEffect(
    function () {
      if (getMe.isError) {
        if (getMe.error.status == 404) {
          nav("/create-profile");
        }
      }
    },
    [getMe.isError]
  );

  return (
    <AppContext.Provider
      value={{
        isLogged,
        setIsLogged,
        currentUser: getMe.data,
        getCurrentUserAgain,
      }}
    >
      {getMe.isLoading && <LoadingScreen />}
      <div className="bg-primary min-h-screen overflow-y-hidden">
        <ToastContainer />
        <PageRouters />
      </div>
    </AppContext.Provider>
  );
}

export default App;
