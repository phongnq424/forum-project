import { CheckCircle, Clock, Circle } from "lucide-react";
import type { Status } from "./mockData";
import { cn } from "@/lib/utils";

interface StatusIconProps {
  status: Status;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  switch (status) {
    case "Solved":
      return <CheckCircle className={cn("w-5 h-5 text-solved", className)} />;
    case "Attempted":
      return <Clock className={cn("w-5 h-5 text-attempted", className)} />;
    case "Not Started":
    default:
      return <Circle className={cn("w-5 h-5 text-not-started", className)} />;
  }
}
