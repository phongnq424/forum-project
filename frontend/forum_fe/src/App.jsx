import { useNavigate } from "react-router-dom";
import "./App.css";
import PageRouters from "./RouterForPage/PageRouters";
import { ToastContainer } from "react-toastify";
import AppContext from "./ui/Context/AppContext";
import { useEffect, useState } from "react";
import { useGetMe } from "./api/hooks/ProfileHook";
import LoadingScreen from "./ui/pages/LoadingScreen";
import tokenHelper from "./helper/TokenHelper";
import { connectSocket, disconnectSocket } from "./socket";

function App() {
  const [isLogged, setIsLogged] = useState(
    (tokenHelper.getToken() || "") != ""
  );

  const [token, setToken] = useState(tokenHelper.getToken() || "");

  const [flagGetCurrentUserAgain, getCurrentUserAgain] = useState(true);
  const getMe = useGetMe(token, isLogged);
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
      } else {
        setCurrentUser(null);
      }
    },
    [flagGetCurrentUserAgain, isLogged]
  );

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLogged,
        setIsLogged,
        currentUser: isLogged ? currentUser : null,
        getCurrentUserAgain,
        setToken,
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
