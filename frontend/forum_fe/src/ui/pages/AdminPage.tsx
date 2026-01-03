import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AppContext from "../Context/AppContext.jsx";
import General from "@/General/General";
import {
  useGetCategories,
  useCreateCategories,
  useDeleteCategories,
  useUpdateCategory,
} from "../../api/hooks/categoriesHook.js";

import {
  useGetTopic,
  useCreateTopics,
  useDeleteTopics,
  useUpdateTopic,
} from "../../api/hooks/topicHook";

import toastHelper from "@/helper/ToastHelper";
import LoadingScreen from "@/ui/pages/LoadingScreen";
import { useSearchParams } from "react-router-dom";
import PaginationInput from "../components/PaginationInput";
import {
  useCreateLanguages,
  useDeleteLanguages,
  useGetLanguages,
  useUpdateLanguage,
} from "@/api/hooks/languageHook.js";

// ---------------- Sidebar ----------------
function Sidebar({
  active,
  setActive,
}: {
  active: string;
  setActive: (v: string) => void;
}) {
  return (
    <div className="w-56 bg-black404040 text-white text-xl text-center rounded-xl overflow-auto ">
      <div
        className={`py-2 cursor-pointer ${
          active === "category" ? "bg-proPurple" : "hover:bg-proPurple/50"
        }`}
        onClick={() => setActive("category")}
      >
        Category
      </div>
      <div
        className={`py-2 cursor-pointer ${
          active === "topic" ? "bg-proPurple" : "hover:bg-proPurple/50"
        }`}
        onClick={() => setActive("topic")}
      >
        Topic
      </div>

      <div
        className={`py-2 cursor-pointer ${
          active === "language" ? "bg-proPurple" : "hover:bg-proPurple/50"
        }`}
        onClick={() => setActive("language")}
      >
        Language
      </div>
    </div>
  );
}

