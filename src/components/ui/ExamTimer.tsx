import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  onWarning?: (remainingSeconds: number) => void;
}

export function ExamTimer({ durationMinutes, onTimeUp, onWarning }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime === 300) onWarning?.(300); // 5 minutes warning
        if (newTime === 60) onWarning?.(60);   // 1 minute warning
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, onWarning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isLow = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all duration-500",
      isLow 
        ? "bg-red-50 border-red-500 text-red-600 animate-pulse" 
        : "bg-slate-50 border-slate-200 text-slate-900"
    )}>
      {isLow ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5 text-slate-400" />}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-black tracking-widest leading-none mb-1">Time Remaining</span>
        <span className="text-xl font-black tabular-nums leading-none">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
}
