"use client";

import { useTaskContext } from "@/context/TaskContext";
import KanbanBoard from "./KanbanBoard";
import CalendarView from "./CalendarView";
import ListView from "./ListView";
import MaterialsView from "./MaterialsView";
import TaskDetailPanel from "./TaskDetailPanel";
import {
  LayoutGrid,
  List,
  Calendar,
  GraduationCap,
  CheckSquare,
  Inbox,
  BarChart3,
  Target,
  FileUp,
} from "lucide-react";

const sidebarViewConfig = {
  home: { label: "My Tasks", icon: GraduationCap },
  my_tasks: { label: "All Tasks", icon: CheckSquare },
  upcoming: { label: "Upcoming", icon: Inbox },
  progress: { label: "In Progress", icon: BarChart3 },
  goals: { label: "Goals & Priorities", icon: Target },
  materials: { label: "Materials", icon: FileUp },
} as const;

export default function Dashboard() {
  const {
    viewMode,
    setViewMode,
    selectedTaskId,
    selectedCourseId,
    sidebarView,
    courses,
    filteredTasks,
  } = useTaskContext();

  const course = selectedCourseId
    ? courses.find((c) => c.id === selectedCourseId)
    : null;

  const isMaterials = sidebarView === "materials";

  const todoCount = filteredTasks.filter((t) => t.status === "todo").length;
  const inProgressCount = filteredTasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const doneCount = filteredTasks.filter((t) => t.status === "done").length;

  const viewConfig = sidebarViewConfig[sidebarView];
  const ViewIcon = viewConfig.icon;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {course ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    {course.code} - {course.name}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ViewIcon className="w-5 h-5 text-indigo-600" />
                    {viewConfig.label}
                  </span>
                )}
              </h1>
              {course && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {course.instructor}
                </p>
              )}
            </div>

            {!isMaterials && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-gray-500">
                      To do:{" "}
                      <span className="font-semibold text-gray-700">
                        {todoCount}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-gray-500">
                      In progress:{" "}
                      <span className="font-semibold text-gray-700">
                        {inProgressCount}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-gray-500">
                      Done:{" "}
                      <span className="font-semibold text-gray-700">
                        {doneCount}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("board")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === "board"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Board
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === "calendar"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendar
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6 bg-gray-50">
          {isMaterials ? (
            <MaterialsView />
          ) : (
            <>
              {viewMode === "board" && <KanbanBoard />}
              {viewMode === "list" && <ListView />}
              {viewMode === "calendar" && <CalendarView />}
            </>
          )}
        </main>
      </div>

      {selectedTaskId && !isMaterials && <TaskDetailPanel />}
    </div>
  );
}
