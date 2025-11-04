import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import PageRouters from "./RouterForPage/PageRouters";
import { ToastContainer } from "react-toastify";
import AppContext from "./ui/Context/AppContext";
import { useEffect, useState } from "react";
import { useGetMe } from "./api/hooks/ProfileHook";

function App() {
  const [isLogged, setIsLogged] = useState(
    (localStorage.getItem("token") || "") != ""
  );
  const [currentUser, setCurrentUser] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const getMe = useGetMe(isLogged);

  useEffect(
    function () {
      setIsLoading(getMe.isLoading);
      if (getMe.isSuccess) {
        setCurrentUser(getMe.data);
      } else if (getMe.isError) {
        console.log(getMe.error.message);
      }
    },
    [getMe.isLoading]
  );

  return (
    <AppContext.Provider
      value={{
        isLogged,
        setIsLogged,
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
      }}
    >
      <div className="bg-primary">
        <ToastContainer />
        <PageRouters />
      </div>
    </AppContext.Provider>
  );
}

export default App;
