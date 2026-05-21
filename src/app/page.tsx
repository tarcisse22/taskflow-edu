"use client";

import { useAuth } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TaskProvider key={user.id} userId={user.id}>
      <div className="flex h-screen bg-white">
        <Sidebar />
        <Dashboard />
      </div>
    </TaskProvider>
  );
}
