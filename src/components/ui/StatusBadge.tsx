import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "active" | "ongoing" | "upcoming" | "completed" | "draft" | "suspended";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<StatusType, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    ongoing: "bg-red-100 text-red-700 border-red-200 animate-pulse",
    upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
    draft: "bg-amber-100 text-amber-700 border-amber-200",
    suspended: "bg-slate-200 text-slate-500 border-slate-300",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("capitalize font-semibold", variants[status], className)}
    >
      {status}
    </Badge>
  );
}
