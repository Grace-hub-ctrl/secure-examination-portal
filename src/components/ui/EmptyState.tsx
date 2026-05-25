import React from "react";
import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon = <FileQuestion className="h-12 w-12 text-slate-300" /> 
}: EmptyStateProps) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-2xl bg-slate-50/50 space-y-6">
      <div className="p-4 bg-white rounded-full shadow-sm">
        {icon}
      </div>
      <div className="max-w-xs space-y-2">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
