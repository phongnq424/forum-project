import SocialButton from "./SocialButton";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import { useState, useContext, useEffect } from "react";
import InputField from "./InputField";
import toastHelper from "../../helper/ToastHelper";
import { useLogin } from "../../api/hooks/AuthenticationHook";
import AppContext from "../Context/AppContext";

function SignInForm() {
  const providers = ["facebook", "google"];
  const [isRememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const appContext = useContext(AppContext);

  const login = useLogin(
    function (response) {
      toastHelper.success(response.message);
      localStorage.setItem("token", response.token);
      appContext.setIsLogged(true);
      navigate("/");
    },
    function (error) {
      toastHelper.error(error.message);
    }
  );

  const formSchema = z.object({
    username: z.string().min(1, "Username must not be empty!"),
    password: z.string().min(6, "Password must has at least 6 characters"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data) {
    login.mutate(data);
  }

  useEffect(
    function () {
      appContext.setIsLoading(login.isPending);
    },
    [login.isPending]
  );

  return (
    <div className="w-full max-w-2xl mx-auto my-8 py-4 px-8 bg-white/10 rounded-3xl shadow-lg text-white flex flex-col items-center">
      <h1 className="text-[30px] font-bold text-white text-center">
        Welcome back!
      </h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 my-6 w-full"
      >
        <div className="relative">
          <InputField
            fieldDataName="username"
            type="text"
            display="Username"
            variant="authInp"
            propForValueWorking={form.register("username")}
          />
          {form.formState.errors["username"] && (
            <p className="text-red-500 text-[12px] mt-1 absolute">
              {form.formState.errors["username"].message}
            </p>
          )}
        </div>

        <div className="relative">
          <InputField
            fieldDataName="password"
            type="password"
            display="Password"
            variant="authInp"
            propForValueWorking={form.register("password")}
          />
          {form.formState.errors["password"] && (
            <p className="text-red-500 text-[12px] mt-1 absolute">
              {form.formState.errors["password"].message}
            </p>
          )}
        </div>

        <div className="space-y-5">
          {/* Remember me & Forgot password */}
          <div className="flex justify-between items-center text-[14px]">
            <label className="flex items-center gap-2 group hover:cursor-pointer">
              <input
                type="checkbox"
                name="isRememberMe"
                className="hidden peer"
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span
                className="w-5 h-5 border-2 border-proPurple rounded-md text-white
                     peer-checked:bg-proPurple 
                     flex-shrink-0 flex justify-center items-center"
              >
                {isRememberMe && (
                  <FaCheck className="w-[80%] h-[80%] text-white text-[14px]"></FaCheck>
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
            className="w-full py-3 text-[14px] bg-proPurple text-white font-semibold rounded-lg hover:opacity-70 transition"
          >
            SIGN IN
          </button>
        </div>
      </form>

      <div className="mb-4 flex justify-between items-center w-full">
        <div className="basis-[30%] h-[3px] bg-white/20"></div>

        <div className="flex justify-center text-[14px] basis-[30%]">
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
            className="px-5 py-2.5 text-[14px] min-w-[200px] rounded-xl"
          ></SocialButton>
        ))}
      </div>

      <div className="mt-6 text-center flex gap-3 items-center">
        <p className="text-[14px] text-muted-foreground">
          Don't have an account yet?
        </p>
        <NavLink
          to="/sign-up"
          className="text-[14px] text-proPurple font-medium hover:underline"
        >
          Sign up now
        </NavLink>
      </div>
    </div>
  );
}

export default SignInForm;
