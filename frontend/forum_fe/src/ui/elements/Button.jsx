import { NavLink } from "react-router-dom";

function Button({
  type = "",
  className = "",
  whenActive = "",
  whenNotActive = "",
  to = "/",
  target = "_blank",
  onClick,
  children,
  isStopPropagation = false,
}) {
  const baseType = `hover:cursor-pointer ${className}`;
  if (type === "NavLink") {
    return (
      <NavLink
        className={({ isActive }) =>
          `${baseType} ${isActive ? whenActive : whenNotActive}`
        }
        to={to}
      >
        {children}
      </NavLink>
    );
  } else if (type === "Link") {
    return (
      <Link className={baseType} to={to}>
        {children}
      </Link>
    );
  } else if (type === "a") {
    return (
      <a href={to} target={target} className={baseType}>
        {children}
      </a>
    );
  } else {
    return (
      <button
        className={baseType}
        onClick={(e) => {
          if (isStopPropagation) e.stopPropagation();
          onClick();
        }}
      >
        {children}
      </button>
    );
  }
}

export default Button;
