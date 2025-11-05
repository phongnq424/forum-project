import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import { useContext, useEffect } from "react";
import AppContext from "../Context/AppContext";
import CustomDateInput from "./CustomDateInput/CustomDateInput";
import CustomDropDown from "./CustomDropDown/CustomDropDown";
import ImagePicker from "./ImagePicker";
import { useUpdateMe } from "../../api/hooks/ProfileHook";
import toastHelper from "../../helper/ToastHelper";
import { CreateProfileContext } from "../pages/CreateProfilePage";

function CreateProfileForm() {
  const navigate = useNavigate();
  const updateMe = useUpdateMe();
  const createProfileContext = useContext(CreateProfileContext);
  const appContext = useContext(AppContext);

  const formSchema = z.object({
    fullName: z.string().min(1, "Fullname must not be empty!"),
    dob: z
      .date()
      .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
        message: "Date is invalid",
      }),
    gender: z.string(),
    bio: z.string(),
    avatar: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.type.startsWith("image/"), {
        message: "Avatar must be an image file",
      }),

    cover: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.type.startsWith("image/"), {
        message: "Cover must be an image file",
      }),
  });

  const genders = ["Male", "Female", "Other"];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      dob: new Date(),
      gender: genders[0],
      bio: "",
    },
  });

  function onSubmit(data) {
    updateMe.mutate(data);
  }

  useEffect(
    function () {
      createProfileContext.setIsLoading(updateMe.isPending);
    },
    [updateMe.isPending]
  );

  useEffect(
    function () {
      if (updateMe.isSuccess) {
        appContext.setIsCallAgain(true);
        appContext.setIsCallAgain(false);
        navigate("/");
        toastHelper.success("Create your profile is successful!");
      }

      if (updateMe.isError) {
        toastHelper.error(updateMe.error.message);
      }
    },
    [updateMe.isSuccess, updateMe.isError]
  );

  return (
    <div className="w-full my-8 py-4 px-8 bg-white/10 rounded-3xl shadow-lg text-white flex flex-col items-center">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 my-4 w-full"
      >
        <div className="flex justify-between">
          <div className="space-y-5 basis-[40%]">
            <h1 className="text-[30px] font-bold text-white text-center">
              Complete Your Profile!
            </h1>

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
              <div className="space-y-5">
                <div className="flex justify-between gap-10">
                  {" "}
                  {/*Date of birth */}
                  <Controller
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <CustomDateInput
                        display="Date of Birth"
                        selected={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        variant="createProfile"
                      ></CustomDateInput>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <CustomDropDown
                        display="Gender"
                        variant="createProfile"
                        options={genders}
                        selected={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        indexValueSelected={0}
                      ></CustomDropDown>
                    )}
                  />
                </div>

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
                NEXT
              </button>
            </div>
          </div>

          <div className="relative basis-[50%] h-fit space-y-5">
            <h1 className="text-[30px] font-bold text-white text-center">
              Choose your avatar or cover!
            </h1>

            <div className="w-full aspect-[16/9]">
              <Controller
                control={form.control}
                name="cover"
                render={({ field }) => (
                  <ImagePicker
                    variant="cover"
                    onChange={field.onChange}
                  ></ImagePicker>
                )}
              ></Controller>
            </div>

            <div className="absolute top-80 left-[35%] w-[170px] aspect-square">
              <Controller
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <ImagePicker
                    variant="avatar"
                    onChange={field.onChange}
                  ></ImagePicker>
                )}
              ></Controller>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateProfileForm;
