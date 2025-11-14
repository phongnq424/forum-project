import { useNavigate } from "react-router-dom";
import "./App.css";
import PageRouters from "./RouterForPage/PageRouters";
import { ToastContainer } from "react-toastify";
import AppContext from "./ui/Context/AppContext";
import { useEffect, useState } from "react";
import { useGetMe } from "./api/hooks/ProfileHook";
import LoadingScreen from "./ui/pages/LoadingScreen";

function App() {
  const [isLogged, setIsLogged] = useState(
    (localStorage.getItem("token") || "") != ""
  );
  const [currentUser, setCurrentUser] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [flagGetCurrentUserAgain, getCurrentUserAgain] = useState(true);

  const getMe = useGetMe(false);

  useEffect(
    function () {
      if (isLogged) {
        getMe.refetch();
      }
    },
    [isLogged, flagGetCurrentUserAgain]
  );

  useEffect(
    function () {
      setIsLoading(getMe.isLoading);
    },
    [getMe.isLoading]
  );

  const nav = useNavigate();

  useEffect(
    function () {
      if (getMe.isError) {
        if (getMe.error.status == 404) {
          setCurrentUser(null);
          nav("/create-profile");
        }
      }
    },
    [getMe.isError]
  );

  useEffect(
    function () {
      getMe.refetch();
    },
    [flagGetCurrentUserAgain]
  );

  return (
    <AppContext.Provider
      value={{
        isLogged,
        setIsLogged,
        currentUser: isLogged ? getMe.data : null,
        getCurrentUserAgain,
      }}
    >
      {console.log(isLogged)}
      {isLoading && <LoadingScreen />}
      <div className="bg-primary min-h-screen overflow-y-hidden">
        <ToastContainer />
        <PageRouters />
      </div>
    </AppContext.Provider>
  );
}

export default App;
