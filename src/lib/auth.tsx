import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import axios from "axios";

interface User {
  id: string;
  role: "student" | "teacher" | "admin";
  name: string;
  grade?: string;
  section?: string;
  accessCode: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (name: string, accessCode: string, grade?: string, section?: string) => Promise<User>;
  logout: () => Promise<void>;
}

const ROLES = {
  teacher: ["TCH-789", "TEACHER20260"],
  admin: ["ADM-000", "ADMIN20269"],
  student: {
    "7": ["STU-G7", "STUDENT20267"],
    "8": ["STU-G8", "STUDENT20268"],
    "9": ["STU-G9", "STUDENT20269"],
    "10": ["STU-G10", "STUDENT202610"],
    "11": ["STU-G11", "STUDENT202611"],
    "12": ["STU-G12", "STUDENT202612"],
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const mockUser = localStorage.getItem("auth_user");
        if (mockUser) {
          const parsed = JSON.parse(mockUser);
          if (parsed && typeof parsed === "object" && parsed.id && parsed.name && parsed.role) {
            setUser(parsed);
          } else {
            localStorage.removeItem("auth_user");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (name: string, accessCode: string, grade?: string, section?: string): Promise<User> => {
    setLoading(true);
    try {
      let role: "student" | "teacher" | "admin" | null = null;
      
      const code = accessCode.toUpperCase();
      if (ROLES.teacher.includes(code)) {
        role = "teacher";
      } else if (ROLES.admin.includes(code)) {
        role = "admin";
      } else if (grade) {
        // Check if code matches specific grade
        const gradeCodes = ROLES.student[grade as keyof typeof ROLES.student];
        if (gradeCodes?.includes(code)) {
          role = "student";
        }
      }

      if (!role) {
        throw new Error("Invalid Access Code for your role/grade. Please check the guide.");
      }

      const userData: User = {
        id: `user-${Date.now()}`,
        name,
        role,
        grade: role === "student" ? grade : undefined,
        section: role === "student" ? section : undefined,
        accessCode: code
      };

      setUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      toast.success(`Access Granted: Welcome, ${name}!`);
      return userData;
    } catch (error: any) {
      toast.error(error.message || "Access Denied");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
