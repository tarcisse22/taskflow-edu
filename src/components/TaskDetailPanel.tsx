"use client";

import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { TaskStatus, Priority, TaskCategory } from "@/types";
import {
  X,
  Calendar,
  Flag,
  BookOpen,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  FileText,
  Clock,
  Paperclip,
} from "lucide-react";

const priorityLabels: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-500" },
  medium: { label: "Medium", color: "text-blue-500" },
  high: { label: "High", color: "text-orange-500" },
  urgent: { label: "Urgent", color: "text-red-500" },
};

const statusLabels: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "To Do", color: "bg-gray-100 text-gray-700" },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
  done: { label: "Done", color: "bg-green-100 text-green-700" },
};

export default function TaskDetailPanel() {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    getCourseById,
  } = useTaskContext();
  const [newSubtask, setNewSubtask] = useState("");
  const [activeTab, setActiveTab] = useState<
    "subtasks" | "notes" | "attachments"
  >("subtasks");

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const course = getCourseById(task.courseId);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  function handleToggleSubtask(subtaskId: string) {
    if (!task) return;
    const updated = {
      ...task,
      subtasks: task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      ),
    };
    const completed = updated.subtasks.filter((s) => s.completed).length;
    const total = updated.subtasks.length;
    updated.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    updateTask(updated);
  }

  function handleAddSubtask() {
    if (!task || !newSubtask.trim()) return;
    const updated = {
      ...task,
      subtasks: [
        ...task.subtasks,
        { id: `st-${crypto.randomUUID()}`, title: newSubtask, completed: false },
      ],
    };
    const completed = updated.subtasks.filter((s) => s.completed).length;
    const total = updated.subtasks.length;
    updated.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    updateTask(updated);
    setNewSubtask("");
  }

  function handleDeleteSubtask(subtaskId: string) {
    if (!task) return;
    const updated = {
      ...task,
      subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
    };
    const completed = updated.subtasks.filter((s) => s.completed).length;
    const total = updated.subtasks.length;
    updated.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    updateTask(updated);
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Task Details</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              deleteTask(task.id);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTaskId(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <input
            type="text"
            value={task.title}
            onChange={(e) => updateTask({ ...task, title: e.target.value })}
            className="w-full text-lg font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 p-0"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <Flag className="w-3.5 h-3.5" />
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) =>
                  updateTask({
                    ...task,
                    priority: e.target.value as Priority,
                  })
                }
                className={`w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${priorityLabels[task.priority].color}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => {
                  const newStatus = e.target.value as TaskStatus;
                  const progress = newStatus === "done" ? 100 : newStatus === "todo" ? 0 : task.progress;
                  updateTask({ ...task, status: newStatus, progress });
                }}
                className={`w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) =>
                  updateTask({ ...task, dueDate: e.target.value })
                }
                className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <BookOpen className="w-3.5 h-3.5" />
                Category
              </label>
              <select
                value={task.category}
                onChange={(e) =>
                  updateTask({
                    ...task,
                    category: e.target.value as TaskCategory,
                  })
                }
                className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="reading">Reading</option>
                <option value="lab">Lab</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {course && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: course.color }}
              />
              <span className="text-sm text-gray-700">
                {course.code} - {course.name}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-semibold text-gray-700">
                {task.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${task.progress === 100 ? "bg-green-500" : "bg-indigo-500"}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          <textarea
            placeholder="Add a description..."
            value={task.description}
            onChange={(e) =>
              updateTask({ ...task, description: e.target.value })
            }
            className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            rows={3}
          />

          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-1 mb-3">
              {(["subtasks", "notes", "attachments"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === tab
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab === "subtasks"
                    ? `Subtasks ${task.subtasks.length > 0 ? `(${completedSubtasks}/${task.subtasks.length})` : ""}`
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "subtasks" && (
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      onClick={() => handleToggleSubtask(subtask.id)}
                      className="shrink-0"
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300 hover:text-indigo-500" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${subtask.completed ? "text-gray-400 line-through" : "text-gray-700"}`}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                    className="flex-1 text-sm border-none focus:outline-none focus:ring-0 p-0 text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <textarea
                placeholder="Add notes..."
                value={task.notes}
                onChange={(e) =>
                  updateTask({ ...task, notes: e.target.value })
                }
                className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                rows={6}
              />
            )}

            {activeTab === "attachments" && (
              <div className="space-y-2">
                {task.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 flex-1">
                      {file}
                    </span>
                  </div>
                ))}
                {task.attachments.length === 0 && (
                  <div className="text-center py-6 text-sm text-gray-400">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No attachments yet
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span className={`inline-block px-2 py-0.5 rounded-full ${statusLabels[task.status].color}`}>
              {statusLabels[task.status].label}
            </span>
            <span className="ml-2">
              Created{" "}
              {new Date(task.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
