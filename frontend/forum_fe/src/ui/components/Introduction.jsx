import hero from "../../assets/hero.svg";

function Introduction({ className = "" }) {
  return (
    <div
      className={`flex flex-col items-center pt-30 h-screen w-full bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${hero})` }}
    >
      <div className="text-white text-center max-w-5xl flex flex-col gap-5">
        <h1 className="text-transparent bg-clip-text bg-linear-(--gradient-for-text-WINDFLOW) text-[100px] font-bold inline-block">
          WINDFLOW
        </h1>
        <h3 className="text-[56px] font-semibold inline-block">Code To Glow</h3>
        <p className="text-[30px] inline-block">
          We understand the struggles of being a developer.
          <br />
          We built a space with tailored resources, peer support, coding
          <br />
          challenges, and more.
        </p>
      </div>
    </div>
  );
}

export default Introduction;
