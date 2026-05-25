import { Link, useNavigate } from "react-router-dom";
import { Shield, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { NotificationBell } from "@/components/ui/NotificationBell";

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 scroll-smooth active:scale-95 transition-transform">
          <Shield className="h-6 w-6 text-blue-600 fill-blue-500/10" />
          <span className="text-xl font-black tracking-tight text-slate-900">
            Exam<span className="text-blue-600">Guard</span>
          </span>
        </Link>
 
         {/* Desktop Nav */}
         <div className="hidden md:flex items-center space-x-6 font-sans">
           <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
           {user?.role === "student" && <Link to="/exams" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Exams List</Link>}
           {user?.role === "teacher" && <Link to="/teacher" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Teacher Panel</Link>}
           {user?.role === "admin" && <Link to="/admin" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">System Admin</Link>}
           
           <div className="flex items-center space-x-4 ml-4">
             <NotificationBell />
             <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-150/40 rounded-full shadow-xs">
               <UserAvatar name={user?.name} size="sm" />
               <div className="flex flex-col">
                 <span className="text-xs font-bold leading-none text-slate-800">{user?.name}</span>
                 <span className="text-[10px] text-slate-500 font-bold capitalize mt-0.5">
                   {user?.role} {user?.grade ? `• G${user.grade}` : ""} {user?.section ? `(${user.section})` : ""}
                 </span>
               </div>
             </div>
             <Button variant="outline" size="sm" className="rounded-xl font-semibold border-slate-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200" onClick={handleLogout}>
               <LogOut className="h-3.5 w-3.5 mr-1.5" />
               Logout
             </Button>
           </div>
         </div>
 
         {/* Mobile Nav */}
         <div className="md:hidden">
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon">
                 <Menu className="h-6 w-6" />
               </Button>
             </SheetTrigger>
             <SheetContent side="right">
               <SheetHeader>
                 <SheetTitle className="text-lg font-black tracking-tight text-left">
                   Exam<span className="text-blue-600">Guard</span>
                 </SheetTitle>
               </SheetHeader>
               <div className="flex flex-col space-y-6 mt-8">
                 <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border">
                   <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                     <User className="h-6 w-6 text-blue-600" />
                   </div>
                   <div>
                     <p className="font-bold text-sm text-slate-800">{user?.name}</p>
                     <p className="text-xs text-slate-500 font-semibold capitalize">
                       {user?.role} {user?.grade ? `• Grade ${user.grade}` : ""} {user?.section ? `(${user.section})` : ""}
                     </p>
                   </div>
                 </div>
                 <div className="flex flex-col space-y-2">
                   <Link to="/dashboard" className="text-base font-bold text-slate-700 px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all">Dashboard</Link>
                   {user?.role === "student" && <Link to="/exams" className="text-base font-bold text-slate-700 px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all">Exams</Link>}
                   {user?.role === "teacher" && <Link to="/teacher" className="text-base font-bold text-slate-700 px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all">Teacher Panel</Link>}
                   {user?.role === "admin" && <Link to="/admin" className="text-base font-bold text-slate-700 px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all">Admin Panel</Link>}
                 </div>
                 <Button variant="outline" className="w-full justify-start rounded-xl font-semibold border-slate-200" onClick={handleLogout}>
                   <LogOut className="h-4 w-4 mr-2 text-slate-500" />
                   Logout
                 </Button>
               </div>
             </SheetContent>
           </Sheet>
         </div>
       </div>
     </nav>
  );
}
