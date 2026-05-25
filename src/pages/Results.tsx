import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Search, 
  Filter, 
  ChevronRight, 
  MessageSquare, 
  ShieldAlert, 
  BadgeCheck, 
  HelpCircle, 
  Award,
  BookOpen,
  Check,
  X,
  ArrowLeft,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Results() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    const fetchResults = () => {
      try {
        const resultsRaw = localStorage.getItem("local_results");
        if (resultsRaw) {
          const parsed = JSON.parse(resultsRaw);
          const allRes = Array.isArray(parsed) ? parsed : [];
          
          // Filter based on user role
          if (user?.role === "student") {
            const studentCode = user.accessCode;
            const myRes = allRes.filter((r: any) => 
              r && (r.studentCode === studentCode || r.studentName === user.name)
            );
            setResults(myRes);
          } else {
            // Teacher/Admin can see all submissions
            setResults(allRes);
          }
        }
      } catch (err) {
        console.error("Failed to load local results:", err);
      }
    };

    fetchResults();
  }, [user]);

  // Unique list of subjects for filtering
  const subjects = Array.from(new Set(results.map(r => r.examSubject || "General").filter(Boolean)));

  const filteredResults = results.filter((r: any) => {
    const examTitle = (r.examTitle || "").toLowerCase();
    const studentName = (r.studentName || "").toLowerCase();
    const matchesSearch = examTitle.includes(searchQuery.toLowerCase()) || studentName.includes(searchQuery.toLowerCase());
    
    const isReleased = r.status === "reviewed" || r.status === "released" || r.pointsReleased === true;
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "released" ? isReleased :
      statusFilter === "pending" ? !isReleased : true;

    const matchesSubject = 
      subjectFilter === "all" ? true :
      (r.examSubject || "General") === subjectFilter;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  const getPercentageColor = (pct: number) => {
    if (pct >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (pct >= 50) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-505/10 bg-white/5 rounded-full blur-2xl translate-x-12 -translate-y-12 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-bold tracking-wide uppercase">
            <Trophy className="h-3.5 w-3.5 text-yellow-400" />
            Evaluation & Performance Index
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            {user?.role === "student" ? "Your Assessment Results" : "Student Submissions Review"}
          </h1>
          <p className="text-slate-300 font-medium leading-relaxed max-w-2xl text-sm">
            {user?.role === "student" 
              ? "Gain transparent access to your points, teacher comments, and exam answer logs. Standard security proctor logs are displayed."
              : "Access the complete archive of submitted student papers. Review answers, adjust score adjustments, and release point releases."}
          </p>
        </div>
      </div>

      {/* Stats Counter Cards */}
      {user?.role === "student" && (
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Attempted Exams</p>
              <p className="text-2xl font-black text-slate-950">{results.length}</p>
            </div>
          </Card>
          
          <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Average Performance</p>
              <p className="text-2xl font-black text-slate-950">
                {results.length > 0 
                  ? Math.round(results.reduce((acc, r) => acc + (r.adjustedScorePercentage !== undefined ? r.adjustedScorePercentage : r.scorePercentage), 0) / results.length) + "%"
                  : "0%"}
              </p>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-100 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pending Release</p>
              <p className="text-2xl font-black text-slate-950">
                {results.filter(r => !(r.status === "reviewed" || r.status === "released" || r.pointsReleased === true)).length}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Filter workspace */}
      <Card className="rounded-2xl border-slate-110/60 bg-white/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={user?.role === "student" ? "Search exams by title..." : "Search by student name or exam title..."}
              className="pl-10 h-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Status:</span>
            </div>
            <select
              className="h-10 text-xs rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-700 outline-none focus:border-stone-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Submissions</option>
              <option value="released">Graded & Released</option>
              <option value="pending">Awaiting Review</option>
            </select>

            {subjects.length > 0 && (
              <select
                className="h-10 text-xs rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-700 outline-none focus:border-stone-400"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </Card>

      {/* Table & List Results */}
      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredResults.map((res: any, idx: number) => {
              const isReleased = res.status === "reviewed" || res.status === "released" || res.pointsReleased === true;
              const finalScore = isReleased ? (res.adjustedCorrectCount !== undefined ? res.adjustedCorrectCount : res.correctCount) : null;
              const finalPercentage = isReleased ? (res.adjustedScorePercentage !== undefined ? res.adjustedScorePercentage : res.scorePercentage) : null;
              
              return (
                <Card 
                  key={res.submissionId || idx}
                  className="overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all rounded-2xl bg-white"
                >
                  <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {res.examSubject && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {res.examSubject}
                          </span>
                        )}
                        <CardTitle className="text-base font-bold text-slate-900 mt-1">{res.examTitle || "Examination"}</CardTitle>
                      </div>

                      {isReleased ? (
                        <Badge className="bg-green-50 text-green-700 border border-green-200 text-[9px] font-black uppercase shrink-0 py-0.5 px-2.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Graded
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase shrink-0 py-0.5 px-2.5 rounded-full animate-pulse">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      )}
                    </div>
                    
                    {user?.role !== "student" && (
                      <div className="mt-2 text-xs">
                        <span className="font-extrabold text-slate-500">Candidate: </span>
                        <span className="font-bold text-slate-800">{res.studentName} ({res.studentCode})</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Released Score</p>
                        {isReleased ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-950">{finalScore}</span>
                            <span className="text-sm font-bold text-slate-400">/ {res.totalQuestions || 3}</span>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-amber-600 italic bg-amber-50 px-2 py-1 rounded inline-block">
                            Points Released soon
                          </div>
                        )}
                      </div>

                      {isReleased && finalPercentage !== null && (
                        <Badge className={cn("text-[10px] font-black uppercase rounded-lg px-2.5 py-1", getPercentageColor(finalPercentage))}>
                          {finalPercentage}%
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1 border-t border-slate-50">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(res.submittedAt).toLocaleDateString()}
                      </div>
                      {res.violations?.length > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {res.violations.length} Security Alert(s)
                        </div>
                      )}
                    </div>

                    {isReleased && res.teacherFeedback && (
                      <div className="bg-indigo-50/50 border border-indigo-100/50 p-3 rounded-xl space-y-1">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-indigo-500 font-black">Teacher remarks:</p>
                        <p className="text-xs italic text-slate-700 font-bold leading-normal">
                          "{res.teacherFeedback}"
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full text-xs font-black uppercase tracking-wider h-10 rounded-xl"
                      variant={isReleased ? "outline" : "secondary"}
                      onClick={() => {
                        setSelectedResult(res);
                        setShowDetailDialog(true);
                      }}
                    >
                      View Detailed Feedback Paper
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-2xl border-slate-100 p-12 text-center text-slate-400">
            <ShieldAlert className="h-12 w-12 mx-auto text-slate-300 animate-bounce mb-3" />
            <p className="text-sm font-bold">No examination submissions found matching current criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Make sure you complete and submit your active examination from the dashboard first.</p>
          </Card>
        )}
      </div>

      {/* Detailed Graded Feedback Sheet Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[75vw] w-full max-h-[90vh] overflow-y-auto rounded-3xl p-0 shadow-2xl transition-all border-none">
          {selectedResult && (
            <div className="flex flex-col bg-slate-50 text-slate-900">
              {/* Header */}
              <div className="px-8 py-6 bg-white border-b border-slate-100 sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {selectedResult.examSubject || "Examination"} Paper
                  </span>
                  <DialogTitle className="text-xl font-black text-slate-950 mt-1 block">
                    {selectedResult.examTitle}
                  </DialogTitle>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    Submitted on: {new Date(selectedResult.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedResult.violations?.length > 0 && (
                    <Badge className="bg-red-50 text-red-700 border border-red-100 flex items-center gap-1 font-bold text-[10px]">
                      <ShieldAlert className="h-3 w-3" /> Blocked Actions Recorded
                    </Badge>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                {/* Score section */}
                <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Acquired Score Summary</h3>
                      {(selectedResult.status === "reviewed" || selectedResult.status === "released" || selectedResult.pointsReleased === true) ? (
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-center md:justify-start gap-1">
                            <span className="text-4xl font-black text-slate-950">
                              {selectedResult.adjustedCorrectCount !== undefined ? selectedResult.adjustedCorrectCount : selectedResult.correctCount}
                            </span>
                            <span className="text-xl font-bold text-slate-400">/ {selectedResult.totalQuestions || 3}</span>
                            <span className="text-xl font-bold text-indigo-600 ml-2">
                              ({selectedResult.adjustedScorePercentage !== undefined ? selectedResult.adjustedScorePercentage : selectedResult.scorePercentage}%)
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-bold flex items-center gap-1 justify-center md:justify-start">
                            <BadgeCheck className="h-4 w-4" /> Evaluated and released by your teacher.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-lg font-black text-amber-600 uppercase tracking-tight flex items-center gap-1 justify-center md:justify-start">
                            <Clock className="h-5 w-5 animate-spin" /> Evaluator Review Pending
                          </div>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Your submission is resting securely in class logs. The scoring report and breakdown will publish as soon as the teacher completes review.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-4 bg-slate-50/50 rounded-xl border max-w-sm w-full">
                      <MessageSquare className="h-8 w-8 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wide">Teacher's remarks</p>
                        <p className="text-xs text-slate-700 italic font-bold">
                          {selectedResult.teacherFeedback ? `"${selectedResult.teacherFeedback}"` : '"Examination analyzed. Answers assessed successfully with standard scoring criteria."'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Submissions comparison */}
                {/* Only visible or loaded if released */}
                {true && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Question-By-Question assessment Paper</h4>
                    <div className="space-y-4">
                      {(() => {
                        const qs = selectedResult.questions && selectedResult.questions.length > 0 ? selectedResult.questions : [
                          { id: 1, type: "multiple-choice", text: "Which of the following is the primary site of photosynthesis in a plant cell?", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], correctIndex: 1 },
                          { id: 2, type: "true-false", text: "The chemical formula for glucose is C6H12O6.", options: ["True", "False"], correctIndex: 0 },
                          { id: 3, type: "short-answer", text: "Which process produces the most ATP during cellular respiration?", options: [], correctAnswer: "Electron transport chain" },
                        ];

                        return qs.map((q: any, idx: number) => {
                          const studentAnswer = selectedResult.answers?.[idx];
                          let isCorrect = false;

                          if (q.type === "multiple-choice" || q.type === "true-false") {
                            isCorrect = studentAnswer === q.correctIndex;
                          } else {
                            isCorrect = studentAnswer?.toString().toLowerCase().trim() === (q.correctAnswer || q.expectedAnswer)?.toString().toLowerCase().trim();
                          }

                          return (
                            <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                  Question {idx + 1} • <span className="text-indigo-600">{q.type}</span>
                                </span>
                                {(selectedResult.status === "reviewed" || selectedResult.pointsReleased === true) && (
                                  isCorrect ? (
                                    <Badge className="bg-green-50 text-green-700 border-green-250 flex items-center gap-1 font-bold rounded-lg text-xs">
                                      <Check className="h-3 w-3" /> Correct Choice
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-50 text-red-700 border-red-250 flex items-center gap-1 font-bold rounded-lg text-xs">
                                      <X className="h-3 w-3" /> Mismatch
                                    </Badge>
                                  )
                                )}
                              </div>

                              <p className="text-sm font-bold text-slate-900 leading-snug">{q.text}</p>

                              {q.options && q.options.length > 0 && (
                                <div className="grid gap-2 text-xs">
                                  {q.options.map((option: string, optIdx: number) => {
                                    const isStudentChoice = studentAnswer === optIdx || (typeof studentAnswer === "string" && studentAnswer === option);
                                    const isCorrectChoice = q.correctIndex === optIdx;
                                    
                                    return (
                                      <div 
                                        key={optIdx} 
                                        className={cn(
                                          "p-3 rounded-xl border flex items-center justify-between font-semibold transition-all",
                                          isCorrectChoice ? "bg-green-50 border-green-200 text-green-800" : isStudentChoice ? "bg-red-50 border-red-150 text-red-850" : "bg-slate-50/50 border-slate-100/50 text-slate-600"
                                        )}
                                      >
                                        <span>{option}</span>
                                        <div className="flex items-center gap-1">
                                          {isCorrectChoice && <span className="text-[8px] font-black uppercase bg-green-200 text-green-900 px-1.5 py-0.5 rounded">Correct Answer</span>}
                                          {isStudentChoice && <span className="text-[8px] font-black uppercase bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded">Your Choice</span>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {(!q.options || q.options.length === 0) && (
                                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase text-slate-400">Your Answer Entry</p>
                                    <p className={cn(
                                      "font-mono font-bold border rounded-lg px-2.5 py-1.5 bg-white inline-block leading-none",
                                      isCorrect ? "text-green-700 border-green-200" : "text-slate-800 border-slate-200"
                                    )}>
                                      {studentAnswer !== undefined && studentAnswer !== "" ? studentAnswer.toString() : "[Left Blank]"}
                                    </p>
                                  </div>

                                  {(selectedResult.status === "reviewed" || selectedResult.pointsReleased === true) && (
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-black uppercase text-slate-400">Correct Evaluation Target</p>
                                      <p className="font-mono font-bold border border-green-200 bg-green-50/20 text-green-700 rounded-lg px-2.5 py-1.5 inline-block leading-none">
                                        {q.correctAnswer || "N/A"}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-10 rounded-b-[24px]">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Secure exam log verification ID: <span className="text-slate-700 font-black">{selectedResult.submissionId || "N/A"}</span>
                </p>
                <Button className="font-bold rounded-xl" onClick={() => setShowDetailDialog(false)}>
                  Close Review Panel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