// ---------------- Category UI ----------------
function CategoryManager() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([{ name: "", description: "" }]);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(function () {
    if (!searchParams.get("page")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", "1");
      setSearchParams(newParams);
    }
  }, []);

  const [rowsDeleted, setRowsDeleted] = useState<string[]>([]);
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  const [data, setData] = useState<
    { id: string; name: string; description: string }[]
  >([]);

  const getCategories = useGetCategories(
    Number(searchParams.get("page") || "1")
  );
  useEffect(
    function () {
      if (getCategories.isSuccess) {
        setData(getCategories.data.data);
        setTotalPages(getCategories.data.pagination.totalPages);
      }
      if (getCategories.isError) {
        toastHelper.error(getCategories.error.message);
      }
    },
    [getCategories.data, getCategories.isSuccess, getCategories.isError]
  );

  const createCategories = useCreateCategories();
  useEffect(
    function () {
      if (createCategories.isSuccess) {
        toastHelper.success("Create categories successfully");
        console.log(createCategories.data);
        setOpen(false);
      }
      if (createCategories.isError) {
        toastHelper.error(createCategories.error.message);
      }
    },
    [
      createCategories.data,
      createCategories.isSuccess,
      createCategories.isError,
    ]
  );

  const deleteCategories = useDeleteCategories();
  useEffect(
    function () {
      if (deleteCategories.isSuccess) {
        toastHelper.success("Delete categories successfully");
        console.log(deleteCategories.data);
        setRowsDeleted([]);
      }
      if (deleteCategories.isError) {
        toastHelper.error(deleteCategories.error.message);
      }
    },
    [
      deleteCategories.data,
      deleteCategories.isSuccess,
      deleteCategories.isError,
    ]
  );

  const updateCategory = useUpdateCategory();
  useEffect(
    function () {
      if (updateCategory.isSuccess) {
        toastHelper.success("Update categories successfully");
        console.log(updateCategory.data);
      }
      if (updateCategory.isError) {
        toastHelper.error(updateCategory.error.message);
      }
    },
    [updateCategory.data, updateCategory.isSuccess, updateCategory.isError]
  );

  useEffect(
    function () {
      setRows([{ name: "", description: "" }]);
    },
    [open]
  );

  if (
    getCategories.isLoading ||
    createCategories.isPending ||
    deleteCategories.isPending ||
    updateCategory.isPending
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col space-y-5 h-full min-h-0 ">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setOpen(true)}
            className="bg-proPurple rounded-lg text-lg hover:bg-proPurple/80"
          >
            Add many
          </Button>
          <Button
            variant="destructive"
            className="rounded-lg text-lg"
            onClick={() => deleteCategories.mutate({ ids: rowsDeleted })}
          >
            Delete selected
          </Button>
        </div>
      </div>

      <div className="overflow-auto flex-1 min-h-0">
        <Table className="text-lg h-full w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent order-b-3">
              <TableHead />
              <TableHead className="font-extrabold">Name</TableHead>
              <TableHead className="font-extrabold">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item?.id}
                className="hover:bg-white/20 cursor-pointer  border-white/20 border-b-3"
                onClick={() => {
                  setSelected(item);
                  setIsEditing(false);
                  setViewOpen(true);
                }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    className="data-[state=checked]:bg-proPurple data-[state=checked]:font-semibold"
                    onCheckedChange={function (checked) {
                      if (checked) {
                        setRowsDeleted((prev) => [
                          ...prev,
                          item?.id.toString(),
                        ]);
                      } else {
                        setRowsDeleted((prev) =>
                          prev.filter((i) => i !== item.id.toString())
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{item?.name}</TableCell>
                <TableCell>{item?.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationInput
        totalPages={totalPages}
        currentPage={Number(searchParams.get("page"))}
        onChange={(page: number) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("page", page.toString());
          setSearchParams(newParams);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#404040] text-white border-0 max-h-[70vh] w-[50vw] sm:max-w-none flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Categories</DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 px-1">
            {rows.map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Name"
                  onChange={function (e) {
                    setRows((prev) => {
                      const newValues = [...prev];
                      if (!newValues[i]) {
                        return [];
                      }
                      newValues[i].name = e.currentTarget.value;
                      return newValues;
                    });
                  }}
                />
                <Input
                  placeholder="Description"
                  onChange={function (e) {
                    setRows((prev) => {
                      const newValues = [...prev];
                      if (!newValues[i]) {
                        return [];
                      }
                      newValues[i].description = e.currentTarget.value;
                      return newValues;
                    });
                  }}
                />
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            className="rounded-lg bg-black text-white hover:bg-black hover:opacity-50"
            onClick={() => setRows([...rows, { name: "", description: "" }])}
          >
            + Add Row
          </Button>

          <Button
            className="bg-proPurple rounded-lg hover:bg-proPurple/80"
            onClick={function (e) {
              createCategories.mutate({ data: rows });
            }}
          >
            Add Categories
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-[#404040] text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl">Category detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3">
              <Input
                value={selected.name}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSelected({ ...selected, name: e.target.value })
                }
              />

              <Input
                value={selected.description}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSelected({ ...selected, description: e.target.value })
                }
              />

              {!isEditing ? (
                <Button
                  className="bg-proPurple w-full hover:bg-proPurple/60"
                  onClick={() => setIsEditing(true)}
                >
                  Click to edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="bg-proPurple flex-1 hover:bg-proPurple/60"
                    onClick={() => {
                      updateCategory.mutate({
                        id: selected.id,
                        data: {
                          name: selected.name,
                          description: selected.description,
                        },
                      });

                      setIsEditing(false);
                      setViewOpen(false);
                    }}
                  >
                    Save
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      setViewOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- Topic UI ----------------
function TopicManager() {
  const [categories, setCategories] = useState<
    { id: string; name: string; description: string }[]
  >([]);

  const [data, setData] = useState<
    {
      id: number;
      name: string;
      description: string;
      category_id: string;
      category: any;
    }[]
  >([]);
  const [totalPages, setTotalPages] = useState(0);

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(function () {
    if (!searchParams.get("page")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", "1");
      setSearchParams(newParams);
    }
  }, []);

  const [rowsDeleted, setRowsDeleted] = useState<string[]>([]);

  const [selected, setSelected] = useState<{
    id: number;
    name: string;
    description: string;
    category_id: string;
  } | null>(null);

  const [rows, setRows] = useState<
    {
      name: string;
      description: string;
      category_id: string;
    }[]
  >([{ name: "", description: "", category_id: categories[0]?.id ?? "" }]);

  const getTopics = useGetTopic(Number(searchParams.get("page") || "1"));
  useEffect(
    function () {
      if (getTopics.isSuccess) {
        console.log(getTopics.data.data);
        setData(getTopics.data.data);
        setTotalPages(getTopics.data.pagination.totalPages);
      }
      if (getTopics.isError) {
        toastHelper.error(getTopics.error.message);
      }
    },
    [getTopics.data, getTopics.isSuccess, getTopics.isError]
  );

  const getCategories = useGetCategories();
  useEffect(
    function () {
      if (getCategories.isSuccess) {
        setCategories(getCategories.data.data);
        setRows([
          { name: "", description: "", category_id: categories[0]?.id ?? "" },
        ]);
      }
      if (getCategories.isError) {
        toastHelper.error(getCategories.error.message);
      }
    },
    [getCategories.data, getCategories.isSuccess, getCategories.isError]
  );

  const createTopics = useCreateTopics();
  useEffect(
    function () {
      if (createTopics.isSuccess) {
        toastHelper.success("Create topics successfully");
        setOpen(false);
      }
      if (createTopics.isError) {
        toastHelper.error(createTopics.error.message);
      }
    },
    [createTopics.data, createTopics.isSuccess, createTopics.isError]
  );

  const deleteTopics = useDeleteTopics();
  useEffect(
    function () {
      if (deleteTopics.isSuccess) {
        toastHelper.success("Delete topics successfully");
        setRowsDeleted([]);
      }
      if (deleteTopics.isError) {
        toastHelper.error(deleteTopics.error.message);
      }
    },
    [deleteTopics.data, deleteTopics.isSuccess, deleteTopics.isError]
  );

  const updateTopic = useUpdateTopic();
  useEffect(
    function () {
      if (updateTopic.isSuccess) {
        toastHelper.success("Update topic successfully");
      }
      if (updateTopic.isError) {
        toastHelper.error(updateTopic.error.message);
      }
    },
    [updateTopic.data, updateTopic.isSuccess, updateTopic.isError]
  );

  useEffect(
    function () {
      setRows([
        {
          name: "",
          description: "",
          category_id: categories[0]?.id ?? "",
        },
      ]);
    },
    [categories]
  );

  useEffect(
    function () {
      if (!open) {
        setRows([
          {
            name: "",
            description: "",
            category_id: categories[0]?.id ?? "",
          },
        ]);
      }
    },
    [open]
  );

  if (
    getCategories.isLoading ||
    getTopics.isLoading ||
    createTopics.isPending ||
    deleteTopics.isPending ||
    updateTopic.isPending
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col space-y-5 h-full min-h-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Topic</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setOpen(true)}
            className="bg-proPurple rounded-lg text-lg hover:bg-proPurple/80"
          >
            Add many
          </Button>
          <Button
            variant="destructive"
            className="rounded-lg text-lg"
            onClick={() => {
              console.log("DL", rowsDeleted);
              deleteTopics.mutate({ ids: rowsDeleted });
            }}
          >
            Delete selected
          </Button>
        </div>
      </div>

      <Table className="text-lg overflow-auto flex-1 min-h-0">
        <TableHeader>
          <TableRow className="border-b-3 hover:bg-transparent ">
            <TableHead />
            <TableHead className="font-extrabold">Name</TableHead>
            <TableHead className="font-extrabold">Description</TableHead>
            <TableHead className="font-extrabold">Category</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-white/20 cursor-pointer  border-white/20 border-b-3"
              onClick={() => {
                setSelected(item);
                setIsEditing(false);
                setViewOpen(true);
              }}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  className="data-[state=checked]:bg-proPurple data-[state=checked]:font-semibold"
                  onCheckedChange={function (checked) {
                    if (checked) {
                      setRowsDeleted((prev) => [...prev, item?.id.toString()]);
                    } else {
                      setRowsDeleted((prev) =>
                        prev.filter((i) => i !== item.id.toString())
                      );
                    }
                  }}
                />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                {categories.find((c) => c.id === item.category_id)?.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationInput
        totalPages={totalPages}
        currentPage={Number(searchParams.get("page") ?? "1")}
        onChange={(p: number) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("page", p.toString());
          setSearchParams(newParams);
        }}
      />

      {/* ADD MANY TOPIC */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#404040] text-white border-0 max-h-[70vh] w-[50vw] sm:max-w-none flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Topics</DialogTitle>
          </DialogHeader>

          {/* Scrollable rows */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 px-1">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Name"
                  onChange={(e) => {
                    setRows((prev) => {
                      const newRows = [...prev];
                      if (newRows[i]) {
                        newRows[i].name = e.currentTarget.value;
                      }
                      return newRows;
                    });
                  }}
                />

                <Input
                  placeholder="Description"
                  onChange={(e) => {
                    setRows((prev) => {
                      const newRows = [...prev];
                      if (newRows[i]) {
                        newRows[i].description = e.currentTarget.value;
                      }
                      return newRows;
                    });
                  }}
                />

                <Select
                  value={row.category_id}
                  onValueChange={(value) => {
                    setRows((prev) => {
                      const newRows = [...prev];
                      if (newRows[i]) {
                        newRows[i].category_id = value;
                      }

                      return newRows;
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Actions */}
          <Button
            variant="secondary"
            className="rounded-lg bg-black text-white hover:bg-black hover:opacity-50"
            onClick={() =>
              setRows([
                ...rows,
                {
                  name: "",
                  description: "",
                  category_id: categories[0]?.id ?? "",
                },
              ])
            }
          >
            + Add row
          </Button>

          <Button
            className="bg-proPurple rounded-lg hover:bg-proPurple/80"
            onClick={() => {
              createTopics.mutate({ data: rows });
            }}
          >
            Add Topics
          </Button>
        </DialogContent>
      </Dialog>

      {/* VIEW / EDIT */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-[#404040] text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl">Topic detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3">
              <Input
                value={selected.name}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSelected({ ...selected, name: e.target.value })
                }
              />

              <Input
                value={selected.description}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSelected({ ...selected, description: e.target.value })
                }
              />

              {/* Category */}
              {isEditing ? (
                <Select
                  value={selected.category_id}
                  onValueChange={(v) =>
                    setSelected({ ...selected, category_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  readOnly
                  value={
                    categories.find((c) => c.id === selected.category_id)?.name
                  }
                />
              )}

              {!isEditing ? (
                <Button
                  className="bg-proPurple w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Click to edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="bg-proPurple flex-1"
                    onClick={() => {
                      // TODO call API
                      updateTopic.mutate({
                        id: selected.id,
                        data: {
                          name: selected.name,
                          category_id: selected.category_id,
                          description: selected.description,
                        },
                      });
                      setIsEditing(false);
                      setViewOpen(false);
                    }}
                  >
                    Save
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      setViewOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const LanguageManager = function () {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([{ name: "", code: "" }]);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(function () {
    if (!searchParams.get("page")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", "1");
      setSearchParams(newParams);
    }
  }, []);

  const [rowsDeleted, setRowsDeleted] = useState<string[]>([]);
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);

  const [data, setData] = useState<
    { id: string; name: string; code: string }[]
  >([]);

  const getLanguages = useGetLanguages();
  useEffect(
    function () {
      if (getLanguages.isSuccess) {
        setData(getLanguages.data);
        setTotalPages(getLanguages.data?.pagination?.totalPages);
      }
      if (getLanguages.isError) {
        toastHelper.error(getLanguages.error.message);
      }
    },
    [getLanguages.data, getLanguages.isSuccess, getLanguages.isError]
  );

  const createLanguage = useCreateLanguages();
  useEffect(
    function () {
      if (createLanguage.isSuccess) {
        toastHelper.success("Create languages successfully");
        console.log(createLanguage.data);
        setOpen(false);
      }
      if (createLanguage.isError) {
        toastHelper.error(createLanguage.error.message);
      }
    },
    [createLanguage.data, createLanguage.isSuccess, createLanguage.isError]
  );

  const deleteLanguage = useDeleteLanguages();
  useEffect(
    function () {
      if (deleteLanguage.isSuccess) {
        toastHelper.success("Delete languages successfully");
        console.log(deleteLanguage.data);
        setRowsDeleted([]);
      }
      if (deleteLanguage.isError) {
        toastHelper.error(deleteLanguage.error.message);
      }
    },
    [deleteLanguage.data, deleteLanguage.isSuccess, deleteLanguage.isError]
  );

  const updateLanguage = useUpdateLanguage();
  useEffect(
    function () {
      if (updateLanguage.isSuccess) {
        toastHelper.success("Update categories successfully");
        console.log(updateLanguage.data);
      }
      if (updateLanguage.isError) {
        toastHelper.error(updateLanguage.error.message);
      }
    },
    [updateLanguage.data, updateLanguage.isSuccess, updateLanguage.isError]
  );

  useEffect(
    function () {
      setRows([{ name: "", code: "" }]);
    },
    [open]
  );

  if (
    getLanguages.isLoading ||
    createLanguage.isPending ||
    deleteLanguage.isPending ||
    updateLanguage.isPending
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col space-y-5 h-full min-h-0 ">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setOpen(true)}
            className="bg-proPurple rounded-lg text-lg hover:bg-proPurple/80"
          >
            Add many
          </Button>
          <Button
            variant="destructive"
            className="rounded-lg text-lg"
            onClick={() => deleteLanguage.mutate({ ids: rowsDeleted })}
          >
            Delete selected
          </Button>
        </div>
      </div>

      <div className="overflow-auto flex-1 min-h-0">
        <Table className="text-lg h-full w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent order-b-3">
              <TableHead />
              <TableHead className="font-extrabold">Name</TableHead>
              <TableHead className="font-extrabold">Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item?.id}
                className="hover:bg-white/20 cursor-pointer  border-white/20 border-b-3"
                onClick={() => {
                  setSelected(item);
                  setIsEditing(false);
                  setViewOpen(true);
                }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    className="data-[state=checked]:bg-proPurple data-[state=checked]:font-semibold"
                    onCheckedChange={function (checked) {
                      if (checked) {
                        setRowsDeleted((prev) => [
                          ...prev,
                          item?.id.toString(),
                        ]);
                      } else {
                        setRowsDeleted((prev) =>
                          prev.filter((i) => i !== item.id.toString())
                        );
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{item?.name}</TableCell>
                <TableCell>{item?.code}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationInput
        totalPages={totalPages}
        currentPage={Number(searchParams.get("page"))}
        onChange={(page: number) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set("page", page.toString());
          setSearchParams(newParams);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#404040] text-white border-0 max-h-[70vh] w-[50vw] sm:max-w-none flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Categories</DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 px-1">
            {rows.map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Name"
                  onChange={function (e) {
                    setRows((prev) => {
                      const newValues = [...prev];
                      if (!newValues[i]) {
                        return [];
                      }
                      newValues[i].name = e.currentTarget.value;
                      return newValues;
                    });
                  }}
                />
                <Input
                  placeholder="Code"
                  onChange={function (e) {
                    setRows((prev) => {
                      const newValues = [...prev];
                      if (!newValues[i]) {
                        return [];
                      }
                      newValues[i].code = e.currentTarget.value;
                      return newValues;
                    });
                  }}
                />
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            className="rounded-lg bg-black text-white hover:bg-black hover:opacity-50"
            onClick={() => setRows([...rows, { name: "", code: "" }])}
          >
            + Add Row
          </Button>

          <Button
            className="bg-proPurple rounded-lg hover:bg-proPurple/80"
            onClick={function (e) {
              createLanguage.mutate({ data: rows });
            }}
          >
            Add Categories
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-[#404040] text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl">Category detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3">
              <Input
                value={selected.name}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSelected({ ...selected, name: e.target.value })
                }
              />

              <Input
                value={selected.code}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSelected({ ...selected, code: e.target.value })
                }
              />

              {!isEditing ? (
                <Button
                  className="bg-proPurple w-full hover:bg-proPurple/60"
                  onClick={() => setIsEditing(true)}
                >
                  Click to edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="bg-proPurple flex-1 hover:bg-proPurple/60"
                    onClick={() => {
                      updateLanguage.mutate({
                        id: selected.id,
                        data: {
                          name: selected.name,
                          code: selected.code,
                        },
                      });

                      setIsEditing(false);
                      setViewOpen(false);
                    }}
                  >
                    Save
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      setViewOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ---------------- Main Page ----------------
export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const active = searchParams.get("option") ?? "";

  const appContext = useContext(AppContext) as any;
  useEffect(function () {
    if (!searchParams.get("option")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("option", "category");
      setSearchParams(newParams);
    }
  }, []);

  if (appContext.currentUser?.role !== General.accountRoles.ADMIN) {
    return <></>;
  }

  return (
    <div className="flex h-(--view-h) bg-black text-white px-(--primary-padding) py-10">
      <Sidebar
        active={active}
        setActive={(option) => {
          setSearchParams((prev) => {
            prev.set("option", option);
            return prev;
          });
        }}
      />
      <div className="flex-1 p-6 min-h-0">
        {active === "category" && <CategoryManager />}
        {active === "topic" && <TopicManager />}
        {active === "language" && <LanguageManager />}
      </div>
    </div>
  );
}
