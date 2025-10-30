import { BrowserRouter, NavLink } from "react-router-dom";

export default function NavigationBar({ className }) {
  const items = [
    { name: "Discuss", path: "/discuss" },
    { name: "Challenges", path: "/challenges" },
    { name: "Contact", path: "/contact" },
    { name: "Chat", path: "/chat" },
  ];

  return (
    <div
      className={`flex ${className} flex justify-around px-0 basis-[50%] items-stretch`}
    >
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `mx-0 text-[22px] font-medium flex items-center justify-center hover:text-proPurple transition-colors duration-200 ${
              isActive
                ? "text-proPurple border-b-4 border-proPurple"
                : "text-white"
            }`
          }
        >
          {item.name}
        </NavLink>
      ))}
    </div>
  );
}
