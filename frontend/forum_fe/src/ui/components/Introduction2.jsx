import hero from "../../assets/hero.svg";
import logo_forum from "../../assets/logo_forum.svg";

function Introduction2() {
  return (
    <div
      className="bg-cover bg-center w-full h-[730px] flex flex-col justify-center items-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      <img className="h-[100px]" src={logo_forum} alt="Logo Forum" />
      <h1 className="text-transparent bg-clip-text text-center bg-linear-(--gradient-for-text-WINDFLOW) text-[40px] font-bold inline-block">
        Connecting programming passion
      </h1>
      <p className="text-[28px] inline-block text-center text-white/70">
        A place to share knowledge, experience, and enhance your programming
        skills!
      </p>
    </div>
  );
}

export default Introduction2;
