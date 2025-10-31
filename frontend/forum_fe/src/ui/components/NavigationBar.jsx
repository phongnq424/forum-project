import { BrowserRouter, NavLink } from "react-router-dom";
import Button from "../elements/Button";

export default function NavigationBar({ className, isShow }) {
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
      {isShow &&
        items.map((item) => (
          <Button
            type="NavLink"
            key={item.path}
            to={item.path}
            className="mx-0 text-[22px] font-medium flex items-center justify-center hover:text-proPurple transition-colors duration-200"
            whenActive="text-proPurple border-b-4 border-proPurple"
            whenNotActive="text-white"
          >
            {item.name}
          </Button>
        ))}
    </div>
  );
}
