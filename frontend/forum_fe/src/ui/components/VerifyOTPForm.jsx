import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "./InputField";
import { useVerifyOTP } from "../../api/hooks/AuthenticationHook";
import toastHelper from "../../helper/ToastHelper";
import { useNavigate } from "react-router-dom";

function VerifyOTPForm({ email }) {
  const verifyOTP = useVerifyOTP(
    function (response) {
      useNavigate()("/login");
    },
    function (error) {
      toastHelper.error(error.message);
    }
  );

  const formSchema = z.object({
    otp: z.string().min(1, "OTP is not empty!"),
    email: z.string().email("Email is invalid!"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email == null ? "" : email,
      otp: "",
    },
  });

  function onSubmit(data) {
    verifyOTP.mutate(data);
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-8 py-4 px-8 bg-white/10 rounded-3xl shadow-lg text-white flex flex-col items-center">
      <h1 className="text-[40px] font-bold text-white text-center">
        Verify OTP!
      </h1>

      <h2 className="text-[20px] my-3">
        Please enter the code sent to your email!
      </h2>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 my-6 w-full"
      >
        <div className="space-y-10">
          <div className="relative">
            <InputField
              type="email"
              display="Email"
              variant="verifyOTP"
              isDisable={!(email == null || email === "")}
              propForValueWorking={form.register("email")}
            />
            {form.formState.errors["email"] && (
              <p className="text-red-500 text-[16px] mt-1 absolute">
                {form.formState.errors["email"].message}
              </p>
            )}
          </div>

          <div className={`relative`}>
            <InputField
              type="text"
              display="OTP Code"
              variant="verifyOTP"
              propForValueWorking={form.register("otp")}
            />
            {form.formState.errors["otp"] && (
              <p className="text-red-500 text-[16px] mt-1 absolute">
                {form.formState.errors["otp"].message}
              </p>
            )}
          </div>
        </div>

        <h2 className="text-[20px] flex justify-center">
          Don't see any OTP?
          <button className="ml-2 font-semibold bg-transparent p-0 m-0 border-none text-proPurple cursor-pointer hover:underline">
            Resend OTP
          </button>
        </h2>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 text-[14px] bg-proPurple text-white font-semibold rounded-lg hover:opacity-70 transition"
        >
          VERIFY
        </button>
      </form>
    </div>
  );
}

export default VerifyOTPForm;
