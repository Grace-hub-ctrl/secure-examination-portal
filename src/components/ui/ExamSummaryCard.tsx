import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface ExamSummary {
  id: string;
  title: string;
  duration: string;
  startTime: string;
  status: "active" | "ongoing" | "upcoming" | "completed" | "draft" | "suspended";
  questions: number;
  score?: string;
  violations?: number;
  grade?: string;
  subject?: string;
}

interface ExamSummaryCardProps {
  key?: string | number;
  exam: ExamSummary;
  onClick?: (id: string) => void;
}

export function ExamSummaryCard({ exam, onClick }: ExamSummaryCardProps) {
  return (
    <Card 
      className={`group relative overflow-hidden transition-all hover:shadow-md cursor-pointer border-l-4 ${
        exam.status === "ongoing" ? "border-l-red-500" : "border-l-primary"
      }`}
      onClick={() => onClick?.(exam.id)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                {exam.title}
              </h3>
              <StatusBadge status={exam.status} />
              {exam.grade && (
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                  Grade {exam.grade}
                </Badge>
              )}
              {(exam as any).sectionsTargetType === "some" && (exam as any).allowedSections && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                  Sec: {Array.isArray((exam as any).allowedSections) ? (exam as any).allowedSections.join(", ") : (exam as any).allowedSections}
                </Badge>
              )}
              {exam.subject && (
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                  {exam.subject}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{exam.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{exam.questions} Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="font-medium">
                  {new Date(exam.startTime).toLocaleDateString()} at {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {exam.status === "completed" && exam.score && (
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Final Score</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-black text-slate-900">{exam.score}</span>
                </div>
              </div>
            )}
            
            {exam.violations !== undefined && exam.violations > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Violations</p>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-black text-red-600">{exam.violations}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
