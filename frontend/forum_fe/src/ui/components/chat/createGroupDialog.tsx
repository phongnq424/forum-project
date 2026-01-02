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
import { Search, UsersRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import UserCard, { type UserInfo } from "./userCard";
import { useContext, useEffect, useState } from "react";
import AppContext from "../../Context/AppContext.jsx";
import SelectedUserCard, { type SelectedUserInfo } from "./selectedUserCard";
import toastHelper from "../../../helper/ToastHelper.jsx";
const formSchema = z.object({
  name: z.string().min(2, "Group's name must not be empty!"),
  avatar: z.string(),
  userIds: z.array(z.string().min(1)).min(2),
});
import { useCreateGroupChat } from "@/api/hooks/chatHook";

type CreateGroupDialogProps = {
  handleOnSearch: (kw: string) => void;
  searchedUsers: any[];
  className?: string;
};

const CreateGroupDialog = function (props: CreateGroupDialogProps) {
  const appContext = useContext(AppContext) as any;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      avatar: "",
      userIds: [],
    },
  });

  const [selectedUsers, setSelectedUsers] = useState<SelectedUserInfo[]>([]);
  const [open, setOpen] = useState(false);
  const createGroupChat = useCreateGroupChat();

  function onSubmit(values: z.infer<typeof formSchema>) {
    createGroupChat.mutate(values);
  }

  function resetForm() {
    form.reset();
    setSelectedUsers([]);
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
      if (createGroupChat.isSuccess) {
        setOpen(false);
      }
      if (createGroupChat.isError) {
        toastHelper.error(createGroupChat.error.message);
      }
    },
    [createGroupChat.data, createGroupChat.isSuccess, createGroupChat.isError]
  );

  function handleOnSelectUser(user: UserInfo): void {
    const currentIds = form.getValues("userIds");
    if (!currentIds.includes(user.id)) {
      form.setValue("userIds", [...currentIds, user.id]);
      setSelectedUsers((prev) => [...prev, user]);
    }
  }

  function onSearch(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = event.currentTarget.value;
      props.handleOnSearch?.(value);
    }
  }

  function handleOnRemove(user: SelectedUserInfo): void {
    const userIds: string[] = form.getValues("userIds");

    form.setValue(
      "userIds",
      userIds.filter((id) => id != user.id)
    );

    setSelectedUsers((prev) => prev.filter((u) => u.id != user.id));
  }

  useEffect(
    function () {
      if (!open) {
        setSelectedUsers([]);
      }
    },
    [open]
  );

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        <button className="p-1 hover:bg-white/10 rounded-lg">
          <UsersRound />
        </button>
      </DialogTrigger>

      <DialogContent className={`flex flex-col space-y-1 ${props.className}`}>
        <DialogTitle className="font-bold text-xl">
          Create a Group Chat
        </DialogTitle>

        <Form {...form}>
          <div className="flex flex-col space-y-6 flex-1 min-h-0">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Group Name</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Group name"
                        {...field}
                        className="focus:border-none focus:ring-0 bg-black border-none"
                      />
                    </FormControl>
                    <FormMessage className="text-sm absolute" />
                  </div>
                </FormItem>
              )}
            />

            <FormItem className="flex flex-col min-h-0 flex-1">
              <FormLabel>Users</FormLabel>

              <div className="flex justify-between flex-1 min-h-0 space-x-2">
                <div className="flex flex-col flex-1 min-h-0 space-y-1">
                  <div className="relative">
                    <Input
                      placeholder="Search for users"
                      className="pl-7 text-sm h-fit border-none bg-black "
                      type="text"
                      onKeyDown={onSearch}
                    ></Input>
                    <Search className="w-3 h-3 absolute top-2 start-2 text-white/50" />
                  </div>

                  <div className="overflow-y-auto flex flex-col flex-1 gap-y-1 p-2 rounded-lg bg-black">
                    {props.searchedUsers.map((u, i) => {
                      if (u.id === appContext.currentUser.user_id) {
                        return null;
                      }

                      return (
                        <div className="shrink-0">
                          <UserCard
                            key={i}
                            user={{
                              id: u.id,
                              avatar: u.Profile?.avatar,
                              username: u.username,
                              fullName: u.Profile?.fullname,
                            }}
                            onClick={handleOnSelectUser}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col space-y-4 min-h-0 flex-1">
                  <FormField
                    control={form.control}
                    name="userIds"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="flex items-center">
                          Choose at least 2 other user
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col space-y-1 bg-black rounded-lg p-2 flex-1 min-h-0">
                    {selectedUsers.map(function (u, i) {
                      return (
                        <SelectedUserCard user={u} onRemove={handleOnRemove} />
                      );
                    })}
                  </div>
                </div>
              </div>
            </FormItem>
          </div>

          <button
            className="bg-proPurple rounded-lg py-1 text-lg hover:opacity-70"
            onClick={form.handleSubmit(onSubmit)}
          >
            Create Group Chat
          </button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
