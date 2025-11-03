import { useState } from "react";
import { IoMdEye } from "react-icons/io";

function InputField({
  display,
  type,
  variant,
  propForValueWorking,
  isDisable = false,
}) {
  const [isShowPassword, setShowPassword] = useState(false);

  const variants = {
    authInp: (
      <div className="relative">
        <input
          type={
            type != "password" ? type : isShowPassword ? "text" : "password"
          }
          placeholder=""
          {...propForValueWorking}
          className="peer w-full px-4 pb-1 pt-5 text-[14px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear"
        />

        <label
          className="absolute left-4 top-1 text-white/60 text-[10px] transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-[14px] peer-placeholder-shown:text-white/70
                    peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-proPurple"
        >
          {display}
        </label>
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => setShowPassword(!prev))}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
          >
            {!isShowPassword ? <IoMdEye size={20} /> : <IoMdEye size={20} />}
          </button>
        )}
      </div>
    ),

    verifyOTP: (
      <div className="relative">
        <input
          type={
            type != "password" ? type : isShowPassword ? "text" : "password"
          }
          placeholder=""
          {...propForValueWorking}
          readOnly={isDisable}
          className="peer w-full px-4 pb-1 pt-6 text-[20px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear"
        />

        <label
          className="absolute left-4 top-1 text-white/60 text-[14px] transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-4 peer-placeholder-shown:text-[20px] peer-placeholder-shown:text-white/70
                    peer-focus:top-1 peer-focus:text-[14px] peer-focus:text-proPurple"
        >
          {display}
        </label>
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => setShowPassword(!prev))}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
          >
            {!isShowPassword ? <IoMdEye size={20} /> : <IoMdEye size={20} />}
          </button>
        )}
      </div>
    ),
  };

  return variants[variant];
}

export default InputField;
