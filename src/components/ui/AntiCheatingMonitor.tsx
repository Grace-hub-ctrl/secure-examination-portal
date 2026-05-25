import { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AntiCheatingMonitorProps {
  onViolation: (type: string) => void;
  silent?: boolean;
}

export function AntiCheatingMonitor({ onViolation, silent = false }: AntiCheatingMonitorProps) {
  const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement !== null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [lastViolation, setLastViolation] = useState<string | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement !== null;
      setIsFullscreen(isFull);
      if (!isFull) {
        onViolation("Fullscreen Exit");
        setLastViolation("Fullscreen Exit");
        if (!silent) {
          toast.error("Security Alert: Fullscreen mode exited!", {
            description: "This incident has been logged. Please return to fullscreen.",
            duration: 5000,
          });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        onViolation("Tab Switch");
        setLastViolation("Tab Switch");
        if (!silent) {
          toast.error("Security Alert: Tab switch detected!", {
            description: "Switching tabs during an exam is strictly prohibited.",
            duration: 5000,
          });
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onViolation("Right Click Attempt");
      setLastViolation("Right Click Attempt");
      if (!silent) {
        toast.warning("Security Alert: Right-click is disabled.");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "u")) ||
        (e.metaKey && (e.key === "c" || e.key === "v" || e.key === "u")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        onViolation("Forbidden Shortcut");
        setLastViolation("Forbidden Shortcut");
        if (!silent) {
          toast.error("Security Alert: Keyboard shortcuts are disabled.");
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onViolation]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Security Monitor</span>
          <div className="flex items-center gap-2">
            <Shield className={cn("h-5 w-5", isFullscreen ? "text-green-500" : "text-red-500")} />
            <span className="text-xl font-black text-slate-900 tracking-tight">Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
          <Activity className="h-3 w-3 text-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-600 uppercase">Live Feed</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-3 rounded-xl border-2 transition-all",
          isFullscreen ? "bg-slate-50 border-slate-100" : "bg-red-50 border-red-200"
        )}>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Fullscreen</p>
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-bold", isFullscreen ? "text-slate-900" : "text-red-600")}>
              {isFullscreen ? "Secure" : "Exited"}
            </span>
            {isFullscreen ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-xl border-2 transition-all",
          tabSwitches === 0 ? "bg-slate-50 border-slate-100" : "bg-amber-50 border-amber-200"
        )}>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Tab Switches</p>
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-bold", tabSwitches === 0 ? "text-slate-900" : "text-amber-600")}>
              {tabSwitches} Flags
            </span>
            {tabSwitches === 0 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
          </div>
        </div>
      </div>

      {lastViolation && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-red-400 uppercase font-black tracking-widest leading-none mb-1">Last Violation</span>
            <span className="text-xs font-bold text-red-600">{lastViolation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
