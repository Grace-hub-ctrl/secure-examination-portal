import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, BarChart3, Clock } from "lucide-react";

interface Result {
  examTitle: string;
  studentName?: string;
  score: number;
  total: number;
  date: string;
  duration: string;
  performance: "excellent" | "good" | "average" | "poor";
}

interface ResultCardProps {
  key?: string | number;
  result: Result;
}

export function ResultCard({ result }: ResultCardProps) {
  const percentage = (result.score / result.total) * 100;
  
  const performanceColors = {
    excellent: "text-green-600 bg-green-50 border-green-200",
    good: "text-blue-600 bg-blue-50 border-blue-200",
    average: "text-amber-600 bg-amber-50 border-amber-200",
    poor: "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-lg font-bold text-slate-900">{result.examTitle}</CardTitle>
          <Badge variant="outline" className={performanceColors[result.performance]}>
            {result.performance}
          </Badge>
        </div>
        
        {result.studentName && (
          <div className="mb-3">
            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Student: {result.studentName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {result.duration}
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {new Date(result.date).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Score Achieved</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">{result.score}</span>
              <span className="text-xl text-slate-400 font-bold">/ {result.total}</span>
            </div>
          </div>
          <div className="relative h-20 w-20">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-slate-100 stroke-current"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary stroke-current"
                strokeWidth="3"
                strokeDasharray={`${percentage}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="text-[8px] font-black text-slate-900" textAnchor="middle" fill="currentColor">
                {Math.round(percentage)}%
              </text>
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
