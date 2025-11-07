import { useState } from "react";

const CategoryBar = ({ onChanged, categories }) => {
  if (categories?.length <= 0) {
    return <></>;
  }

  const [selectedItem, setSelectedItem] = useState(categories[0]);

  if (!onChanged) {
    onChanged = (value) => {
      console.log(value);
    };
  }

  onChanged(selectedItem.id);
  return (
    <div className="flex items-center justify-between gap-4 w-full text-[18px] text-white">
      {/* Categories */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedItem(category)}
            className={`text-white h-9 px-3 flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-100 ${
              selectedItem.id === category.id
                ? "bg-proPurple"
                : " bg-transparent"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
