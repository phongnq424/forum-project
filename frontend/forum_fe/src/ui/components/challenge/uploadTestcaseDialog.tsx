import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

type UploadFileDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleOnUpload: (f: File) => void;
};

export default function UploadFileDialog({
  open,
  setOpen,
  handleOnUpload,
}: UploadFileDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleUpload = () => {
    if (!file) return;
    handleOnUpload(file);

    setOpen(false);
    setFile(null);
  };

  useEffect(
    function () {
      setFile(null);
    },
    [open]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          sm:max-w-md
          bg-[#404040]
          text-white
          border-0
          shadow-none
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Upload testcase file</DialogTitle>
        </DialogHeader>

        {/* VÙNG CHỌN FILE */}
        <div
          onClick={openFilePicker}
          className="
            flex items-center justify-center
            rounded-lg
            p-6 cursor-pointer
            bg-black
            transition
          "
        >
          {!file ? (
            <span className="text-xl text-gray-300">
              Empty – Click to select a file
            </span>
          ) : (
            <div className="flex items-center gap-3 max-w-full">
              <FileText className="w-6 h-6 text-proPurple shrink-0" />
              <span className="text-xl font-medium truncate">{file.name}</span>
            </div>
          )}
        </div>

        {/* INPUT FILE ẨN */}
        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={handleFileChange}
          accept=".zip"
        />

        {/* NÚT UPLOAD */}
        <Button
          onClick={handleUpload}
          disabled={!file}
          className="
            mt-4 w-full
            bg-proPurple
            border-0
            text-xl
            hover:opacity-70
            py-5
          "
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload
        </Button>
      </DialogContent>
    </Dialog>
  );
}
