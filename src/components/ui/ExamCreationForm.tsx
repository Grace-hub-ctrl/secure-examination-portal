import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { QuestionCard } from "./QuestionCard";

type QuestionType = "multiple-choice" | "true-false" | "short-answer" | "fill-in-the-blank";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctIndex?: number;
  correctAnswer?: string;
}

interface ExamCreationFormProps {
  onSuccess?: () => void;
}

export function ExamCreationForm({ onSuccess }: ExamCreationFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [grade, setGrade] = useState("9");
  const [subject, setSubject] = useState("Mathematics");
  const [sectionsTargetType, setSectionsTargetType] = useState<"all" | "some">("all");
  const [allowedSectionsStr, setAllowedSectionsStr] = useState("Section A");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const grades = ["7", "8", "9", "10", "11", "12"];
  
  const subjectsByGrade: Record<string, string[]> = {
    middle: [
      "Mathematics",
      "English",
      "General science",
      "PVA",
      "CTE",
      "Social science",
      "Afaan Oromoo",
      "Amharic",
      "IT",
      "Citizenship",
      "HPE"
    ],
    high: [
      "Mathematics",
      "English",
      "Biology",
      "Physics",
      "Chemistry",
      "CTE",
      "Geography",
      "History",
      "Afaan Oromoo",
      "Amharic",
      "IT",
      "Citizenship",
      "HPE",
      "Economics"
    ]
  };

  const currentSubjects = (parseInt(grade) <= 8) ? subjectsByGrade.middle : subjectsByGrade.high;

  const handleAddQuestion = (type: QuestionType = "multiple-choice") => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: "",
      options: type === "multiple-choice" ? ["", "", "", ""] : type === "true-false" ? ["True", "False"] : [],
      correctIndex: (type !== "short-answer" && type !== "fill-in-the-blank") ? 0 : undefined,
      correctAnswer: (type === "short-answer" || type === "fill-in-the-blank") ? "" : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSaveExam = async () => {
    if (!title) return toast.error("Please enter an exam title");
    if (questions.length === 0) return toast.error("Please add at least one question");

    setIsSaving(true);
    const allowedSections = sectionsTargetType === "some"
      ? allowedSectionsStr.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    try {
      try {
        await axios.post("/api/exams", {
          title,
          description,
          duration,
          grade,
          subject,
          sectionsTargetType,
          allowedSections,
          questions: questions.map(q => ({
            type: q.type,
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            correctAnswer: q.correctAnswer
          }))
        });
        toast.success("Exam created and published successfully!");
      } catch (apiError) {
        // Fallback to localStorage
        let localExams: any[] = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("local_exams") || "[]");
          localExams = Array.isArray(parsed) ? parsed : [];
        } catch (_) {}
        const newExam = {
          _id: `local-${Date.now()}`,
          title,
          description,
          duration,
          grade,
          subject,
          sectionsTargetType,
          allowedSections,
          questions: questions.map(q => ({
            type: q.type,
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            correctAnswer: q.correctAnswer
          })),
          status: "upcoming",
          createdAt: new Date().toISOString()
        };
        localStorage.setItem("local_exams", JSON.stringify([...localExams, newExam]));
        toast.success("Exam saved locally (Offline Mode)");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save exam. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-10 grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden sticky top-28">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="pb-4 px-4">
            <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Exam Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-6">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-black text-slate-400 uppercase tracking-widest">Exam Title</Label>
              <Input 
                id="title" 
                placeholder="Title..." 
                className="rounded-xl h-10 border-slate-200 focus:ring-primary/20 text-sm font-bold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</Label>
                <select 
                  id="grade"
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  value={grade}
                  onChange={(e) => {
                    const newGrade = e.target.value;
                    setGrade(newGrade);
                    // Update subject if current one is not in the new list
                    const newSubjects = parseInt(newGrade) <= 8 ? subjectsByGrade.middle : subjectsByGrade.high;
                    if (!newSubjects.includes(subject)) {
                      setSubject(newSubjects[0]);
                    }
                  }}
                >
                  {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Eligibility</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    type="button"
                    variant={sectionsTargetType === "all" ? "default" : "outline"}
                    className="text-[10px] font-bold h-8 px-2 rounded-lg"
                    onClick={() => setSectionsTargetType("all")}
                  >
                    All Sections
                  </Button>
                  <Button
                    type="button"
                    variant={sectionsTargetType === "some" ? "default" : "outline"}
                    className="text-[10px] font-bold h-8 px-2 rounded-lg"
                    onClick={() => setSectionsTargetType("some")}
                  >
                    Some Sections
                  </Button>
                </div>
              </div>

              {sectionsTargetType === "some" && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  <Label htmlFor="allowedSections" className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Targeted Sections</Label>
                  <Input
                    id="allowedSections"
                    placeholder="e.g. Section A, Section B"
                    className="h-8 rounded-lg border-slate-200 text-xs font-bold px-2.5"
                    value={allowedSectionsStr}
                    onChange={(e) => setAllowedSectionsStr(e.target.value)}
                  />
                  <p className="text-[9px] text-slate-400 leading-normal italic">
                    Use commas to enter more than one.
                  </p>
                </div>
              )}

              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <Label htmlFor="subject" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</Label>
                <select 
                  id="subject"
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {currentSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (min)</Label>
              <Input 
                id="duration" 
                type="number" 
                className="rounded-xl h-10 border-slate-200 text-sm font-bold"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Scope..." 
                className="min-h-[100px] rounded-xl border-slate-200 resize-none text-xs font-medium"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-10 space-y-8">
        <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm sticky top-28 z-40">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Plus className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Exam Questions</h2>
              <p className="text-sm text-slate-500 font-bold">{questions.length} total questions added</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50"
              onClick={() => handleAddQuestion("multiple-choice")}
            >
              + Multiple Choice
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50"
              onClick={() => handleAddQuestion("true-false")}
            >
              + True/False
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50"
              onClick={() => handleAddQuestion("short-answer")}
            >
              + Short Answer
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-4 text-xs font-bold border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors"
              onClick={() => handleAddQuestion("fill-in-the-blank")}
            >
              + Fill in the Blank
            </Button>
          </div>
        </div>

        <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar pb-40">
          {questions.length === 0 ? (
            <div className="text-center py-40 border-4 border-dashed rounded-[60px] bg-slate-50/50 space-y-8 border-slate-100 w-full">
              <div className="p-12 bg-white rounded-[40px] shadow-2xl shadow-slate-200/40 inline-block border border-slate-50">
                <AlertCircle className="h-20 w-20 text-slate-200" />
              </div>
              <div className="space-y-4">
                <p className="font-black text-slate-900 text-5xl tracking-tighter uppercase px-4">Start Your Exam</p>
                <p className="text-2xl text-slate-400 font-medium px-12 max-w-2xl mx-auto">Click one of the buttons above to begin adding questions to your examination.</p>
              </div>
            </div>
          ) : (
            questions.map((q: any, idx) => (
              <QuestionCard 
                key={q.id} 
                question={q} 
                index={idx} 
                onDelete={handleDeleteQuestion}
                onUpdate={(updates) => handleUpdateQuestion(q.id, updates)}
              />
            ))
          )}
        </div>

        {questions.length > 0 && (
          <div className="flex justify-end pt-8 border-t sticky bottom-0 bg-white/95 backdrop-blur-md pb-4 px-4 z-40">
            <Button 
              size="lg" 
              className="px-12 h-16 rounded-[24px] font-black text-xl shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white border-none"
              onClick={handleSaveExam}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save & Publish Exam"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
