import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  ArrowRight,
  Plus,
  Users,
  ShieldAlert,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { StatCard } from "@/components/ui/StatCard";
import { ExamSummaryCard } from "@/components/ui/ExamSummaryCard";
import { ResultCard } from "@/components/ui/ResultCard";

import { StatItem } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  let localExams: any[] = [];
  let localResults: any[] = [];
  try {
    const examsRaw = localStorage.getItem("local_exams");
    if (examsRaw) {
      const parsed = JSON.parse(examsRaw);
      localExams = (Array.isArray(parsed) ? parsed : []).filter((e: any) => e && typeof e === "object");
    }
  } catch (err) {
    console.error("Failed to parse local_exams:", err);
  }

  try {
    const resultsRaw = localStorage.getItem("local_results");
    if (resultsRaw) {
      const parsed = JSON.parse(resultsRaw);
      localResults = (Array.isArray(parsed) ? parsed : []).filter((r: any) => r && typeof r === "object");
    }
  } catch (err) {
    console.error("Failed to parse local_results:", err);
  }

  const myResults = localResults.filter((r: any) => r && r.studentName === user?.name);

  // Aggregated analytics for teachers
  const totalSubmissions = localResults.length;
  const avgClassScore = totalSubmissions > 0 
    ? Math.round(localResults.reduce((acc: number, r: any) => acc + (r.scorePercentage || 0), 0) / totalSubmissions) 
    : 76;

  const allExams = [
    { id: "mock-exam-1", title: "General Science Assessment", duration: "60 mins", startTime: new Date().toISOString(), status: "ongoing", questions: 30, grade: "8", subject: "General science" },
    { id: "mock-exam-2", title: "Amharic Vocabulary Quiz", duration: "30 mins", startTime: new Date(Date.now() + 86400000).toISOString(), status: "upcoming", questions: 25, grade: "10", subject: "Amharic" },
    { id: "mock-exam-3", title: "Grade 9 Mathematics Test", duration: "45 mins", startTime: new Date().toISOString(), status: "ongoing", questions: 20, grade: "9", subject: "Mathematics" },
    { id: "mock-exam-4", title: "Grade 7 English Quiz", duration: "20 mins", startTime: new Date(Date.now() + 3600000).toISOString(), status: "upcoming", questions: 15, grade: "7", subject: "English" },
  ] as const;

  const examsToShow = [...allExams, ...localExams.map((e: any) => ({
    id: e._id,
    title: e.title,
    duration: e.duration + " mins",
    startTime: e.createdAt,
    status: e.status,
    questions: e.questions?.length || 0,
    grade: e.grade,
    subject: e.subject
  }))];
  
  const studentStats: StatItem[] = [
    { 
      title: "Exams Taken", 
      value: myResults.length.toString(), 
      icon: <CheckCircle2 className="h-4 w-4" /> 
    },
    { 
      title: "Avg. Score", 
      value: myResults.length > 0 
        ? Math.round(myResults.reduce((acc: number, r: any) => acc + (r.scorePercentage || 0), 0) / myResults.length) + "%"
        : "0%", 
      icon: <Trophy className="h-4 w-4" /> 
    },
    { 
      title: "Best Performance", 
      value: myResults.length > 0 
        ? Math.max(...myResults.map((r: any) => r.scorePercentage || 0)) + "%"
        : "N/A", 
      icon: <BookOpen className="h-4 w-4" /> 
    },
    { title: "Upcoming", value: examsToShow.filter((e: any) => e.grade === user?.grade && e.status === "upcoming").length.toString(), icon: <Clock className="h-4 w-4" /> },
  ];

  const teacherStats: StatItem[] = [
    { title: "Active Exams", value: localExams.length.toString(), icon: <BookOpen className="h-4 w-4" /> },
    { title: "Total Submissions", value: localResults.length.toString(), icon: <Users className="h-4 w-4" /> },
    { title: "Security Flags", value: localResults.reduce((acc: number, r: any) => acc + (r.violations?.length || 0), 0).toString(), icon: <ShieldAlert className="h-4 w-4 text-red-500" /> },
    { 
      title: "Class Performance", 
      value: avgClassScore + "%", 
      icon: <Trophy className="h-4 w-4" /> 
    },
  ];

  const adminStats: StatItem[] = [
    { title: "Total Users", value: (localStorage.getItem("user_count") ? parseInt(localStorage.getItem("user_count")!) : 1).toString(), icon: <Users className="h-4 w-4" /> },
    { title: "Global Exams", value: (localExams.length + 4).toString(), icon: <Activity className="h-4 w-4" /> },
    { title: "Security Flags", value: localResults.reduce((acc: number, r: any) => acc + (r.violations?.length || 0), 0).toString(), icon: <ShieldAlert className="h-4 w-4 text-red-500" /> },
    { title: "System Nodes", value: "Operational", icon: <ShieldAlert className="h-4 w-4" /> },
  ];

  const recentExams = user?.role === "student" && user.grade 
    ? examsToShow.filter(exam => exam.grade === user.grade)
    : examsToShow;

  const mappedMyResults = myResults.map((r: any) => ({
    examTitle: r.examTitle || `Exam ${r.examId}`,
    score: r.correctCount,
    total: r.totalQuestions,
    date: (r.submittedAt && typeof r.submittedAt === "string") ? r.submittedAt.split("T")[0] : new Date().toISOString().split("T")[0],
    duration: "60 mins", 
    performance: (r.scorePercentage || 0) >= 80 ? "excellent" : (r.scorePercentage || 0) >= 50 ? "good" : "average"
  }));

  const globalResults = localResults.sort((a: any, b: any) => {
    const timeA = (a && a.submittedAt) ? new Date(a.submittedAt).getTime() : 0;
    const timeB = (b && b.submittedAt) ? new Date(b.submittedAt).getTime() : 0;
    return timeB - timeA;
  }).slice(0, 3).map((r: any) => ({
    examTitle: r.examTitle || `Exam ${r.examId}`,
    studentName: r.studentName || "N/A",
    score: r.correctCount,
    total: r.totalQuestions,
    date: (r.submittedAt && typeof r.submittedAt === "string") ? r.submittedAt.split("T")[0] : new Date().toISOString().split("T")[0],
    duration: "60 mins",
    performance: (r.scorePercentage || 0) >= 80 ? "excellent" : (r.scorePercentage || 0) >= 50 ? "good" : "average"
  }));

  const recentResults = (user?.role === "teacher" || user?.role === "admin") 
    ? globalResults 
    : (mappedMyResults.length > 0 ? mappedMyResults : [
        { examTitle: "History Quiz", score: 18, total: 20, date: "2024-03-15", duration: "15 mins", performance: "excellent" },
        { examTitle: "Physics Test", score: 72, total: 100, date: "2024-03-10", duration: "45 mins", performance: "good" },
      ]);

  const resultsTitle = (user?.role === "teacher" || user?.role === "admin")
    ? "Recent Student Submissions"
    : "Your Latest Results";

  const getStats = () => {
    switch (user?.role) {
      case "teacher": return teacherStats;
      case "admin": return adminStats;
      default: return studentStats;
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      {/* Dynamic Warm Banner with Role context */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 md:p-10 text-white shadow-xl shadow-blue-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-x-12 -translate-y-12 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-bold tracking-wide uppercase">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              {user?.role === "student" && `Student • Grade ${user.grade} ${user.section ? `(${user.section})` : ""}`}
              {user?.role === "teacher" && `Professional Evaluator Tier`}
              {user?.role === "admin" && `System Administrator`}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Welcome back, <span className="text-blue-100">{user?.name}</span>!
            </h1>
            <p className="text-blue-100 font-medium leading-relaxed text-sm md:text-base">
              {user?.role === "student" && "Your academic journey is in progress. Ready to test your comprehension? Choose any of your available subject exams below. Secure proctoring is active."}
              {user?.role === "teacher" && "Manage your class curriculum here. You can author secure exams, monitor student proctor alerts in real-time, and download performance insights."}
              {user?.role === "admin" && "Monitor overall platform integrity. Review global security status codes, explore active sessions, and oversee account nodes."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {user?.role === "teacher" && (
              <Button className="bg-white hover:bg-slate-50 text-indigo-700 gap-2 rounded-2xl h-14 px-8 font-black text-sm shadow-md transition-all active:scale-[0.98]" onClick={() => navigate("/teacher")}>
                <Plus className="h-5 w-5" />
                Create New Exam
              </Button>
            )}
            {user?.role === "admin" && (
              <Button className="bg-white hover:bg-slate-50 text-blue-700 gap-2 rounded-2xl h-14 px-8 font-black text-sm shadow-md transition-all active:scale-[0.98]" onClick={() => navigate("/admin")}>
                Admin Controller Panel
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
            {user?.role === "student" && (
              <Button className="bg-white hover:bg-slate-50 text-blue-700 gap-2 rounded-2xl h-14 px-8 font-black text-sm shadow-md transition-all active:scale-[0.98]" onClick={() => navigate("/exams")}>
                Browse Subject Exams
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} description={stat.description} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent & Upcoming Exams</h2>
            <Link to="/exams" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentExams.map((exam: any) => (
              <ExamSummaryCard 
                key={exam.id} 
                exam={{
                  id: exam.id,
                  title: exam.title,
                  duration: exam.duration,
                  startTime: exam.startTime,
                  status: exam.status,
                  questions: exam.questions,
                  grade: exam.grade,
                  subject: exam.subject
                }} 
                onClick={(id) => navigate(`/exam/${id}`)}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{resultsTitle}</h2>
            <Link to="/results" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentResults.map((result: any, i) => (
              <ResultCard key={i} result={{
                examTitle: result.examTitle,
                score: result.score,
                total: result.total,
                date: result.date,
                duration: result.duration,
                performance: result.performance
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

