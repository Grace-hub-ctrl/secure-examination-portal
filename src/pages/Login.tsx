import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, GraduationCap, School, Lock, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [grade, setGrade] = useState("9");
  const [section, setSection] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const isStudentCode = accessCode.toUpperCase().startsWith("STU") || accessCode.toUpperCase().startsWith("STUDENT");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // For students, the login will check against the selected grade's codes
      const userData = await login(name, accessCode, grade, isStudentCode ? section : undefined);
      
      // Track real users for admin dashboard
      let localUsers: any[] = [];
      try {
        const parsed = JSON.parse(localStorage.getItem("local_users") || "[]");
        localUsers = Array.isArray(parsed) ? parsed : [];
      } catch (_) {}
      const newUser = {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        grade: userData.grade,
        section: userData.section,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("local_users", JSON.stringify([newUser, ...localUsers]));
      
      // Increment user count for admin stats simulation
      const currentCount = parseInt(localStorage.getItem("user_count") || "0");
      localStorage.setItem("user_count", (currentCount + 1).toString());
      
      navigate("/dashboard");
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: "student" | "teacher" | "admin", selectedGrade?: string) => {
    if (role === "student") {
      setName("Abebe Kebede");
      setAccessCode(`STU-G${selectedGrade || "9"}`);
      setGrade(selectedGrade || "9");
      setSection("Section A");
    } else if (role === "teacher") {
      setName("Alemayehu Tola");
      setAccessCode("TCH-789");
      setGrade("9");
      setSection("");
    } else {
      setName("Admin System Controller");
      setAccessCode("ADM-000");
      setGrade("9");
      setSection("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
              <Shield className="h-10 w-10 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Exam<span className="text-blue-600">Guard</span>
          </h1>
          <p className="text-slate-500 font-medium">Secure & Monitored Examination Platform</p>
        </div>

        {/* Demo Fast Account Selector -- Extremely user friendly */}
        <div className="bg-white/80 backdrop-blur border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
            ⚡ Quick-Fill Accounts (One-Click Demo Setup)
          </h3>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Click any button below to pre-fill credentials for that user role instantly:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleQuickFill("student", "9")}
              className="rounded-xl h-12 text-xs font-semibold hover:bg-slate-50 border-blue-100 text-blue-700 bg-blue-50/20 hover:border-blue-300 transition-all flex flex-col justify-center items-center gap-0.5"
            >
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span>Student (Grade 9)</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleQuickFill("teacher")}
              className="rounded-xl h-12 text-xs font-semibold hover:bg-slate-50 border-amber-100 text-amber-700 bg-amber-50/20 hover:border-amber-300 transition-all flex flex-col justify-center items-center gap-0.5"
            >
              <School className="h-4 w-4 text-amber-600" />
              <span>Teacher Panel</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleQuickFill("admin")}
              className="rounded-xl h-12 text-xs font-semibold hover:bg-slate-50 border-slate-100 text-slate-700 bg-slate-50/20 hover:border-slate-300 transition-all flex flex-col justify-center items-center gap-0.5"
            >
              <Shield className="h-4 w-4 text-slate-600" />
              <span>Administrator</span>
            </Button>
          </div>
        </div>

        <Card className="border border-slate-200/60 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md">
          <CardHeader className="space-y-1.5 border-b border-slate-100/80 bg-slate-50/50 pb-5">
            <CardTitle className="text-xl font-bold text-center text-slate-900">
              Sign In to Your Workspace
            </CardTitle>
            <CardDescription className="text-center text-slate-500 font-medium">
              Validate your security credentials below to access the examinations.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 focus-visible:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-xs font-bold uppercase tracking-wider text-slate-500">Institutional Access Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="accessCode" 
                    type="text" 
                    placeholder="e.g. STU-G9, TCH-789 or ADM-000" 
                    required 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="rounded-xl pl-10 h-11 border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-normal italic">
                  * Codes specify your grade or professional tier.
                </p>
              </div>

              {isStudentCode && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/60 space-y-3">
                    <Label htmlFor="grade" className="text-blue-800 font-bold block text-sm">Which Grade are you in?</Label>
                    <select
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-2.5 font-bold text-blue-950 focus:border-blue-500 focus:ring-0 transition-all outline-none"
                    >
                      <option value="7">Grade 7</option>
                      <option value="8">Grade 8</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                    <p className="text-[10px] text-blue-600/80 font-medium">
                      Providing the correct grade filters curriculum assessments.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section" className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Classroom Section</Label>
                    <Input 
                      id="section"
                      placeholder="e.g. Section A"
                      required={isStudentCode}
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="rounded-xl border border-slate-200 h-11 focus-visible:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 pb-6 flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-bold gap-2 shadow-lg shadow-blue-600/10 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? "Validating security layer..." : "Access secure portal"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Informative credentials index for transparency */}
        <div className="bg-slate-50/50 p-5 rounded-2xl space-y-3 border border-slate-200/40">
          <h4 className="text-xs font-bold text-slate-700 border-b border-slate-200/60 pb-2 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            Institutional Reference Codes
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Academic student tiers:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[7, 8, 9, 10, 11, 12].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleQuickFill("student", String(g))}
                    className="flex flex-col justify-center items-center bg-white hover:bg-blue-50/30 p-1.5 rounded-lg border border-slate-200/60 text-[11px] text-slate-600 font-medium hover:border-blue-400 transition-colors"
                  >
                    <span>Grade {g}</span>
                    <code className="text-[9px] font-bold text-blue-600 bg-blue-50/50 px-1 rounded">STU-G{g}</code>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/40">
              <button
                type="button"
                onClick={() => handleQuickFill("teacher")}
                className="flex justify-between items-center text-slate-600 bg-white hover:bg-amber-50/30 p-2.5 rounded-xl border border-slate-200/60 hover:border-amber-400 transition-colors text-[11px] font-semibold"
              >
                <span className="text-slate-500 text-[10px] uppercase">Teachers:</span>
                <code className="bg-amber-50 px-2 py-0.5 rounded text-amber-700 font-bold text-[10px]">TCH-789</code>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                className="flex justify-between items-center text-slate-600 bg-white hover:bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/60 hover:border-slate-400 transition-colors text-[11px] font-semibold"
              >
                <span className="text-slate-500 text-[10px] uppercase">Administrators:</span>
                <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold text-[10px]">ADM-000</code>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
