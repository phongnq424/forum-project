import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo_forum from "../../assets/Logo_Forum.svg";
import NavigationBar from "./NavigationBar";
import { useContext, useEffect, useRef, useState } from "react";
import Button from "../elements/Button";
import AppContext from "../Context/AppContext";
import General from "../../General/General";
import CustomDropDown3 from "./CustomDropDown/CustomDropDown3";
import { useLogOut } from "../../api/hooks/AuthenticationHook";
import ChangePasswordDialog from "../components/changePassword/changePasswordDialog";
import { toast } from "react-toastify";
import { NotificationBell } from "./bellNotification.tsx";
import { fa } from "zod/v4/locales";
import LoadingScreen from "../pages/LoadingScreen";

function Header({ variant = "transparent", className = "" }) {
  const variants = {
    primary: "bg-primary",
    transparent: "bg-transparent",
  };

  const refMenu = useRef();
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);

  const appContext = useContext(AppContext);
  const logOut = useLogOut();
  useEffect(
    function () {
      if (logOut.isSuccess) {
        navigate("/sign-in");
        appContext.setIsLogged(false);
      }
      if (logOut.isError) {
        toast.error(logOut.error.message);
      }
    },
    [logOut.isSuccess, logOut.isError]
  );
  const navigate = useNavigate();

  const handleOnMenuSelection = function (option) {
    if (option.id === General.menuOptions.LOG_OUT.id) {
      logOut.mutate();
    } else if (option.id === General.menuOptions.SEE_PROFILE.id) {
      navigate("/profile");
    } else if (option.id === General.menuOptions.EDIT_PROFILE.id) {
      navigate("/update-profile");
    } else if (option.id === General.menuOptions.CHANGE_PASSWORD.id) {
      setChangePasswordDialogOpen(true);
    } else if (option.id === General.menuOptions.ADMIN.id) {
      navigate("/admin");
    }
  };

  const location = useLocation();
  const pathname = location.pathname;
  const isShow =
    pathname != "/sign-in" &&
    pathname != "/sign-up" &&
    pathname != "/sign-up/verify-otp" &&
    pathname != "/create-profile";

  const style = `${variants[variant]} z-55 h-[70px] px-(--primary-padding) flex flex-row items-stretch justify-between border-b-4 border-black404040 fixed top-0 left-0 right-0 ${className}`;

  return (
    <div className={style}>
      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        setOpen={setChangePasswordDialogOpen}
      />
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
        <div className="flex space-x-3">
          <NotificationBell className="bg-transparent" />
          <div className="relative self-center w-fit h-fit">
            <button
              className="w-fit h-fit"
              onClick={() => refMenu.current.open()}
            >
              <img
                src={appContext.currentUser?.avatar}
                alt={appContext.currentUser?.username || "avatar"}
                className="h-[60px] w-[60px]  rounded-full bg-white object-cover"
              ></img>
            </button>

            <CustomDropDown3
              onSelect={(option) => handleOnMenuSelection(option)}
              ref={refMenu}
              className="right-[2px]"
              options={General.menuOptions
                .asArray()
                .filter(
                  (i) =>
                    !i?.isAdminFeature ||
                    (i?.isAdminFeature &&
                      appContext.currentUser?.role ===
                        General.accountRoles.ADMIN)
                )}
              displayField="name"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
