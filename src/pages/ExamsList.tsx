import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExamSummaryCard } from "@/components/ui/ExamSummaryCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { toast } from "sonner";

export default function ExamsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState(user?.role === "student" ? (user.grade || "all") : "all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const isStudent = user?.role === "student";

  const grades = ["7", "8", "9", "10", "11", "12"];
  const subjects = [
    "Mathematics", "English", "General science", "PVA", "CTE", 
    "Social science", "Afaan Oromoo", "Amharic", "IT", "Citizenship", "HPE",
    "Biology", "Physics", "Chemistry", "Geography", "History", "Economics"
  ];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("/api/exams");
        let localExams: any[] = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("local_exams") || "[]");
          localExams = Array.isArray(parsed) ? parsed : [];
        } catch (_) {}
        setExams([...localExams, ...response.data]);
      } catch (error) {
        // Fallback to mock exams if database is not connected
        let localExams: any[] = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("local_exams") || "[]");
          localExams = Array.isArray(parsed) ? parsed : [];
        } catch (_) {}
        const mockExams = [
          {
            _id: "mock-exam-1",
            title: "Grade 8 General Science Quiz",
            duration: 60,
            status: "ongoing",
            questions: new Array(20),
            createdAt: new Date().toISOString(),
            grade: "8",
            subject: "General science"
          },
          {
            _id: "mock-exam-2",
            title: "Grade 12 Mathematics Final",
            duration: 90,
            status: "upcoming",
            questions: new Array(15),
            createdAt: new Date().toISOString(),
            grade: "12",
            subject: "Mathematics"
          },
          {
            _id: "mock-exam-3",
            title: "Grade 10 Biology Introduction",
            duration: 120,
            status: "completed",
            questions: new Array(30),
            createdAt: new Date().toISOString(),
            grade: "10",
            subject: "Biology"
          },
          {
            _id: "mock-exam-4",
            title: "Grade 7 Afaan Oromoo Test",
            duration: 45,
            status: "ongoing",
            questions: new Array(25),
            createdAt: new Date().toISOString(),
            grade: "7",
            subject: "Afaan Oromoo"
          }
        ];
        setExams([...localExams, ...mockExams]);
        toast.info("Showing available exams (Offline mode enabled)");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    const matchesGrade = gradeFilter === "all" || exam.grade === gradeFilter;
    const matchesSubject = subjectFilter === "all" || exam.subject === subjectFilter;
    
    // Classroom section eligibility filter
    let matchesSection = true;
    if (isStudent) {
      // If the exam has a specific section target type of 'some'
      if (exam.sectionsTargetType === "some" || (exam.allowedSections && exam.allowedSections.length > 0)) {
        const studentSection = (user?.section || "").trim().toLowerCase();
        
        let allowedArray: string[] = [];
        if (Array.isArray(exam.allowedSections)) {
          allowedArray = exam.allowedSections;
        } else if (typeof exam.allowedSections === "string") {
          allowedArray = exam.allowedSections.split(",").map((s: string) => s.trim());
        }
        
        matchesSection = allowedArray.some(
          (sec: string) => sec.trim().toLowerCase() === studentSection
        );
      }
    }
    
    return matchesSearch && matchesStatus && matchesGrade && matchesSubject && matchesSection;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Available Examinations</h1>
          <p className="text-slate-500 font-medium">Ethiopian Curriculum (Grade 7-12)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by exam title..." 
                className="pl-10 rounded-xl h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-xl h-11 w-11">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setStatusFilter}>
            <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
              <TabsTrigger value="all" className="rounded-lg px-4">All</TabsTrigger>
              <TabsTrigger value="ongoing" className="rounded-lg px-4">Ongoing</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg px-4">Upcoming</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-4">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="grade-filter" className="text-xs font-bold uppercase text-slate-400">Grade:</Label>
            <select 
              id="grade-filter"
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-slate-50"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              disabled={isStudent && !!user?.grade}
            >
              <option value="all">All Grades</option>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
            {isStudent && user?.grade && (
              <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-md">
                Locked to your grade
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="subject-filter" className="text-xs font-bold uppercase text-slate-400">Subject:</Label>
            <select 
              id="subject-filter"
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading exams...</p>
          </div>
        ) : filteredExams.length > 0 ? (
          filteredExams.map((exam: any) => (
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
              onClick={(id) => navigate(`/exam/${id}`)}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No exams found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

