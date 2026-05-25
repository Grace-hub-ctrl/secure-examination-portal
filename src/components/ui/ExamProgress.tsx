import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamProgressProps {
  current: number;
  total: number;
  answered: number[];
}

export function ExamProgress({ current, total, answered }: ExamProgressProps) {
  const percentage = (answered.length / total) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Progress</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{answered.length}</span>
            <span className="text-sm text-slate-400 font-bold">/ {total} Answered</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Completion</span>
          <div className="text-xl font-black text-primary">{Math.round(percentage)}%</div>
        </div>
      </div>
      
      <Progress value={percentage} className="h-2 bg-slate-100" />
      
      <div className="grid grid-cols-10 gap-2 pt-2">
        {Array.from({ length: total }).map((_, i) => {
          const isCurrent = i === current;
          const isAnswered = answered.includes(i);
          
          return (
            <div 
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isCurrent ? "bg-primary ring-4 ring-primary/20" : 
                isAnswered ? "bg-green-500" : "bg-slate-200"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
