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
  Download,
  Check,
  X,
  Award,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  Eye,
  PenTool,
  ArrowRight
} from "lucide-react";
import { ExamCreationForm } from "@/components/ui/ExamCreationForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/StatCard";
import { ExamSummaryCard } from "@/components/ui/ExamSummaryCard";
import { ViolationLog } from "@/components/ui/ViolationLog";
import { ExamAnalytics } from "@/components/ui/ExamAnalytics";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  
  // Custom interactive grading workspace state
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adjustedCount, setAdjustedCount] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");

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
        const sumScores = localResults.reduce((acc: number, r: any) => {
          const pct = r.adjustedScorePercentage !== undefined ? r.adjustedScorePercentage : r.scorePercentage;
          return acc + (pct || 0);
        }, 0);
        const avg = Math.round(sumScores / total);
        const passed = localResults.filter((r: any) => {
          const pct = r.adjustedScorePercentage !== undefined ? r.adjustedScorePercentage : r.scorePercentage;
          return (pct || 0) >= 50;
        }).length;
        const passRate = Math.round((passed / total) * 100);
        
        const ranges = [
          { range: "0-20", count: 0 },
          { range: "21-40", count: 0 },
          { range: "41-60", count: 0 },
          { range: "61-80", count: 0 },
          { range: "81-100", count: 0 },
        ];
        localResults.forEach((r: any) => {
          const pct = r.adjustedScorePercentage !== undefined ? r.adjustedScorePercentage : r.scorePercentage;
          const s = pct || 0;
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
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-sm font-black",
                              (res.status === "reviewed" || res.pointsReleased) ? "text-indigo-600" : res.scorePercentage >= 50 ? "text-green-600" : "text-amber-600"
                            )}>
                              {res.status === "reviewed" || res.pointsReleased ? `${Math.round(((res.adjustedCorrectCount !== undefined ? res.adjustedCorrectCount : res.correctCount) / res.totalQuestions) * 100)}%` : `${res.scorePercentage}%`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-extrabold">
                              ({res.status === "reviewed" || res.pointsReleased ? (res.adjustedCorrectCount !== undefined ? res.adjustedCorrectCount : res.correctCount) : res.correctCount}/{res.totalQuestions})
                            </span>
                          </div>
                          {res.status === "reviewed" || res.pointsReleased ? (
                            <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100/60 rounded-full px-2 py-0.5 w-max">
                              Graded & Released
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 w-max animate-pulse">
                              Pending Review
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[10px] font-medium">
                        {new Date(res.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="font-bold text-xs h-8 rounded-lg border-primary/20 hover:bg-primary/5 text-primary"
                          onClick={() => {
                            setSelectedSub(res);
                            setAdjustedCount(res.adjustedCorrectCount !== undefined ? res.adjustedCorrectCount : res.correctCount);
                            setFeedbackText(res.teacherFeedback || "");
                            setShowReviewDialog(true);
                          }}
                        >
                          Review & Grade
                        </Button>
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

      {/* Interactive Assessment & Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[85vw] md:max-w-[75vw] w-full max-h-[92vh] overflow-y-auto rounded-[30px] border-none shadow-2xl p-0 font-sans">
          {selectedSub && (
            <div className="flex flex-col h-full bg-slate-50 text-slate-900">
              {/* Header */}
              <div className="px-8 py-6 bg-white border-b border-slate-100 sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                    Grade {selectedSub.grade} • Section {selectedSub.section}
                  </span>
                  <DialogTitle className="text-2xl font-black text-slate-900 leading-tight block">
                    Assess Submission: <span className="text-indigo-600 font-extrabold">{selectedSub.studentName}</span>
                  </DialogTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">
                    Access Code: <span className="text-slate-700 font-black">{selectedSub.studentCode}</span> • Submitted: {new Date(selectedSub.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    selectedSub.violations?.length > 0 ? "bg-red-50 text-red-700 border-red-200 animate-pulse" : "bg-green-50 text-green-700 border-green-200",
                    "text-[10px] font-black uppercase px-2.5 py-1 flex items-center gap-1"
                  )}>
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {selectedSub.violations?.length || 0} Security Flags
                  </Badge>
                </div>
              </div>

              {/* Body split */}
              <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                {/* Score adjustment & Feedback panel */}
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                  <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-6 md:col-span-5 space-y-4 flex flex-col justify-center">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Adjust Total Points</Label>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number"
                            min={0}
                            max={selectedSub.totalQuestions}
                            value={adjustedCount}
                            onChange={(e) => setAdjustedCount(Math.min(selectedSub.totalQuestions, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-24 h-12 text-center text-xl font-black rounded-xl border-2 border-slate-100 focus:border-indigo-500"
                          />
                          <span className="text-xl font-bold text-slate-400">/ {selectedSub.totalQuestions}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal font-bold uppercase tracking-wide mt-1">
                          Evaluated Score Percentage: <span className="text-indigo-600 font-black">{Math.round((adjustedCount / selectedSub.totalQuestions) * 100)}%</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          type="button"
                          className="h-8 text-[11px] font-bold gap-1 rounded-lg border-green-200 bg-green-50/50 hover:bg-green-50 text-green-700" 
                          onClick={() => setAdjustedCount(selectedSub.totalQuestions)}
                        >
                          <Award className="h-3 w-3" /> Perfect Score
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          type="button"
                          className="h-8 text-[11px] font-bold gap-1 rounded-lg border-slate-200" 
                          onClick={() => setAdjustedCount(selectedSub.correctCount)}
                        >
                          Reset to Auto Grade
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 md:col-span-7 space-y-2.5">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                        Teacher Remarks & Feedback
                      </Label>
                      <Textarea 
                        placeholder="Write dynamic feedback, notes, or tips for the student..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="min-h-[100px] rounded-xl border border-slate-200 text-xs focus-visible:ring-indigo-500 focus:border-indigo-500 p-3 font-medium placeholder:text-slate-300 bg-slate-50/40"
                      />
                    </div>
                  </div>
                </Card>

                {/* Question grading helper list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Exam Questions & Submissions</h3>
                  <div className="space-y-4">
                    {(() => {
                      const listQ = selectedSub.questions && selectedSub.questions.length > 0 ? selectedSub.questions : [
                        { id: 1, type: "multiple-choice", text: "Which of the following is the primary site of photosynthesis in a plant cell?", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], correctIndex: 1 },
                        { id: 2, type: "true-false", text: "The chemical formula for glucose is C6H12O6.", options: ["True", "False"], correctIndex: 0 },
                        { id: 3, type: "short-answer", text: "Which process produces the most ATP during cellular respiration?", options: [], correctAnswer: "Electron transport chain" },
                      ];
                      
                      return listQ.map((q: any, qIdx: number) => {
                        const studentAns = selectedSub.answers?.[qIdx];
                        let isCorrect = false;

                        if (q.type === "multiple-choice" || q.type === "true-false") {
                          isCorrect = studentAns === q.correctIndex;
                        } else {
                          isCorrect = studentAns?.toString().toLowerCase().trim() === (q.correctAnswer || q.expectedAnswer)?.toString().toLowerCase().trim();
                        }

                        return (
                          <div key={q.id || qIdx} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Question {qIdx + 1} • <span className="text-indigo-600 font-bold">{q.type}</span>
                              </span>
                              {isCorrect ? (
                                <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold">
                                  <Check className="h-3.5 w-3.5 mr-1" /> Match
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">
                                  <X className="h-3.5 w-3.5 mr-1" /> Mismatch
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm font-bold text-slate-900 tracking-tight leading-relaxed">{q.text}</p>

                            {q.options && q.options.length > 0 && (
                              <div className="grid gap-2 text-xs">
                                {q.options.map((opt: string, optIdx: number) => {
                                  const isStudentOption = studentAns === optIdx || (typeof studentAns === "string" && studentAns === opt);
                                  const isCorrectOption = q.correctIndex === optIdx;
                                  return (
                                    <div 
                                      key={optIdx} 
                                      className={cn(
                                        "p-3 rounded-xl border flex items-center justify-between font-semibold transition-all",
                                        isCorrectOption ? "bg-green-55/40 bg-green-50 border-green-200 text-green-800" : isStudentOption ? "bg-red-50 border-red-250 text-red-800" : "bg-slate-50/50 border-slate-100 text-slate-700"
                                      )}
                                    >
                                      <span>{opt}</span>
                                      <div className="flex items-center gap-1.5">
                                        {isCorrectOption && <span className="text-[8px] font-black uppercase tracking-wider bg-green-200 px-2 py-0.5 rounded text-green-900 border border-green-300">Correct Answer</span>}
                                        {isStudentOption && <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-200 px-2 py-0.5 rounded text-indigo-900 border border-indigo-300">Student Choice</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {(!q.options || q.options.length === 0) && (
                              <div className="grid gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Correct Answer:</p>
                                  <p className="font-mono text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 inline-block">{q.correctAnswer || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Completed Entry:</p>
                                  <p className={cn(
                                    "font-mono text-xs font-bold border rounded-lg px-3 py-1.5 inline-block",
                                    isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800 font-extrabold"
                                  )}>
                                    {studentAns !== undefined && studentAns !== "" ? studentAns.toString() : "[Left Blank / No Answer]"}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Point increment tools */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-end">
                              <span className="text-[10px] text-slate-400 font-bold mr-2 uppercase tracking-wide">Quick Score adjuster:</span>
                              <Button 
                                size="sm" 
                                type="button"
                                variant="outline" 
                                className="h-7 text-[10px] font-bold gap-1 rounded-lg border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                onClick={() => setAdjustedCount(prev => Math.min(selectedSub.totalQuestions, prev + 1))}
                              >
                                Increment Point (+1)
                              </Button>
                              <Button 
                                size="sm" 
                                type="button"
                                variant="outline" 
                                className="h-7 text-[10px] font-bold gap-1 rounded-lg border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                onClick={() => setAdjustedCount(prev => Math.max(0, prev - 1))}
                              >
                                Decrement Point (-1)
                              </Button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Sticky Footer actions */}
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-10 rounded-b-[24px]">
                <Button variant="ghost" className="font-bold text-slate-500 rounded-xl" onClick={() => setShowReviewDialog(false)}>
                  Cancel Assessment
                </Button>
                <Button 
                  onClick={() => {
                    const localResults = JSON.parse(localStorage.getItem("local_results") || "[]");
                    const updated = localResults.map((res: any) => {
                      const matchesId = selectedSub.submissionId && res.submissionId === selectedSub.submissionId;
                      const matchesCombo = !selectedSub.submissionId && 
                                           res.studentCode === selectedSub.studentCode && 
                                           res.examId === selectedSub.examId;

                      if (matchesId || matchesCombo) {
                        return {
                          ...res,
                          status: "reviewed",
                          pointsReleased: true,
                          adjustedCorrectCount: adjustedCount,
                          adjustedScorePercentage: Math.round((adjustedCount / res.totalQuestions) * 100),
                          teacherFeedback: feedbackText,
                          reviewedAt: new Date().toISOString(),
                          reviewedBy: "Teacher"
                        };
                      }
                      return res;
                    });

                    localStorage.setItem("local_results", JSON.stringify(updated));
                    setResults(updated);
                    
                    // Recalculate metrics
                    if (updated.length > 0) {
                      const total = updated.length;
                      const sumScores = updated.reduce((acc: number, r: any) => {
                        const pct = r.adjustedScorePercentage !== undefined ? r.adjustedScorePercentage : r.scorePercentage;
                        return acc + (pct || 0);
                      }, 0);
                      const avg = Math.round(sumScores / total);
                      const passed = updated.filter((r: any) => {
                        const pct = r.adjustedScorePercentage !== undefined ? r.adjustedScorePercentage : r.scorePercentage;
                        return (pct || 0) >= 50;
                      }).length;
                      const passRate = Math.round((passed / total) * 100);
                      
                      const ranges = [
                        { range: "0-20", count: 0 },
                        { range: "21-40", count: 0 },
                        { range: "41-60", count: 0 },
                        { range: "61-80", count: 0 },
                        { range: "81-100", count: 0 },
                      ];
                      updated.forEach((r: any) => {
                        const pct = r.adjustedScorePercentage !== undefined ? r.adjustedScorePercentage : r.scorePercentage;
                        const s = pct || 0;
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
                        violationRate: analytics?.violationRate || 0,
                        scoreDistribution: ranges
                      });
                    }

                    toast.success(`Marks & Feedback published successfully for ${selectedSub.studentName}!`);
                    setShowReviewDialog(false);
                    setSelectedSub(null);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-indigo-600/30 gap-1.5 uppercase tracking-wider text-xs"
                >
                  <PenTool className="h-4 w-4" />
                  Publish & Send Points
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

