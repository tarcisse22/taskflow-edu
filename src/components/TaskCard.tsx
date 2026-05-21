"use client";

import { useTaskContext } from "@/context/TaskContext";
import { Task } from "@/types";
import { Calendar, Paperclip, CheckCircle2, GripVertical } from "lucide-react";

const categoryStyles: Record<string, { bg: string; text: string }> = {
  assignment: { bg: "bg-blue-100", text: "text-blue-700" },
  exam: { bg: "bg-red-100", text: "text-red-700" },
  project: { bg: "bg-purple-100", text: "text-purple-700" },
  reading: { bg: "bg-green-100", text: "text-green-700" },
  lab: { bg: "bg-amber-100", text: "text-amber-700" },
  other: { bg: "bg-gray-100", text: "text-gray-700" },
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-300",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { setSelectedTaskId, getCourseById } = useTaskContext();
  const course = getCourseById(task.courseId);
  const catStyle = categoryStyles[task.category] || categoryStyles.other;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0 && task.status !== "done";
  const isDueSoon =
    daysUntilDue >= 0 && daysUntilDue <= 2 && task.status !== "done";

  return (
    <div
      onClick={() => setSelectedTaskId(task.id)}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}
        >
          {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
        </span>
        <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
        {task.title}
      </h3>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs font-medium text-gray-600">
              {task.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {course && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: course.color }}
              title={course.name}
            >
              {course.code.charAt(0)}
            </div>
          )}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
            title={`${task.priority} priority`}
          />
          <div
            className={`flex items-center gap-1 text-xs ${
              isOverdue
                ? "text-red-600"
                : isDueSoon
                  ? "text-amber-600"
                  : "text-gray-400"
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
