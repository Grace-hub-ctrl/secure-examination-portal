import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ name, className, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  return (
    <div className={cn(
      "rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 overflow-hidden",
      sizeClasses[size],
      className
    )}>
      {initials || <User className="h-1/2 w-1/2" />}
    </div>
  );
}
