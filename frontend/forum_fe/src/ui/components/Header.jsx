import { Link, NavLink } from "react-router-dom";
import logo_forum from "../../assets/Logo_Forum.svg";
import NavigationBar from "./NavigationBar";

function Header({ variant = "transparent", className = "" }) {
  const variants = {
    primary: "bg-primary",
    transparent: "bg-transparent",
  };

  const style = `${variants[variant]} z-100 px-(--primary-padding) flex flex-row items-stretch justify-between border-b-4 border-black404040 fixed top-0 left-0 right-0 ${className}`;

  return (
    <div className={style}>
      <Link className="my-2.5" to="/">
        <img src={logo_forum} alt="Logo_Forum" />
      </Link>

      <NavigationBar className="" />

      <NavLink
        to="/Login"
        className="px-10 py-1.5 bg-black border-3 border-white text-white text-[22px] font-semibold my-2.5 hover:bg-white/10 hover:shadow-glow transition-colors duration-200"
      >
        Sign In
      </NavLink>
    </div>
  );
}

export default Header;
