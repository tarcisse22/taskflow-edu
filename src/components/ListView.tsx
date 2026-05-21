"use client";

import { useTaskContext } from "@/context/TaskContext";
import {
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-500 bg-gray-100" },
  medium: { label: "Medium", color: "text-blue-600 bg-blue-50" },
  high: { label: "High", color: "text-orange-600 bg-orange-50" },
  urgent: { label: "Urgent", color: "text-red-600 bg-red-50" },
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

export default function ListView() {
  const { filteredTasks, setSelectedTaskId, getCourseById } = useTaskContext();

  const sorted = [...filteredTasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-50 z-10">
          <tr className="text-xs text-gray-500 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold">Task</th>
            <th className="text-left py-3 px-4 font-semibold">Course</th>
            <th className="text-left py-3 px-4 font-semibold">Priority</th>
            <th className="text-left py-3 px-4 font-semibold">Due Date</th>
            <th className="text-left py-3 px-4 font-semibold">Progress</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => {
            const course = getCourseById(task.courseId);
            const StatusIcon = statusIcons[task.status] || Circle;
            const prio = priorityLabels[task.priority];
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const isOverdue =
              dueDate < now && task.status !== "done";

            return (
              <tr
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon
                      className={`w-4 h-4 shrink-0 ${
                        task.status === "done"
                          ? "text-green-500"
                          : task.status === "in_progress"
                            ? "text-blue-500"
                            : "text-gray-300"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {task.category.charAt(0).toUpperCase() +
                          task.category.slice(1)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {course && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: course.color }}
                      />
                      <span className="text-sm text-gray-600">
                        {course.code}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${prio.color}`}
                  >
                    <Flag className="w-3 h-3" />
                    {prio.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`flex items-center gap-1 text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${task.progress === 100 ? "bg-green-500" : "bg-indigo-500"}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {task.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or add a new task
          </p>
        </div>
      )}
    </div>
  );
}
