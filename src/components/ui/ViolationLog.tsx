import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface Violation {
  id: string;
  studentName: string;
  studentCode?: string;
  examTitle: string;
  type: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  grade?: string;
  section?: string;
}

interface ViolationLogProps {
  violations: Violation[];
}

export function ViolationLog({ violations }: ViolationLogProps) {
  const severityVariants: Record<string, string> = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Student</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Exam</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Violation</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Severity</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {violations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-slate-400 text-sm font-medium italic">
                No security violations logged.
              </TableCell>
            </TableRow>
          ) : (
            violations.map((violation) => (
              <TableRow key={violation.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        {violation.studentName}
                        {violation.studentCode && (
                          <code className="text-[9px] bg-primary/10 text-primary px-1 rounded font-black">
                            {violation.studentCode}
                          </code>
                        )}
                      </div>
                      {(violation.grade || violation.section) && (
                        <div className="text-[10px] text-slate-400 flex gap-1">
                          {violation.grade && <span>G-{violation.grade}</span>}
                          {violation.section && <span>• {violation.section}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {violation.examTitle}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {violation.type}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={severityVariants[violation.severity]}>
                    {violation.severity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-slate-500 font-mono text-xs">
                  <div className="flex items-center justify-end gap-2">
                    <Clock className="h-3 w-3" />
                    {format(new Date(violation.timestamp), "HH:mm:ss")}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
