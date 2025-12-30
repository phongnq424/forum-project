import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  HardDrive,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    submittedAt: string;
    status: string;
    score: number;
    code: string;
    languageName: string;
  };
}

const statusStyle: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700",
  WA: "bg-red-100 text-red-700",
};

export function SubmitModal({ isOpen, onClose, data }: SubmitModalProps) {
  if (!data) return null;

  const statusClass =
    statusStyle[data.status] || "bg-yellow-100 text-yellow-700";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-none sm:max-h-none sm:w-[50vw] sm:h-[70vh] bg-black404040 border-none flex flex-col">
        <DialogHeader className="h-fi">
          <DialogTitle className="text-white text-2xl">
            Submission Result
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex flex-col flex-1">
          {/* Status */}
          <div className="flex justify-between">
            <div
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg bg-black basis-[40%]"
              )}
            >
              <div className="text-sm text-muted-foreground">
                Submitted at: {data.submittedAt}
              </div>

              <div className="text-sm text-muted-foreground">
                Language: {data.languageName}
              </div>
            </div>

            <span
              className={cn(
                "w-fit rounded-md px-2 py-0.5 text-lg font-semibold basis-[20%] flex justify-center items-center",
                statusClass
              )}
            >
              {data.status}
            </span>

            <div className="text-lg flex p-2 rounded-lg bg-black basis-[20%] justify-center items-center">
              {data.score} pts
            </div>
          </div>

          {/* Metrics */}
          <textarea
            readOnly={true}
            value={data.code}
            className="overflow-auto flex-1 text-white bg-black border-none p-5 rounded-lg font-mono"
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-lg py-5 border-none bg-proPurple hover:opacity-70 hover:bg-proPurple"
              onClick={onClose}
            >
              Back to Challenge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
