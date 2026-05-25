import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  BookOpen, 
  Users, 
  Trophy, 
  AlertTriangle,
  Search,
  Filter,
  Download
} from "lucide-react";
import { ExamCreationForm } from "@/components/ui/ExamCreationForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/StatCard";
import { ExamSummaryCard } from "@/components/ui/ExamSummaryCard";
import { ViolationLog } from "@/components/ui/ViolationLog";
import { ExamAnalytics } from "@/components/ui/ExamAnalytics";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StatItem } from "@/types";

export default function TeacherDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      let localExams: any[] = [];
      let localResults: any[] = [];
      let localLive: any[] = [];
      let localBlocks: any[] = [];
      
      try {
        const parsed = JSON.parse(localStorage.getItem("local_exams") || "[]");
        localExams = (Array.isArray(parsed) ? parsed : []).filter((e: any) => e && typeof e === "object");
      } catch (_) {}
      
      try {
        const parsed = JSON.parse(localStorage.getItem("local_results") || "[]");
        localResults = (Array.isArray(parsed) ? parsed : []).filter((r: any) => r && typeof r === "object");
      } catch (_) {}
      
      try {
        const parsed = JSON.parse(localStorage.getItem("local_live_violations") || "[]");
        localLive = (Array.isArray(parsed) ? parsed : []).filter((lv: any) => lv && typeof lv === "object");
      } catch (_) {}
      
      try {
        const parsed = JSON.parse(localStorage.getItem("global_blocks") || "[]");
        localBlocks = (Array.isArray(parsed) ? parsed : []).filter((b: any) => b && typeof b === "object");
      } catch (_) {}
      
      setBlocks(localBlocks);
      
      const localViolationsMap = localResults.reduce((acc: any[], res: any) => {
        if (res && res.violations && Array.isArray(res.violations)) {
          res.violations.forEach((v: string) => {
            acc.push({
              _id: `lv-${Date.now()}-${Math.random()}`,
              studentId: { name: res.studentName || "Unknown" },
              studentCode: res.studentCode || "N/A",
              examId: { title: res.examTitle || res.examId || "Assessment" },
              type: v,
              timestamp: res.submittedAt || new Date().toISOString(),
              severity: "high",
              grade: res.grade || "N/A",
              section: res.section || "N/A"
            });
          });
        }
        return acc;
      }, []);

      const liveViolationsMap = localLive.map((lv: any) => ({
        _id: lv.id || `live-${Date.now()}-${Math.random()}`,
        studentId: { name: lv.studentName || "Unknown" },
        studentCode: lv.studentCode || "N/A",
        examId: { title: lv.examTitle || lv.examId || "Assessment" },
        type: `${lv.type || "Activity"} (LIVE)`,
        timestamp: lv.timestamp || new Date().toISOString(),
        severity: "high",
        grade: lv.grade || "N/A",
        section: lv.section || "N/A"
      }));

      const mockExams = [
        { _id: "mock-exam-1", title: "General Science Midterm", duration: 60, status: "ongoing", questions: new Array(20), createdAt: new Date().toISOString(), grade: "8", subject: "General science" },
        { _id: "mock-exam-2", title: "Grade 12 Mathematics", duration: 90, status: "upcoming", questions: new Array(15), createdAt: new Date().toISOString(), grade: "12", subject: "Mathematics" }
      ];
      
      const mockViolations = [
        { _id: "v1", studentId: { name: "John Doe" }, examId: { title: "General Science Midterm" } , type: "Tab Switch", timestamp: new Date().toISOString(), severity: "medium", grade: "8", section: "SEC-A" },
        { _id: "v2", studentId: { name: "Jane Smith" }, examId: { title: "General Science Midterm" } , type: "Multiple Faces", timestamp: new Date().toISOString(), severity: "high", grade: "8", section: "SEC-B" }
      ];
      
      setExams([...localExams, ...mockExams]);
      setViolations([...liveViolationsMap, ...localViolationsMap, ...mockViolations]);
      setResults(localResults);

      // Calculate Real Analytics
      if (localResults.length > 0) {
        const total = localResults.length;
        const sumScores = localResults.reduce((acc: number, r: any) => acc + (r.scorePercentage || 0), 0);
        const avg = Math.round(sumScores / total);
        const passed = localResults.filter((r: any) => (r.scorePercentage || 0) >= 50).length;
        const passRate = Math.round((passed / total) * 100);
        
        const ranges = [
          { range: "0-20", count: 0 },
          { range: "21-40", count: 0 },
          { range: "41-60", count: 0 },
          { range: "61-80", count: 0 },
          { range: "81-100", count: 0 },
        ];
        localResults.forEach((r: any) => {
          const s = r.scorePercentage || 0;
          if (s <= 20) ranges[0].count++;
          else if (s <= 40) ranges[1].count++;
          else if (s <= 60) ranges[2].count++;
          else if (s <= 80) ranges[3].count++;
          else ranges[4].count++;
        });

        setAnalytics({
          totalStudents: total,
          avgScore: avg,
          passRate: passRate,
          violationRate: Math.round((localViolationsMap.length / total) * 100) || 0,
          scoreDistribution: ranges
        });
      }

      toast.info("Dashboard synced with local test data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnlock = (studentCode: string, examId: string) => {
    // Remove the blocking flag for the specific student/exam combo
    localStorage.removeItem(`blocked_exam_${examId}_${studentCode}`);
    
    // Update global blocks record
    const updatedBlocks = blocks.filter(b => !(b.studentCode === studentCode && b.examId === examId));
    localStorage.setItem("global_blocks", JSON.stringify(updatedBlocks));
    setBlocks(updatedBlocks);
    
    toast.success(`Access restored for student ${studentCode}`);
  };

  const stats: StatItem[] = [
    { title: "Ongoing Exams", value: exams.filter(e => e.status === "ongoing").length.toString(), icon: <BookOpen className="h-4 w-4" /> },
    { title: "Total Exam Folders", value: exams.length.toString(), icon: <Users className="h-4 w-4" /> },
    { title: "Submissions", value: results.length.toString(), icon: <Trophy className="h-4 w-4" /> },
    { title: "Security Flags", value: violations.length.toString(), icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
  ];

  const filteredExams = exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Teacher <span className="text-blue-600">Workspace</span>
          </h1>
          <p className="text-slate-500 font-medium">Create and publish secure examinations, track real-time violations, and overview metrics.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-4 rounded-2xl h-20 px-12 text-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white border-none">
              <Plus className="h-8 w-8 stroke-[4]" />
              Create New Examination
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[95vw] w-full max-h-[96vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0">
            <div className="flex flex-col h-full">
              <DialogHeader className="px-12 pt-10 pb-8 border-b border-slate-100 bg-white sticky top-0 z-50">
                <DialogTitle className="text-5xl font-black tracking-tighter text-slate-900 uppercase">Create New Examination</DialogTitle>
                <DialogDescription className="text-2xl font-medium text-slate-500 max-w-4xl">
                  Design your examination by adding questions manually below.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 md:p-12">
                <ExamCreationForm onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  fetchData();
                }} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} />
        ))}
      </div>

      <Tabs defaultValue="exams" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
          <TabsTrigger value="exams" className="rounded-lg px-6">My Exams</TabsTrigger>
          <TabsTrigger value="submissions" className="rounded-lg px-6">Recent Submissions</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg px-6">Performance Analytics</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6">Security Logs</TabsTrigger>
          <TabsTrigger value="blocks" className="rounded-lg px-6 bg-red-50 text-red-600 data-[state=active]:bg-red-600 data-[state=active]:text-white">Active Blocks</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Student Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Section</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Exam</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Score Achieved</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Submitted At</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.length > 0 ? results.map((res: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{res.studentName}</div>
                        <div className="text-[10px] text-primary font-black uppercase">{res.studentCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                          G-{res.grade} • {res.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                        {res.examTitle || `ID: ${res.examId}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-black",
                            res.scorePercentage >= 50 ? "text-green-600" : "text-red-600"
                          )}>
                            {res.scorePercentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            ({res.correctCount}/{res.totalQuestions})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[10px]">
                        {new Date(res.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-primary h-8">View Result</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic text-sm">No submissions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search exams..." 
                  className="pl-10 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-10">Loading exams...</div>
            ) : filteredExams.length > 0 ? (
              filteredExams.map((exam) => (
                <ExamSummaryCard 
                  key={exam._id} 
                  exam={{
                    id: exam._id,
                    title: exam.title,
                    duration: `${exam.duration} mins`,
                    startTime: exam.startTime || exam.createdAt,
                    status: exam.status,
                    questions: exam.questions.length,
                    grade: exam.grade,
                    subject: exam.subject,
                    sectionsTargetType: exam.sectionsTargetType,
                    allowedSections: exam.allowedSections
                  } as any} 
                  onClick={(id) => console.log("Manage exam:", id)}
                />
              ))
            ) : (
              <div className="text-center py-10 text-slate-500">No exams found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ExamAnalytics data={analytics || {
            totalStudents: 156,
            avgScore: 76,
            passRate: 88,
            violationRate: 2,
            scoreDistribution: [
              { range: "0-20", count: 2 },
              { range: "21-40", count: 8 },
              { range: "41-60", count: 24 },
              { range: "61-80", count: 82 },
              { range: "81-100", count: 40 },
            ]
          }} />
        </TabsContent>

        <TabsContent value="security">
          <ViolationLog violations={violations.map(v => ({
            id: v._id,
            studentName: v.studentId?.name || "Unknown",
            studentCode: v.studentCode,
            examTitle: v.examId?.title || "Unknown",
            type: v.type,
            timestamp: new Date(v.timestamp).toISOString(), 
            severity: v.severity,
            grade: v.grade,
            section: v.section
          }))} />
        </TabsContent>

        <TabsContent value="blocks" className="space-y-6">
          <Card className="rounded-2xl border-2 border-red-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-red-50 border-b border-red-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400">Blocked Student</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400">Exam Title</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400">Locked At</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {blocks.length > 0 ? blocks.map((block: any) => (
                    <tr key={block.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{block.studentName}</div>
                        <div className="text-[10px] text-red-600 font-black uppercase">{block.studentCode}</div>
                        <div className="text-[10px] text-slate-400">Grade {block.grade} • {block.section}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600 font-bold text-xs">{block.examTitle}</div>
                        {block.reason && (
                          <div className="text-[10px] text-red-600 font-bold bg-stretch bg-red-50 border border-red-100 rounded px-1.5 py-0.5 mt-1 inline-block leading-normal max-w-xs">
                            Reason: {block.reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[10px]">
                        {new Date(block.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          onClick={() => handleUnlock(block.studentCode, block.examId)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold h-9 rounded-xl shadow-lg shadow-green-600/20"
                        >
                          Restore Access
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                        No active security blocks identified.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

