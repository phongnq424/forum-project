import { useContext, useState } from "react";
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
    </div>
  );
}

// ---------------- Category UI ----------------
function CategoryManager() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([{ name: "", description: "" }]);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const data = [
    { id: 1, name: "Category 1", description: "Description 1" },
    { id: 2, name: "Category 2", description: "Description 2" },
    { id: 3, name: "Category 3", description: "Description 3" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category</h2>
        <div className="space-x-2">
          <Button
            onClick={() => setOpen(true)}
            className="bg-proPurple rounded-lg text-lg hover:bg-proPurple/80"
          >
            Add many
          </Button>
          <Button variant="destructive" className="rounded-lg text-lg">
            Delete selected
          </Button>
        </div>
      </div>

      <Table className="text-lg">
        <TableHeader>
          <TableRow className="hover:bg-transparent ">
            <TableHead />
            <TableHead className="font-extrabold">Name</TableHead>
            <TableHead className="font-extrabold">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-white/20 cursor-pointer"
              onClick={() => {
                setSelected(item);
                setIsEditing(false);
                setViewOpen(true);
              }}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox className="data-[state=checked]:bg-proPurple data-[state=checked]:font-semibold" />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#404040] text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Categories</DialogTitle>
          </DialogHeader>

          {rows.map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Input placeholder="Name" />
              <Input placeholder="Description" />
            </div>
          ))}

          <Button
            variant="secondary"
            className="rounded-lg bg-black text-white hover:bg-black hover:opacity-50"
            onClick={() => setRows([...rows, { name: "", description: "" }])}
          >
            + Add row
          </Button>

          <Button className="bg-proPurple rounded-lg hover:bg-proPurple/80">
            Submit
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
                      // TODO: call API save
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
  const categories = [
    { id: "1", name: "Category A" },
    { id: "2", name: "Category B" },
  ];

  const data = [
    { id: 1, name: "Topic 1", description: "Desc 1", categoryId: "1" },
    { id: 2, name: "Topic 2", description: "Desc 2", categoryId: "2" },
    { id: 3, name: "Topic 3", description: "Desc 3", categoryId: "1" },
  ];

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [selected, setSelected] = useState<{
    id: number;
    name: string;
    description: string;
    categoryId: string;
  } | null>(null);

  return (
    <div className="space-y-4">
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
          <Button variant="destructive" className="rounded-lg text-lg">
            Delete selected
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table className="text-lg">
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-white/20 cursor-pointer"
              onClick={() => {
                setSelected(item);
                setIsEditing(false);
                setViewOpen(true);
              }}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox className="data-[state=checked]:bg-proPurple data-[state=checked]:font-semibold" />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                {categories.find((c) => c.id === item.categoryId)?.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
                  value={selected.categoryId}
                  onValueChange={(v) =>
                    setSelected({ ...selected, categoryId: v })
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
                    categories.find((c) => c.id === selected.categoryId)?.name
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

// ---------------- Main Page ----------------
export default function AdminPage() {
  const [active, setActive] = useState("category");
  const appContext = useContext(AppContext) as any;

  if (appContext.currentUser?.role !== General.accountRoles.ADMIN) {
    return <></>;
  }
  return (
    <div className="flex h-(--view-h) bg-black text-white px-(--primary-padding) py-10">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 p-6 overflow-auto">
        {active === "category" && <CategoryManager />}
        {active === "topic" && <TopicManager />}
      </div>
    </div>
  );
}
