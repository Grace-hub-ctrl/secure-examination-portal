import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Activity, AlertTriangle, Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/ui/UserTable";
import { SecurityMonitor } from "@/components/ui/SecurityMonitor";
import { StatCard } from "@/components/ui/StatCard";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    { id: "0", name: "Israel", email: "israel@edu.et", role: "admin", status: "active", lastLogin: "3:13:27 PM" },
    { id: "1", name: "Alice Johnson", email: "alice@school.edu", role: "student", status: "active", lastLogin: "2 hours ago" },
    { id: "2", name: "Dr. Robert Smith", email: "robert@school.edu", role: "teacher", status: "active", lastLogin: "1 day ago" },
    { id: "3", name: "Admin Sarah", email: "sarah@school.edu", role: "admin", status: "active", lastLogin: "10 mins ago" },
    { id: "4", name: "Charlie Brown", email: "charlie@school.edu", role: "student", status: "suspended", lastLogin: "3 days ago" },
  ] as const;

  const handleEditUser = (user: any) => {
    toast.info(`Editing user: ${user.name}`);
  };

  const [globalBlocks, setGlobalBlocks] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("global_blocks") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  });

  const handleUnlock = (studentCode: string, examId: string) => {
    localStorage.removeItem(`blocked_exam_${examId}_${studentCode}`);
    const updatedBlocks = globalBlocks.filter((b: any) => !(b.studentCode === studentCode && b.examId === examId));
    localStorage.setItem("global_blocks", JSON.stringify(updatedBlocks));
    setGlobalBlocks(updatedBlocks);
    toast.success(`Access restored for student ${studentCode}`);
  };

  const handleDeleteUser = (id: string) => {
    toast.error(`Deleting user with ID: ${id}`);
  };

  let localExams: any[] = [];
  let localResults: any[] = [];
  try {
    const parsedExams = JSON.parse(localStorage.getItem("local_exams") || "[]");
    localExams = (Array.isArray(parsedExams) ? parsedExams : []).filter((e: any) => e && typeof e === "object");
  } catch (_) {}

  try {
    const parsedResults = JSON.parse(localStorage.getItem("local_results") || "[]");
    localResults = (Array.isArray(parsedResults) ? parsedResults : []).filter((r: any) => r && typeof r === "object");
  } catch (_) {}

  const localViolations = localResults.reduce((acc: any[], res: any) => {
    if (res && res.violations && Array.isArray(res.violations)) {
      res.violations.forEach((v: string) => {
        acc.push({
          studentName: res.studentName || "N/A",
          type: v,
          timestamp: res.submittedAt || new Date().toISOString(),
          grade: res.grade || "N/A",
          section: res.section || "N/A"
        });
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
        <p className="text-slate-500">Monitor system health, manage users, and review security logs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={(users.length + (localStorage.getItem("user_count") ? parseInt(localStorage.getItem("user_count")!) : 0)).toString()} 
          icon={<Users className="h-4 w-4" />} 
        />
        <StatCard 
          title="Exams Created" 
          value={localExams.length.toString()} 
          icon={<Activity className="h-4 w-4" />} 
          description="Locally managed & mock"
        />
        <StatCard 
          title="Security Flags" 
          value={localViolations.length.toString()} 
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />} 
        />
        <StatCard 
          title="Submissions" 
          value={localResults.length.toString()} 
          icon={<Shield className="h-4 w-4" />} 
          description="Recent test results"
        />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
          <TabsTrigger value="users" className="rounded-lg px-6">User Management</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6">Security Monitor</TabsTrigger>
          <TabsTrigger value="blocks" className="rounded-lg px-6 bg-red-50 text-red-600 data-[state=active]:bg-red-600 data-[state=active]:text-white">Security Blocks</TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg px-6">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search users by name or email..." 
                  className="pl-10 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add New User
            </Button>
          </div>

          <UserTable 
            users={(() => {
              let localUsers: any[] = [];
              try {
                const parsed = JSON.parse(localStorage.getItem("local_users") || "[]");
                localUsers = Array.isArray(parsed) ? parsed : [];
              } catch (_) {}
              const mappedLocal = localUsers
                .filter((u: any) => u && typeof u === "object" && u.name)
                .map((u: any) => ({
                  id: u.id || `u-${Math.random()}`,
                  name: u.name,
                  email: `${u.name.toLowerCase().replace(/\s/g, "")}@edu.et`,
                  role: u.role || "student",
                  status: u.status || "active",
                  lastLogin: u.loginTime ? new Date(u.loginTime).toLocaleTimeString() : "N/A",
                  grade: u.grade || "N/A"
                }));
              const allUsers = [...mappedLocal, ...users];
              return allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
            })()} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityMonitor />
        </TabsContent>
        
        <TabsContent value="blocks" className="space-y-6">
          <Card className="rounded-2xl border-2 border-red-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="text-red-900 font-black flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Security Blocks
              </CardTitle>
              <CardDescription className="text-red-700 font-medium">
                Students listed here have been prohibited from continuing their exams due to security violations.
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-red-50/50 border-b border-red-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400">Blocked Student</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400">Exam Context</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400">Locked At</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {globalBlocks.length > 0 ? globalBlocks.map((block: any) => (
                    <tr key={block.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{block.studentName}</div>
                        <div className="text-[10px] text-red-600 font-black uppercase tracking-tight">{block.studentCode}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Grade {block.grade} • Section {block.section}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-600">{block.examTitle}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-black">ID: {block.examId}</div>
                        {block.reason && (
                          <div className="text-[9px] text-red-600 font-bold bg-red-50 border border-red-100 rounded px-1.5 py-0.5 mt-1 inline-block leading-normal max-w-xs">
                            Reason: {block.reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[10px] font-medium">
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
                        Total system clear. No active student blocks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">System Activity Logs</CardTitle>
              <CardDescription>Recent administrative and system-level events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Activity className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Database Backup Completed</p>
                      <p className="text-xs text-slate-500">Automated system backup finished successfully.</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Today at 04:00 AM</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">Success</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

