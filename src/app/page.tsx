"use client";

import { TaskProvider } from "@/context/TaskContext";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <TaskProvider>
      <div className="flex h-screen bg-white">
        <Sidebar />
        <Dashboard />
      </div>
    </TaskProvider>
  );
}
