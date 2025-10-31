import SocialButton from "./SocialButton";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink } from "react-router-dom";
import { useRef, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FaCheck } from "react-icons/fa";

function SignInForm() {
  const providers = ["facebook", "google"];
  const [isShowPassword, setShowPassword] = useState(false);
  const [isRememberMe, setRememberMe] = useState(false);

  const formSchema = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(6, "Password must has at least 6 characters"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    console.log(data);
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-8 py-4 px-8 bg-white/10 rounded-3xl shadow-lg text-white flex flex-col items-center">
      <h1 className="text-[36px] font-bold text-white text-center">
        Welcome back!
      </h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 my-8 w-full"
      >
        {/* Email */}
        <div className="relative">
          <div className="relative">
            <input
              type="email"
              placeholder=""
              {...form.register("email")}
              className="peer w-full px-4 pb-2 pt-6 text-[16px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear"
            />

            <label
              className="absolute left-4 top-1 text-proPurple text-[12px] transition-all duration-200 pointer-events-none
               peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-gray-400
               peer-focus:top-1 peer-focus:text-[12px] peer-focus:text-proPurple"
            >
              Email
            </label>
          </div>
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm mt-1 absolute">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <div className="relative">
            <input
              type={isShowPassword ? "text" : "password"}
              placeholder=""
              {...form.register("password")}
              className="peer w-full px-4 pb-2 pt-6 text-[16px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear"
            />

            <label
              className="absolute left-4 top-1 text-proPurple text-[12px] transition-all duration-200 pointer-events-none
               peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-gray-400
               peer-focus:top-1 peer-focus:text-[12px] peer-focus:text-proPurple"
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword((prev) => setShowPassword(!prev))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
            >
              {isShowPassword ? (
                <IoMdEye size={20} />
              ) : (
                <IoMdEyeOff size={20} />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1 absolute">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-5">
          {/* Remember me & Forgot password */}
          <div className="flex justify-between items-center text-[16px]">
            <label className="flex items-center gap-2 group">
              <input
                type="checkbox"
                name="isRememberMe"
                className="hidden peer"
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span
                className="w-6 h-6 border-2 border-proPurple rounded-md text-white
                     peer-checked:bg-proPurple 
                     flex-shrink-0 flex justify-center items-center"
              >
                {isRememberMe && (
                  <FaCheck className="w-[80%] h-[80%] text-white text-[16px]"></FaCheck>
                )}
              </span>
              Remember me
            </label>
            <NavLink
              to="/forgot-password"
              className="hover:underline hover:text-proPurple"
            >
              Forgot password?
            </NavLink>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 text-[16px] bg-proPurple text-white font-semibold rounded-lg hover:opacity-70 transition"
          >
            SIGN IN
          </button>
        </div>
      </form>

      <div className="mb-4 flex justify-between items-center w-full">
        <div className="basis-[30%] h-[3px] bg-white/20"></div>

        <div className="flex justify-center text-[16px] basis-[30%]">
          or Sign in with
        </div>

        <div className="basis-[30%] h-[3px] bg-white/20"></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {providers.map((item) => (
          <SocialButton
            key={item}
            provider={item}
            iconSize="20px"
            onClick={() => handleSocialLogin(item)}
            className="px-5 py-2.5 text-[16px] min-w-[200px] rounded-xl"
          ></SocialButton>
        ))}
      </div>

      <div className="mt-6 text-center flex gap-3 items-center">
        <p className="text-[16px] text-muted-foreground">
          Don't have an account yet?
        </p>
        <NavLink
          to="/sign-up"
          className="text-[16px] text-proPurple font-medium hover:underline"
        >
          Sign up now
        </NavLink>
      </div>
    </div>
  );
}

export default SignInForm;
