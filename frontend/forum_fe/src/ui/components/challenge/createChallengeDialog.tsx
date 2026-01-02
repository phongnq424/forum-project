import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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

const difficulties = ["Easy", "Medium", "Hard"] as const;
const formSchema = z.object({
  title: z.string().min(1, "Name must not be empty"),
  description: z.string().min(1, "Description must not be empty"),
  constraints: z.string().min(1, "Constraint must not be empty"),
  difficulty: z.enum(difficulties),
  input: z.string().min(1, "Input must not be empty"),
  output: z.string().min(1, "Output must not empty"),
  memory_limit: z.number("NaN"),
  time_limit: z.number("NaN"),
});
import { LuFilePlus2 } from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.js";
import { useCreateChallenge } from "@/api/hooks/challengeHook.js";

type CreateGroupDialogProps = {
  className?: string;
};

const CreateChallengeDialog = function (props: CreateGroupDialogProps) {
  const appContext = useContext(AppContext) as any;
  const createChallenge = useCreateChallenge();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      constraints: "",
      difficulty: difficulties[0] || "Easy",
      input: "",
      output: "",
      memory_limit: 0,
      time_limit: 0,
    },
  });

  const [open, setOpen] = useState(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    createChallenge.mutate(values);
    setOpen(false);
  }

  useEffect(
    function () {
      if (createChallenge.isSuccess) {
        toastHelper.success("Create challenge successfully");
      }

      if (createChallenge.isError) {
        toastHelper.error(createChallenge.error.message);
      }
    },
    [createChallenge.data, createChallenge.isSuccess, createChallenge.isError]
  );

  function resetForm() {
    form.reset();
  }

  useEffect(
    function () {
      if (!open) {
        resetForm();
      }
    },
    [open]
  );

  useEffect(
    function () {
      if (!open) {
      }
    },
    [open]
  );

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        <div className="text-white text-[18px] w-fit bg-green px-6 py-2 flex items-center justify-center rounded-md font-medium transition-colors hover:opacity-70 duration-200 ease-linear">
          <LuFilePlus2 className="h-4 w-4 me-2" />
          Create
        </div>
      </DialogTrigger>

      <DialogContent className={`border-none ${props.className}`}>
        <DialogTitle className="font-bold text-xl">
          Create a Challenge
        </DialogTitle>

        <Form {...form}>
          <div className="flex flex-col space-y-1 flex-1 h-full min-h-0 mb-0">
            <div className="flex space-x-5">
              <div className="flex-1 space-y-8 h-full">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Title</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Title"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="h-[25%] flex flex-col">
                      <FormLabel>Description</FormLabel>
                      <div className="relative h-full">
                        <FormControl>
                          <textarea
                            placeholder="Description"
                            {...field}
                            className="focus:border-none bg-black border-none w-full rounded-lg resize-none text-sm p-2 focus:outline-none overflow-y-auto box-border leading-relaxed h-full min-h-0"
                          />
                        </FormControl>
                        <FormMessage className="text-sm absolute" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="constraints"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel>Constraints</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <textarea
                            placeholder="Constraints"
                            {...field}
                            className="focus:border-none bg-black border-none w-full rounded-lg resize-none text-sm p-2 focus:outline-none overflow-y-auto box-border leading-relaxed h-full min-h-0"
                          />
                        </FormControl>
                        <FormMessage className="text-sm absolute" />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2 items-center w-full">
                  <FormField
                    control={form.control}
                    name="time_limit"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormLabel>{"Time Limitation (ms)"}</FormLabel>
                        <div className="relative flex-1">
                          <FormControl>
                            <Input
                              placeholder="Time Limitation"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              type="number"
                              className="focus:border-none focus:ring-0 bg-black border-none w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-sm absolute" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="memory_limit"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormLabel>{"Memory Limitation (MB)"}</FormLabel>
                        <div className="relative flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Time Limitation"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="focus:border-none focus:ring-0 bg-black border-none w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-sm absolute" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormLabel>{"Difficulty"}</FormLabel>
                        <div className="relative flex-1">
                          <FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Input
                                  type="text"
                                  value={field.value}
                                  readOnly={true}
                                  className="focus:border-none focus:ring-0 bg-black border-none w-full"
                                />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent className="bg-black border-none">
                                {difficulties.map(function (d) {
                                  return (
                                    <DropdownMenuItem
                                      className="focus:bg-proPurple text-white"
                                      onSelect={() => field.onChange(d)}
                                    >
                                      {d}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </FormControl>
                          <FormMessage className="text-sm absolute" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* */}
              </div>

              <div className="flex-1 flex flex-col space-y-8 mb-0">
                <FormField
                  control={form.control}
                  name="input"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel>Input</FormLabel>
                      <FormControl className="flex-1">
                        <textarea
                          {...field}
                          className="flex-1 resize-none bg-black border-none rounded-lg p-2 outline-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="output"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel>Output</FormLabel>
                      <FormControl className="flex-1">
                        <textarea
                          {...field}
                          className="flex-1 resize-none bg-black border-none rounded-lg p-2 outline-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <button
            className="bg-proPurple rounded-lg py-0 text-lg hover:opacity-70"
            onClick={form.handleSubmit(onSubmit)}
          >
            Create Challenge
          </button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeDialog;
