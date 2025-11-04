import { Link, NavLink, useLocation } from "react-router-dom";
import logo_forum from "../../assets/Logo_Forum.svg";
import NavigationBar from "./NavigationBar";
import { useContext, useEffect, useState } from "react";
import Button from "../elements/Button";
import AppContext from "../Context/AppContext";

function Header({ variant = "transparent", className = "" }) {
  const variants = {
    primary: "bg-primary",
    transparent: "bg-transparent",
  };

  const appContext = useContext(AppContext);

  const location = useLocation();
  const pathname = location.pathname;
  const isShow =
    pathname != "/sign-in" &&
    pathname != "/sign-up" &&
    pathname != "/sign-up/verify-otp";

  const style = `${variants[variant]} z-100 h-[70px] px-(--primary-padding) flex flex-row items-stretch justify-between border-b-4 border-black404040 fixed top-0 left-0 right-0 ${className}`;

  return (
    <div className={style}>
      <Button type="NavLink" className="my-2.5" to="/">
        <img src={logo_forum} alt="Logo_Forum" />
      </Button>

      <NavigationBar className="" isShow={isShow} />

      {!appContext.isLogged && (
        <Button
          type="NavLink"
          to="/sign-in"
          className="px-10 py-1.5 bg-black border-3 border-white text-white text-[22px] font-semibold my-2.5 hover:bg-white/10 hover:shadow-glow transition-colors duration-200"
        >
          Sign In
        </Button>
      )}

      {appContext.isLogged && (
        <img
          src={appContext.currentUser?.avatar}
          alt={appContext.currentUser?.username || "avatar"}
          className="h-[90%] self-center aspect-square rounded-full bg-white"
        ></img>
      )}
    </div>
  );
}

export default Header;
