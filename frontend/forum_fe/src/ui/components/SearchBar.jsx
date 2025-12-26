import { IoSearch } from "react-icons/io5";
import { FaStackOverflow } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa6";
import { useState } from "react";

const SearchBar = ({ onChanged, onSearch }) => {
  if (!onChanged) {
    onChanged = (value) => {};
  }
  const options = [
    {
      display: "Newest",
      icon: <FaStackOverflow className="h-4 w-4" />,
    },
    {
      display: "Most Favorite",
      icon: <FaArrowUp className="h-4 w-4" />,
    },
  ];

  const [selectedItem, setSelectedItem] = useState(options[0].display);
  onChanged(selectedItem);

  return (
    <div className="flex items-center justify-between w-full text-white ">
      {/* Search Input */}
      <div className="relative w-full md:w-96 basis-[60%]">
        <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground " />

        <input
          type="text"
          className="flex h-10 outline-none w-full rounded-2xl bg-white/20 px-10 py-5 text-base placeholder:text-muted-foreground"
          placeholder="Search"
          onKeyDown={function (e) {
            if (e.key == "Enter") {
              onSearch?.(e.target.value);
            }
          }}
        />
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between basis-[30%]">
        <span className="text-foreground/70 text-[18px] font-medium basis-[25%]">
          Sort By:
        </span>

        <div className="flex items-center justify-between basis-[70%]">
          {options.map((item) => (
            <button
              key={item.display}
              className={`text-[18px] flex gap-2 text-white opacity-40 items-center hover:opacity-100 transition-all duration-100 ease-linear ${
                selectedItem === item.display && "opacity-100 font-semibold"
              }`}
              onClick={() => setSelectedItem(item.display)}
            >
              {item.icon} {item.display}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
