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
  const [isCallAgain, setIsCallAgain] = useState(false);

  const getMe = useGetMe(isLogged);

  useEffect(
    function () {
      setIsLoading(getMe.isLoading);
    },
    [getMe.isLoading]
  );

  useEffect(
    function () {
      if (getMe.isSuccess) {
        setCurrentUser(getMe.data);
      }
    },
    [getMe.isSuccess]
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

  useEffect(() => {
    if (isCallAgain) {
      getMe.refetch();
      setIsCallAgain(false);
    }
  }, [isCallAgain]);

  return (
    <AppContext.Provider
      value={{
        isLogged,
        setIsLogged,
        currentUser,
        setCurrentUser,
        setIsCallAgain,
      }}
    >
      {isLoading && <LoadingScreen />}
      <div className="bg-primary">
        <ToastContainer />
        <PageRouters />
      </div>
    </AppContext.Provider>
  );
}

export default App;
