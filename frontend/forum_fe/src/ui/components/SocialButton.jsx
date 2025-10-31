import { FiFacebook } from "react-icons/fi";
import { GrGoogle } from "react-icons/gr";

function SocialButton({ provider, iconSize, onClick, className }) {
  const providers = {
    facebook: {
      text: "Facebook",
      icon: <FiFacebook />,
      style: "bg-Facebook hover:bg-Facebook/90",
    },

    google: {
      text: "Google",
      icon: <GrGoogle />,
      style: "bg-Gmail",
    },
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 hover:cursor-pointer transition-all ${providers[provider].style} text-white ${className} justify-center hover:opacity-70`}
    >
      <div
        className={`[&>svg]:h-full [&>svg]:w-full w-[${iconSize}] h-[${iconSize}]`}
      >
        {providers[provider].icon}
      </div>
      {providers[provider].text}
    </button>
  );
}

export default SocialButton;
