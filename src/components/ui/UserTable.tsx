import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal, User, Mail, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "suspended" | "pending";
  lastLogin: string;
}

interface UserTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const roleVariants: Record<string, string> = {
    student: "bg-blue-100 text-blue-700 border-blue-200",
    teacher: "bg-purple-100 text-purple-700 border-purple-200",
    admin: "bg-red-100 text-red-700 border-red-200",
  };

  const statusVariants: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    suspended: "bg-slate-100 text-slate-500 border-slate-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">User</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Last Login</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="font-bold text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-none mb-1">{user.name}</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={roleVariants[user.role]}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusVariants[user.status]}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-xs font-medium">
                {user.lastLogin}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
