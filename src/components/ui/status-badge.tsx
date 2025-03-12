import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
  status: StatusType;
  text: string;
  className?: string;
}

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  const variantMap: Record<StatusType, React.ComponentProps<typeof Badge>["variant"]> = {
    success: "default",
    warning: "secondary",
    error: "destructive",
    info: "outline",
    default: "secondary",
  };

  const colorClasses = {
    success: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300", 
    info: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
    default: "",
  };

  return (
    <Badge 
      variant={variantMap[status]}
      className={cn(colorClasses[status], className)}
    >
      {text}
    </Badge>
  );
}
