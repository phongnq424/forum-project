import { useState } from "react";

const categories = [
  { name: "For You" },
  { name: "Web" },
  { name: "Mobile" },
  { name: "DSA" },
  { name: "Data Science & AI/ML" },
  { name: "Career" },
];

const CategoryBar = ({ onChanged }) => {
  const [selectedItem, setSelectedItem] = useState(categories[0].name);

  if (!onChanged) {
    onChanged = (value) => {
      console.log(value);
    };
  }

  onChanged(selectedItem);
  return (
    <div className="flex items-center justify-between gap-4 w-full text-[18px] text-white">
      {/* Categories */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedItem(category.name)}
            className={`text-white h-9 px-3 flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-100 ${
              selectedItem === category.name
                ? "bg-proPurple"
                : " bg-transparent"
            }`}
          >
            {category.name}
          </button>

          //   <Button
          //     key={category.name}
          //     variant={category.active ? "default" : "secondary"}
          //     size="sm"
          //     className={
          //       category.active
          //         ? "bg-primary text-primary-foreground hover:bg-primary/90"
          //         : "bg-secondary text-foreground hover:bg-secondary/80"
          //     }
          //   >
          //     {category.name}
          //   </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
