import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MessageSquare, Clock, ShieldAlert, BadgeCheck, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Result {
  examTitle: string;
  studentName?: string;
  score: number | null; // null represents pending review
  total: number;
  date: string;
  duration: string;
  performance?: "excellent" | "good" | "average" | "poor";
  status?: "pending" | "reviewed";
  teacherFeedback?: string;
  violationsCount?: number;
}

interface ResultCardProps {
  key?: string | number;
  result: Result;
}

export function ResultCard({ result }: ResultCardProps) {
  const isPending = result.status === "pending" || result.score === null;
  const scoreVal = result.score !== null ? result.score : 0;
  const percentage = isPending ? 0 : Math.round((scoreVal / result.total) * 100);

  const performanceColors = {
    excellent: "text-green-600 bg-green-50 border-green-200",
    good: "text-blue-600 bg-blue-50 border-blue-200",
    average: "text-amber-600 bg-amber-50 border-amber-200",
    poor: "text-red-600 bg-red-50 border-red-200",
  };

  const getPerformance = () => {
    if (result.performance) return result.performance;
    if (percentage >= 85) return "excellent";
    if (percentage >= 70) return "good";
    if (percentage >= 50) return "average";
    return "poor";
  };

  const performance = getPerformance();

  return (
    <Card className="overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white">
      <CardHeader className="bg-slate-50/60 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base font-bold text-slate-900 leading-snug">{result.examTitle}</CardTitle>
          
          {isPending ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shrink-0 px-2.5 py-0.5">
              <Clock className="h-3 w-3 animate-spin duration-1000" />
              Awaiting Review
            </Badge>
          ) : (
            <Badge variant="outline" className={`${performanceColors[performance]} text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 px-2.5 py-0.5`}>
              <BadgeCheck className="h-3 w-3" />
              Graded & Released
            </Badge>
          )}
        </div>
        
        {result.studentName && (
          <div className="mt-2">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100/50 px-2.5 py-0.5 rounded-full uppercase tracking-tighter">
              Student: {result.studentName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            {result.duration}
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-slate-400" />
            Submitted: {new Date(result.date).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {isPending ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5 animate-bounce" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-900">Evaluation Pending</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Your answers was recorded securely. The teacher is reviewing your answers and will publish points soon.
                </p>
              </div>
            </div>
            
            {result.violationsCount !== undefined && result.violationsCount > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Security logs recorded {result.violationsCount} external action flag(s) during session.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Score Achieved</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">{result.score}</span>
                  <span className="text-base text-slate-400 font-bold">/ {result.total}</span>
                </div>
              </div>
              <div className="relative h-16 w-16">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={percentage >= 85 ? "text-green-500 stroke-current" : percentage >= 50 ? "text-blue-500 stroke-current" : "text-amber-500 stroke-current"}
                    strokeWidth="3.5"
                    strokeDasharray={`${percentage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="text-[8px] font-black text-slate-950" textAnchor="middle" fill="currentColor">
                    {percentage}%
                  </text>
                </svg>
              </div>
            </div>

            {/* Custom feedback card from teacher */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/60 space-y-1.5 shadow-sm">
              <p className="text-[9px] font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Teacher Remarks & Feedback:
              </p>
              <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                {result.teacherFeedback ? `"${result.teacherFeedback}"` : '"Examination analyzed. Answers assessed successfully with standard scoring criteria."'}
              </p>
            </div>
            
            {result.violationsCount !== undefined && result.violationsCount > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border text-slate-500 text-[10px] font-bold">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span>Security logs flagged {result.violationsCount} exit warnings. Review was authorized by admin.</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-slate-100/70">
          <Link 
            to="/results" 
            className="text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline flex items-center justify-center gap-1 uppercase tracking-wider"
          >
            Open Interactive Graded Exam Paper →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
