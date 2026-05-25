import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, ShieldAlert, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ExamTimer } from "@/components/ui/ExamTimer";
import { ExamProgress } from "@/components/ui/ExamProgress";
import { AntiCheatingMonitor } from "@/components/ui/AntiCheatingMonitor";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  type: string;
  text: string;
  options: string[];
}

export default function ExamInterface() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [exam, setExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [escapePressCount, setEscapePressCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(() => {
    return localStorage.getItem(`blocked_exam_${id}_${user?.accessCode}`) === "true";
  });
  const [blockReason, setBlockReason] = useState(() => {
    return localStorage.getItem(`blocked_reason_${id}_${user?.accessCode}`) || "Security violation detected (secure screen exit).";
  });

  useEffect(() => {
    const fetchExam = async () => {
      setIsLoading(true);
      try {
        // First check localStorage for local exams
        let localExams: any[] = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("local_exams") || "[]");
          localExams = Array.isArray(parsed) ? parsed : [];
        } catch (_) {}
        const foundLocal = localExams.find((e: any) => e._id === id);
        
        if (foundLocal) {
          setExam(foundLocal);
          setIsLoading(false);
          return;
        }

        // Simulate API fetch
        const mockExams: Record<string, any> = {
          "mock-exam-1": { title: "Grade 8 General Science Quiz", grade: "8", duration: 60, questions: new Array(20) },
          "mock-exam-2": { title: "Grade 12 Mathematics Final", grade: "12", duration: 90, questions: new Array(15) },
          "mock-exam-3": { title: "Grade 10 Biology Introduction", grade: "10", duration: 120, questions: new Array(30) },
          "mock-exam-4": { title: "Grade 7 Afaan Oromoo Test", grade: "7", duration: 45, questions: new Array(25) },
        };
        
        const examData = mockExams[id || ""] || { title: "Exam Environment", grade: "9", duration: 60, questions: new Array(10) };
        setExam(examData);
      } catch (error) {
        toast.error("Failed to load exam data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const isGradeMismatch = user?.role === "student" && exam && user.grade !== exam.grade;

  useEffect(() => {
    if (!isExamStarted || isBlocked) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isExamStarted && !isSubmitting && !isBlocked) {
        handleViolation("Fullscreen Exit Detected");
        handleBlock("Exited secure fullscreen environment (Escape key or minimize attempt)");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isExamStarted && !isSubmitting && !isBlocked) {
        handleViolation("Tab Switching Detected");
        handleBlock("Tab Switch / Window minimized: User left the active exam tab");
      }
    };

    const handleBlur = () => {
      if (isExamStarted && !isSubmitting && !isBlocked) {
        handleViolation("Lost Window Focus");
        handleBlock("Lost focus: Switched windows, opened an application, or Alt-Tabbed");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation("Right Click Attempted");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isExamStarted, isBlocked, isSubmitting, id]);

  const handleBlock = (reason: string = "Security violation detected (secure screen exit).") => {
    setIsBlocked(true);
    setBlockReason(reason);
    localStorage.setItem(`blocked_exam_${id}_${user?.accessCode}`, "true");
    localStorage.setItem(`blocked_reason_${id}_${user?.accessCode}`, reason);
    
    // Also track globally so teacher can see
    let globalBlocks: any[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("global_blocks") || "[]");
      globalBlocks = Array.isArray(parsed) ? parsed : [];
    } catch (_) {}
    const newBlock = {
      id: `block-${Date.now()}`,
      studentName: user?.name,
      studentCode: user?.accessCode,
      examId: id,
      examTitle: exam?.title || "Examination",
      timestamp: new Date().toISOString(),
      grade: user?.grade,
      section: user?.section,
      reason: reason
    };
    localStorage.setItem("global_blocks", JSON.stringify([newBlock, ...globalBlocks]));

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    toast.error("ACCESS BLOCKED", {
      description: `Reason: ${reason}`,
      duration: 10000,
    });
  };

  const displayQuestions = (exam?.questions && exam.questions.length > 0 && exam.questions[0]?.text) ? exam.questions : [
    {
      id: 1,
      type: "multiple-choice",
      text: "Which of the following is the primary site of photosynthesis in a plant cell?",
      options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
    },
    {
      id: 2,
      type: "true-false",
      text: "The chemical formula for glucose is C6H12O6.",
      options: ["True", "False"],
    },
    {
      id: 3,
      type: "short-answer",
      text: "Which process produces the most ATP during cellular respiration?",
      options: [],
    },
  ];

  const handleAnswer = (value: number | string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleViolation = (type: string) => {
    if (!isExamStarted) return;
    setViolations((prev) => {
      const next = [...prev, type];
      let liveViolations: any[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem("local_live_violations") || "[]");
        liveViolations = Array.isArray(parsed) ? parsed : [];
      } catch (_) {}
      const newLiveViolation = {
        id: `live-${Date.now()}-${Math.random()}`,
        studentName: user?.name,
        studentCode: user?.accessCode,
        examId: id,
        type,
        timestamp: new Date().toISOString(),
        grade: user?.grade,
        section: user?.section
      };
      localStorage.setItem("local_live_violations", JSON.stringify([newLiveViolation, ...liveViolations]));
      return next;
    });
    toast.error(`Violation Detected: ${type}`, {
      description: "This event has been logged for invigilator review.",
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      // Calculate Score
      let correctCount = 0;
      displayQuestions.forEach((q: any, idx: number) => {
        const userAnswer = answers[idx];
        if (q.type === "multiple-choice" || q.type === "true-false") {
          if (userAnswer === q.correctIndex) correctCount++;
        } else {
          // Short answer check (case insensitive)
          if (userAnswer?.toString().toLowerCase().trim() === q.correctAnswer?.toString().toLowerCase().trim()) {
            correctCount++;
          }
        }
      });

      const scorePercentage = Math.round((correctCount / displayQuestions.length) * 100);

      // Simulate API call with user tracking info
      const submissionData = {
        examId: id,
        examTitle: exam?.title || "Exam",
        studentName: user?.name,
        studentCode: user?.accessCode,
        grade: user?.grade,
        section: user?.section,
        answers,
        violations,
        correctCount,
        totalQuestions: displayQuestions.length,
        scorePercentage,
        submittedAt: new Date().toISOString()
      };
      
      console.log("Submitting exam data:", submissionData);
      
      // Store result locally for the teacher to see in this demo environment
      let localResults: any[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem("local_results") || "[]");
        localResults = Array.isArray(parsed) ? parsed : [];
      } catch (_) {}
      localStorage.setItem("local_results", JSON.stringify([...localResults, submissionData]));

      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Exam submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startExam = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsExamStarted(true);
    } catch (err) {
      toast.error("Please enable fullscreen to start the exam.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isGradeMismatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <Card className="max-w-md w-full text-center p-10 space-y-8 rounded-3xl border-none shadow-2xl">
          <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Grade Mismatch</CardTitle>
            <p className="text-slate-500 font-medium px-4">
              This examination is restricted to <span className="font-bold text-primary">Grade {exam.grade}</span>. 
              As a Grade {user?.grade} student, you are not permitted to access this content.
            </p>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" 
            onClick={() => navigate("/exams")}
          >
            Find Grade {user?.grade} Exams
          </Button>
        </Card>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-950 text-white p-4 font-sans">
        <Card className="max-w-md w-full bg-red-900 border-red-800 text-center p-8 space-y-6 shadow-2xl">
          <ShieldAlert className="h-20 w-20 text-white mx-auto animate-pulse" />
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter">Access Suspended</CardTitle>
            <p className="text-red-100 text-sm font-medium leading-relaxed">
              Your session has been locked because you exited the active test environment before completing your submission.
            </p>
          </div>
          <div className="bg-red-950/50 p-4 rounded-xl text-left space-y-2.5 border border-red-800">
            <h3 className="text-xs font-black text-red-200 uppercase tracking-widest">Trigger Action:</h3>
            <p className="text-xs font-bold text-red-300 leading-normal">
              {blockReason}
            </p>
          </div>
          <div className="p-4 bg-red-950/20 rounded-xl text-left border border-red-900 text-[11px] text-red-200/90 leading-relaxed space-y-1">
            <p className="font-bold">How to Re-Enter:</p>
            <p>
              Please contact the exam administrator or your teacher immediately. Instructors can use their dashboard to <strong>Restore Access</strong>, which will automatically unlock this screen and allow you to finish.
            </p>
          </div>
          <Button 
            variant="secondary" 
            className="w-full h-12 text-base font-bold bg-white text-red-900 hover:bg-red-50 rounded-xl shadow-lg" 
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!isExamStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700 text-center p-8 space-y-6">
          <Shield className="h-16 w-16 text-primary mx-auto" />
          <div className="space-y-2">
            <CardTitle className="text-2xl text-white">Secure Exam Mode</CardTitle>
            <p className="text-slate-400">
              To ensure a fair testing environment, this exam requires full-screen mode. 
              Tab switching and shortcuts are disabled.
            </p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl text-left space-y-3 border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Rules:</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full" />
                Do not exit fullscreen mode.
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full" />
                Do not switch tabs or windows.
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full" />
                Right-click and shortcuts are disabled.
              </li>
            </ul>
          </div>
          <Button className="w-full h-12 text-lg font-bold" onClick={startExam}>
            Enter Secure Mode & Start
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation / Status Bar */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 leading-none mb-1">{exam?.title || "Examination"}</h1>
              <span className="text-xs text-slate-500 font-medium">Exam ID: {id}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ExamTimer 
              durationMinutes={60} 
              onTimeUp={handleSubmit}
              onWarning={(seconds) => {
                if (seconds === 300) toast.warning("5 minutes remaining!");
                if (seconds === 60) toast.error("1 minute remaining! Auto-submitting soon.");
              }}
            />
            <Button 
              size="lg" 
              className="px-8 font-bold" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Finish Exam"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Progress & Security */}
        <aside className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Exam Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ExamProgress 
                current={currentQuestion} 
                total={displayQuestions.length} 
                answered={Object.keys(answers).map(Number)} 
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Security Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AntiCheatingMonitor onViolation={handleViolation} silent={true} />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content: Question Display */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            <CardHeader className="border-b bg-slate-50/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full">
                  Question {currentQuestion + 1} of {displayQuestions.length}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <AlertCircle className="h-4 w-4" />
                  {displayQuestions[currentQuestion].type === "multiple-choice" && "Multiple Choice"}
                  {displayQuestions[currentQuestion].type === "true-false" && "True / False"}
                  {displayQuestions[currentQuestion].type === "short-answer" && "Short Answer"}
                  {displayQuestions[currentQuestion].type === "fill-in-the-blank" && "Fill In The Blank"}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                {displayQuestions[currentQuestion].text}
              </h2>
            </CardHeader>
            
            <CardContent className="p-8 flex-1">
              {displayQuestions[currentQuestion].type === "fill-in-the-blank" ? (
                <div className="space-y-4">
                  <Label className="text-sm font-black text-slate-500 uppercase tracking-widest">Fill In The Blank Space:</Label>
                  <Input 
                    className="h-16 rounded-2xl border-2 border-slate-100 focus:border-primary px-6 text-xl font-bold uppercase-none shadow-sm"
                    placeholder="Type the exact word or phrase..."
                    value={answers[currentQuestion] as string || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 font-medium italic">
                    Note: Your entry should naturally complete the sentence. Case-insensitive matching applies.
                  </p>
                </div>
              ) : displayQuestions[currentQuestion].type === "short-answer" ? (
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Answer</Label>
                  <Textarea 
                    className="min-h-[200px] rounded-2xl border-2 border-slate-100 focus:border-primary p-6 text-lg font-medium resize-none"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion] as string || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid gap-4">
                  {displayQuestions[currentQuestion].options.map((option: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={cn(
                        "flex items-center justify-between p-6 rounded-2xl border-2 text-left transition-all group",
                        answers[currentQuestion] === idx
                          ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors",
                          answers[currentQuestion] === idx
                            ? "border-primary bg-primary text-white"
                            : "border-slate-200 text-slate-400 group-hover:border-slate-300"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={cn(
                          "font-bold transition-colors",
                          answers[currentQuestion] === idx ? "text-slate-900" : "text-slate-600"
                        )}>
                          {option}
                        </span>
                      </div>
                      {answers[currentQuestion] === idx && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="p-8 border-t bg-slate-50/50 flex items-center justify-between">
              <Button
                variant="outline"
                size="lg"
                className="px-8 font-bold"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {displayQuestions.map((_: any, idx: number) => (
                  <div 
                    key={idx}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      idx === currentQuestion ? "w-8 bg-primary" : 
                      answers[idx] !== undefined ? "bg-green-500" : "bg-slate-300"
                    )}
                  />
                ))}
              </div>

              {currentQuestion === displayQuestions.length - 1 ? (
                <Button 
                  size="lg" 
                  className="px-12 font-bold" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Exam"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="px-8 font-bold"
                  onClick={() => setCurrentQuestion((prev) => Math.min(displayQuestions.length - 1, prev + 1))}
                >
                  Next Question
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

