import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NotificationBell() {
  const notifications = [
    { id: "1", title: "New Exam Assigned", message: "Advanced Mathematics Midterm is now available.", time: "2 mins ago" },
    { id: "2", title: "Results Published", message: "Your History Quiz results are now available.", time: "1 hour ago" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-6">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 hover:bg-slate-100 transition-colors cursor-pointer">
              <p className="font-bold text-sm text-slate-900">{n.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm italic">
              No new notifications.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
