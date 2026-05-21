"use client";

import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { SidebarView } from "@/types";
import {
  Home,
  CheckSquare,
  Inbox,
  BarChart3,
  Target,
  BookOpen,
  Plus,
  Search,
  GraduationCap,
  X,
  LogOut,
  FileUp,
} from "lucide-react";

export default function Sidebar() {
  const {
    courses,
    tasks,
    selectedCourseId,
    setSelectedCourseId,
    sidebarView,
    setSidebarView,
    searchQuery,
    setSearchQuery,
    addCourse,
    deleteCourse,
  } = useTaskContext();
  const { user, logout } = useAuth();
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    instructor: "",
  });

  const taskCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const urgentCount = tasks.filter(
    (t) => t.priority === "urgent" || t.priority === "high"
  ).length;

  const courseColors = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  function handleAddCourse() {
    if (!newCourse.name || !newCourse.code) return;
    addCourse({
      id: `course-${Date.now()}`,
      name: newCourse.name,
      code: newCourse.code,
      color: courseColors[courses.length % courseColors.length],
      instructor: newCourse.instructor,
    });
    setNewCourse({ name: "", code: "", instructor: "" });
    setShowAddCourse(false);
  }

  function handleSidebarClick(view: SidebarView) {
    setSidebarView(view);
    setSelectedCourseId(null);
  }

  function isActive(view: SidebarView) {
    return sidebarView === view && !selectedCourseId;
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">TaskFlow EDU</h1>
            <p className="text-xs text-gray-500">Student Planner</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
            General
          </p>
          <button
            onClick={() => handleSidebarClick("home")}
            className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors ${
              isActive("home")
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => handleSidebarClick("my_tasks")}
            className={`w-full flex items-center justify-between gap-3 px-2 py-2 text-sm rounded-lg transition-colors ${
              isActive("my_tasks")
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4" />
              <span>My Tasks</span>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {taskCount}
            </span>
          </button>
          <button
            onClick={() => handleSidebarClick("upcoming")}
            className={`w-full flex items-center justify-between gap-3 px-2 py-2 text-sm rounded-lg transition-colors ${
              isActive("upcoming")
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4" />
              <span>Upcoming</span>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {todoCount}
            </span>
          </button>
          <button
            onClick={() => handleSidebarClick("progress")}
            className={`w-full flex items-center justify-between gap-3 px-2 py-2 text-sm rounded-lg transition-colors ${
              isActive("progress")
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              <span>Progress</span>
            </div>
            {inProgressCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {inProgressCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSidebarClick("goals")}
            className={`w-full flex items-center justify-between gap-3 px-2 py-2 text-sm rounded-lg transition-colors ${
              isActive("goals")
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4" />
              <span>Goals</span>
            </div>
            {urgentCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {urgentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSidebarClick("materials")}
            className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors ${
              isActive("materials")
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>Materials</span>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              My Courses
            </p>
            <button
              onClick={() => setShowAddCourse(!showAddCourse)}
              className="text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {courses.map((course) => {
            const courseTaskCount = tasks.filter(
              (t) => t.courseId === course.id
            ).length;
            return (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setSidebarView("home");
                }}
                className={`w-full flex items-center justify-between gap-3 px-2 py-2 text-sm rounded-lg transition-colors group ${
                  selectedCourseId === course.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen
                    className="w-4 h-4 shrink-0"
                    style={{ color: course.color }}
                  />
                  <span className="truncate">{course.code}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-gray-400">
                    {courseTaskCount}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCourse(course.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </button>
            );
          })}

          {showAddCourse && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-2">
              <input
                type="text"
                placeholder="Course name"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <input
                type="text"
                placeholder="Course code (e.g. CS201)"
                value={newCourse.code}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, code: e.target.value })
                }
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Instructor (optional)"
                value={newCourse.instructor}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, instructor: e.target.value })
                }
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex gap-1">
                <button
                  onClick={handleAddCourse}
                  className="flex-1 px-2 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-indigo-600">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
