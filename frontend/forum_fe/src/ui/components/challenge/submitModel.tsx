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
import type { Submission } from "./mockData";
import { cn } from "@/lib/utils";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
}

const statusConfig = {
  Accepted: {
    icon: CheckCircle,
    color: "text-easy",
    bgColor: "bg-easy/10",
    borderColor: "border-easy/30",
  },
  "Wrong Answer": {
    icon: XCircle,
    color: "text-hard",
    bgColor: "bg-hard/10",
    borderColor: "border-hard/30",
  },
  "Runtime Error": {
    icon: AlertTriangle,
    color: "text-medium",
    bgColor: "bg-medium/10",
    borderColor: "border-medium/30",
  },
  "Time Limit Exceeded": {
    icon: Clock,
    color: "text-medium",
    bgColor: "bg-medium/10",
    borderColor: "border-medium/30",
  },
};

export function SubmitModal({ isOpen, onClose, submission }: SubmitModalProps) {
  const navigate = useNavigate();

  if (!submission) return null;

  const config = statusConfig[submission.status];
  const StatusIcon = config.icon;

  const handleViewDetails = () => {
    onClose();
    navigate(`/solution/${submission.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Submission Result
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-lg border",
              config.bgColor,
              config.borderColor
            )}
          >
            <StatusIcon className={cn("w-16 h-16 mb-3", config.color)} />
            <span className={cn("text-xl font-bold", config.color)}>
              {submission.status}
            </span>
          </div>

          {/* Metrics */}
          {submission.status === "Accepted" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Cpu className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Runtime</div>
                  <div className="font-semibold text-foreground">
                    {submission.runtime}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Memory</div>
                  <div className="font-semibold text-foreground">
                    {submission.memory}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Back to Challenge
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
