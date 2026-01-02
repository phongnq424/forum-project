import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../Context/AppContext.jsx";
import toastHelper from "../../../helper/ToastHelper.jsx";
import LoadingScreen from "../../pages/LoadingScreen";

const formSchema = z
  .object({
    old_password: z.string().min(1, "Please enter old password"),
    password: z
      .string()
      .min(6, "Please enter at least 6 character for new password"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine(
    function (data) {
      return data.password === data.confirm_password;
    },
    {
      message: "Password do not match",
      path: ["confirm_password"],
    }
  );
import { useCreateChallenge } from "@/api/hooks/challengeHook.js";
import { useChangePassword } from "@/api/hooks/userHook.js";

type ChangePasswordDialogProps = {
  className?: string;
  open: boolean;
  setOpen: any;
};

const ChangePasswordDialog = function (props: ChangePasswordDialogProps) {
  const appContext = useContext(AppContext) as any;
  const createChallenge = useCreateChallenge();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const changPassword = useChangePassword();
  useEffect(
    function () {
      if (changPassword.isError) {
        toastHelper.error(changPassword.error.message);
      }
      if (changPassword.isSuccess) {
        toastHelper.success("Change Password Successfully");
        props.setOpen(false);
      }
    },
    [changPassword.data, changPassword.isError, changPassword.isSuccess]
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    changPassword.mutate({
      oldPassword: values.old_password,
      newPassword: values.password,
      confirmPassword: values.confirm_password,
    });
  }

  function resetForm() {
    form.reset();
  }

  useEffect(
    function () {
      if (!props.open) {
        resetForm();
      }
    },
    [props.open]
  );

  return (
    <Dialog open={props.open} onOpenChange={(value) => props.setOpen(value)}>
      {changPassword.isPending && <LoadingScreen />}
      <DialogContent
        className={`border-none ${props.className} bg-black404040`}
      >
        <DialogTitle className="font-bold text-xl">Change Password</DialogTitle>

        <Form {...form}>
          <div className="flex flex-col space-y-8 h-full min-h-0 mb-0">
            <FormField
              control={form.control}
              name="old_password"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Old Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Old Password"
                        type="password"
                        {...field}
                        className="focus:border-none focus:ring-0 bg-black border-none"
                      />
                    </FormControl>
                    <FormMessage className="text-sm absolute" />
                  </div>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Password"
                        type="password"
                        {...field}
                        className="focus:border-none focus:ring-0 bg-black border-none"
                      />
                    </FormControl>
                    <FormMessage className="text-sm absolute" />
                  </div>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Confirm Password"
                        type="password"
                        {...field}
                        className="focus:border-none focus:ring-0 bg-black border-none"
                      />
                    </FormControl>
                    <FormMessage className="text-sm absolute" />
                  </div>
                </FormItem>
              )}
            ></FormField>

            <button
              className="bg-proPurple rounded-lg py-1 text-lg hover:opacity-70"
              onClick={form.handleSubmit(onSubmit)}
            >
              Change Password
            </button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
