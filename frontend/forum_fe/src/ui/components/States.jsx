import { BsPostcard } from "react-icons/bs";
import { IoMdCode } from "react-icons/io";
import { IoGlobeOutline } from "react-icons/io5";
import { PiUsersBold } from "react-icons/pi";
import { FaRegStar } from "react-icons/fa";

const items = [
  {
    title: "Users",
    count: 2000123,
    icon: <PiUsersBold></PiUsersBold>,
  },

  {
    title: "Challenges",
    count: 752453,
    icon: <IoMdCode></IoMdCode>,
  },

  {
    title: "Posts",
    count: 1200923,
    icon: <BsPostcard></BsPostcard>,
  },

  {
    title: "Daily Active User",
    count: 1000000,
    icon: <IoGlobeOutline></IoGlobeOutline>,
  },
];

function Item({ title, count, icon }) {
  return (
    <div className="text-center flex items-center gap-5 text-white/70">
      <div className="mb-4 flex h-14 w-14 [&>svg]:w-full [&>svg]:h-full">
        {icon}
      </div>
      <div className="flex flex-col gap-5 items-start">
        <div className="text-[26px] font-bold">{title}</div>
        <div className="text-[26px]">{count}</div>
      </div>
    </div>
  );
}

const Stats = () => {
  return (
    <div className="flex flex-row px-(--primary-padding) py-8 text-white justify-between items-center">
      {/* Rating */}
      <div className="text-center">
        <div className="mb-4 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaRegStar key={i} className="h-[50px] w-[50px] text-yellow" />
          ))}
        </div>
        <div className="mb-2 text-[70px] font-bold text-foreground">4.5</div>
        <div className="text-[26px] text-muted-foreground">Trusted by</div>
        <div className="text-[26px] font-semibold text-foreground">
          300,000+ developers
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-x-10 gap-y-10">
        {items.map((item) => (
          <Item {...item} key={item.title}></Item>
        ))}
      </div>
    </div>
  );
};

export default Stats;
