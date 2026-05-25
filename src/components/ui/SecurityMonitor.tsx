import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2, Activity, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SecurityEvent {
  id: string;
  type: string;
  student: string;
  exam: string;
  time: string;
  status: "flagged" | "resolved" | "pending";
}

export function SecurityMonitor() {
  const localResults = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("local_results") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  })();
  const localViolations: SecurityEvent[] = localResults.reduce((acc: any[], res: any, resIdx: number) => {
    if (res && res.violations && Array.isArray(res.violations)) {
      res.violations.forEach((v: string, vIdx: number) => {
        let timeFormatted = "N/A";
        try {
          if (res.submittedAt) {
            timeFormatted = new Date(res.submittedAt).toLocaleTimeString();
          }
        } catch (_) {}
        
        acc.push({
          id: `v-${resIdx}-${vIdx}`,
          type: v,
          student: res.studentName || "Unknown Student",
          exam: res.examTitle || res.examId || "Examination Assessment",
          time: timeFormatted,
          status: "flagged"
        });
      });
    }
    return acc;
  }, []);

  const mockEvents: SecurityEvent[] = [
    { id: "1", type: "Tab Switch", student: "John Doe", exam: "Biology Final", time: "2 mins ago", status: "flagged" },
    { id: "2", type: "Fullscreen Exit", student: "Jane Smith", exam: "Math Midterm", time: "15 mins ago", status: "resolved" },
  ];

  const events = [...localViolations, ...mockEvents];

  const statusVariants = {
    flagged: "bg-red-100 text-red-700 border-red-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 bg-red-50/30 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-red-400 uppercase tracking-widest">Active Flags</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-600">{events.filter(e => e.status === "flagged").length}</div>
            <p className="text-[10px] text-red-500 mt-1 font-medium">Requires immediate review</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-green-50/30 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-green-400 uppercase tracking-widest">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-600">{events.filter(e => e.status === "resolved").length}</div>
            <p className="text-[10px] text-green-500 mt-1 font-medium">Resolution tracking active</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-primary/5 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-widest">System Health</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">Stable</div>
            <p className="text-[10px] text-primary mt-1 font-medium">All monitors operational</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Live Security Feed</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {events.map((event) => (
              <div key={event.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{event.type}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.student}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {event.exam}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </span>
                  <Badge variant="outline" className={statusVariants[event.status]}>
                    {event.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
