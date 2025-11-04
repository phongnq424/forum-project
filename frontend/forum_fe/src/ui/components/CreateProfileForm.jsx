import SocialButton from "./SocialButton";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import InputField from "./InputField";
import { useRegister } from "../../api/hooks/AuthenticationHook";
import toastHelper from "../../helper/ToastHelper";
import { useContext, useEffect } from "react";
import AppContext from "../Context/AppContext";
import CustomDateInput from "./CustomDateInput/CustomDateInput";
import CustomDropDown from "./CustomDropDown/CustomDropDown";

function CreateProfileForm() {
  const providers = ["facebook", "google"];
  const navigate = useNavigate();
  const appContext = useContext(AppContext);
  const register = useRegister(
    function (res) {
      toastHelper.info(res.message);
      navigate("verify-otp", {
        state: {
          email: form.getValues("email"),
        },
      });
    },

    function (error) {
      toastHelper.error(error.message);
    }
  );

  const formSchema = z.object({
    fullName: z.string().min(1, "Fullname must not be empty!"),
    dob: z
      .date()
      .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
        message: "Date is invalid",
      }),
    gender: z.string(),
    bio: z.string(),
  });

  const genders = ["Male", "Female", "Other"];
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      dob: new Date().getFullYear(),
      gender: genders[0],
      bio: "",
    },
  });

  function onSubmit(data) {
    register.mutate(data);
  }

  useEffect(
    function () {
      appContext.setIsLoading(register.isPending);
    },
    [register.isPending]
  );

  return (
    <div className="w-full max-w-2xl mx-auto my-8 py-4 px-8 bg-white/10 rounded-3xl shadow-lg text-white flex flex-col items-center">
      <h1 className="text-[30px] font-bold text-white text-center">
        Complete Your Profile!
      </h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 my-6 w-full"
      >
        <div className="space-y-10">
          <div className="relative">
            <InputField
              type="fullName"
              display="Full Name"
              variant="createProfile"
              propForValueWorking={form.register("fullName")}
            />
            {form.formState.errors["fullName"] && (
              <p className="text-red-500 text-[12px] mt-1 absolute">
                {form.formState.errors["fullName"].message}
              </p>
            )}
          </div>

          <div className="flex justify-between"></div>
          {/* Cho nay them GT, NS */}
          <div className="relative">
            <InputField
              type="bio"
              display="Bio"
              variant="createProfileBio"
              propForValueWorking={form.register("bio")}
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

export default CreateProfileForm;
