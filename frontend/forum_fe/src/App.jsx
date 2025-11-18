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
  const getMe = useGetMe(false);
  const [currentUser, setCurrentUser] = useState(null);

  const nav = useNavigate();

  useEffect(
    function () {
      if (getMe.isError) {
        if (getMe.error.status == 404) {
          nav("/create-profile");
        }
      }

      if (getMe.isSuccess) {
        setCurrentUser(getMe.data);
      }
    },
    [getMe.isError, getMe.isSuccess, getMe.data]
  );

  useEffect(
    function () {
      if (isLogged) {
        getMe.refetch();
      } else {
        setCurrentUser(null);
      }
    },
    [flagGetCurrentUserAgain, isLogged]
  );

  return (
    <AppContext.Provider
      value={{
        isLogged,
        setIsLogged,
        currentUser: isLogged ? currentUser : null,
        getCurrentUserAgain,
      }}
    >
      <div className="bg-primary min-h-screen overflow-y-hidden">
        {isLogged && getMe.isPending && <LoadingScreen />}
        <ToastContainer />
        <PageRouters />
      </div>
    </AppContext.Provider>
  );
}

export default App;
