import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import QueryProvider from "./providers/QueryProvider";
import PageRouters from "./RouterForPage/PageRouters";
import { ToastContainer } from "react-toastify";
import AppContext from "./ui/Context/AppContext";
import { useEffect, useState } from "react";
import { useGetMe } from "./api/hooks/UsersHook";
import { get } from "react-hook-form";

function App() {
  const [isLogged, setIsLogged] = useState(
    (localStorage.getItem("token") || "") != ""
  );
  const [currentUser, setCurrentUser] = useState();

  const getMe = useGetMe(
    // function (response) {
    //   setCurrentUser(response);
    //   console.log(response);
    // },
    // function (error) {
    //   console.error(error);
    // },
    isLogged
  );

  useEffect(
    function () {
      setCurrentUser(getMe.data);
    },
    [getMe.data, getMe.isSuccess]
  );
  return (
    <AppContext.Provider
      value={{ isLogged, setIsLogged, currentUser, setCurrentUser }}
    >
      <div className="bg-primary">
        <ToastContainer />
        <PageRouters />
      </div>
    </AppContext.Provider>
  );
}

export default App;
