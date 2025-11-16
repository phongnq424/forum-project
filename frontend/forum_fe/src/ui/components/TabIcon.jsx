import { useEffect, useState } from "react";

function TabIcon({ onChanged, options }) {
  if (options?.length <= 0) {
    return <></>;
  }

  const [selectedItem, setSelectedItem] = useState(options[0]);

  if (!onChanged) {
    onChanged = (value) => {
      console.log(value);
    };
  }

  useEffect(() => onChanged(selectedItem.id), [selectedItem]);

  return (
    <div className="flex items-center justify-center gap-4 w-full text-white border-b-2 border-white/20">
      {/* options */}
      <div className="flex items-center justify-center space-x-10 flex-wrap">
        {options.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedItem(category)}
            className={`h-fit text-[18px]  flex items-center justify-between gap-2 py-1 whitespace-nowrap font-medium transition-colors duration-100 [&>svg]:text-3xl ${
              selectedItem.id === category.id
                ? "text-white border-b-3 border-white"
                : "text-white/20"
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabIcon;
