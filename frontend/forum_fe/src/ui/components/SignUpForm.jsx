import SocialButton from "./SocialButton";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useState } from "react";

function InputField({
  field,
  type,
  display,
  className,
  form,
  isShowPassword,
  setShowPassword,
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type={
            field != "password" ? type : !isShowPassword ? "password" : "text"
          }
          placeholder=""
          {...form.register(field)}
          className="peer w-full px-4 pb-1 pt-5 text-[14px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear"
        />

        <label
          className="absolute left-4 top-1 text-proPurple text-[10px] transition-all duration-200 pointer-events-none
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-[14px] peer-placeholder-shown:text-gray-400
               peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-proPurple"
        >
          {display}
        </label>
        {field === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => setShowPassword(!prev))}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
          >
            {!isShowPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
          </button>
        )}
      </div>
      {form.formState.errors[field] && (
        <p className="text-red-500 text-[12px] mt-1 absolute">
          {form.formState.errors[field].message}
        </p>
      )}
    </div>
  );
}

function SignUpForm() {
  const providers = ["facebook", "google"];
  const [isShowPassword, setShowPassword] = useState(false);

  const formSchema = z
    .object({
      email: z.string().email("Email is invalid!"),
      password: z.string().min(6, "Password must has at least 6 characters!"),
      fullName: z.string().min(1, "Full Name mustn't be empty!"),
    })
    .refine((data) => data.password2 === data.password, {
      message: "Passwords do not match",
      path: ["password2"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data) {
    console.log(data);
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-8 py-4 px-8 bg-white/10 rounded-3xl shadow-lg text-white flex flex-col items-center">
      <h1 className="text-[30px] font-bold text-white text-center">
        Create a new account!
      </h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 my-6 w-full"
      >
        <div className="space-y-10">
          <InputField
            field="fullName"
            type="text"
            display="Full Name"
            form={form}
            isShowPassword={isShowPassword}
            setShowPassword={setShowPassword}
          />
          <InputField
            field="email"
            type="email"
            display="Email"
            form={form}
            isShowPassword={isShowPassword}
            setShowPassword={setShowPassword}
          />

          <div className="flex justify-between">
            <InputField
              className="basis-[49%]"
              field="password"
              type="password"
              display="Password"
              form={form}
              isShowPassword={isShowPassword}
              setShowPassword={setShowPassword}
            />

            <InputField
              className="basis-[49%]"
              field="password2"
              type="password"
              display="Retype Password"
              form={form}
              isShowPassword={isShowPassword}
              setShowPassword={setShowPassword}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 text-[14px] bg-proPurple text-white font-semibold rounded-lg hover:opacity-70 transition"
        >
          SIGN UP
        </button>
      </form>

      <div className="mb-4 flex justify-between items-center w-full">
        <div className="basis-[30%] h-[3px] bg-white/20"></div>

        <div className="flex justify-center text-[14px] basis-[30%]">
          or Sign up with
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
          Have got an account yet?
        </p>
        <NavLink
          to="/sign-in"
          className="text-[14px] text-proPurple font-medium hover:underline"
        >
          Sign in now
        </NavLink>
      </div>
    </div>
  );
}

export default SignUpForm;
