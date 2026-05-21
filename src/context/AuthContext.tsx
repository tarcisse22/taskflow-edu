"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => string | null;
  signup: (name: string, email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function hashPasswordSync(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36) + password.length.toString(36);
}

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("taskflow-users");
    return stored ? (JSON.parse(stored) as User[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem("taskflow-users", JSON.stringify(users));
}

function resolveUser(): User | null {
  if (typeof window === "undefined") return null;
  const userId = localStorage.getItem("taskflow-current-user");
  if (!userId) return null;
  const users = getUsers();
  const found = users.find((u) => u.id === userId);
  if (!found) {
    localStorage.removeItem("taskflow-current-user");
  }
  return found || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => resolveUser());
  const isLoading = false;

  const login = useCallback((email: string, password: string): string | null => {
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!found) {
      return "No account found with this email";
    }
    const hash = hashPasswordSync(password);
    if (found.passwordHash !== hash) {
      return "Incorrect password";
    }
    setUser(found);
    localStorage.setItem("taskflow-current-user", found.id);
    return null;
  }, []);

  const signup = useCallback(
    (name: string, email: string, password: string): string | null => {
      const users = getUsers();
      const exists = users.some(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (exists) {
        return "An account with this email already exists";
      }
      if (password.length < 6) {
        return "Password must be at least 6 characters";
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        passwordHash: hashPasswordSync(password),
        createdAt: new Date().toISOString().split("T")[0],
      };
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      setUser(newUser);
      localStorage.setItem("taskflow-current-user", newUser.id);
      return null;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("taskflow-current-user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
