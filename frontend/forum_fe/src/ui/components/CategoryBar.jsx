import { useEffect, useState } from "react";

const CategoryBar = ({
  onChanged,
  categories,
  textSize,
  variant = "discuss",
  initIndex = 0,
}) => {
  if (categories?.length <= 0) {
    return <></>;
  }

  const [selectedItem, setSelectedItem] = useState(categories[initIndex]);

  if (!onChanged) {
    onChanged = (value) => {
      console.log(value);
    };
  }

  useEffect(() => onChanged?.(selectedItem), [selectedItem]);

  const variants = {
    discuss: (
      <div className="flex items-center justify-between gap-4 w-full text-[18px] text-white">
        {/* Categories */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={function () {
                setSelectedItem(category);
                onChanged?.(selectedItem);
              }}
              className={`text-white h-fit px-3 py-2 flex ${
                textSize ? `text-${textSize}` : ""
              } items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-100 gap-2.5 ${
                selectedItem.id === category.id
                  ? "bg-proPurple"
                  : " bg-transparent"
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      </div>
    ),
  };

  return variants[variant];
};

export default CategoryBar;
