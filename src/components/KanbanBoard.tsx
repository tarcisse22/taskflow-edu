"use client";

import { useState } from "react";
import { useTaskContext } from "@/context/TaskContext";
import { TaskStatus, Task, TaskCategory, Priority } from "@/types";
import TaskCard from "./TaskCard";
import { Plus, X } from "lucide-react";

const columns: { id: TaskStatus; title: string; emoji: string }[] = [
  { id: "todo", title: "To do", emoji: "\uD83D\uDCDD" },
  { id: "in_progress", title: "In progress", emoji: "\u23F3" },
  { id: "done", title: "Done", emoji: "\u2705" },
];

export default function KanbanBoard() {
  const { filteredTasks, addTask, updateTask, courses } = useTaskContext();
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCourse, setNewTaskCourse] = useState("");
  const [newTaskCategory, setNewTaskCategory] =
    useState<TaskCategory>("assignment");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  function handleAddTask(status: TaskStatus) {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: `task-${crypto.randomUUID()}`,
      title: newTaskTitle,
      description: "",
      status,
      priority: newTaskPriority,
      category: newTaskCategory,
      courseId: newTaskCourse || (courses[0]?.id ?? ""),
      dueDate: newTaskDueDate || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      progress: 0,
      subtasks: [],
      attachments: [],
      notes: "",
    };
    addTask(task);
    setNewTaskTitle("");
    setNewTaskCourse("");
    setNewTaskCategory("assignment");
    setNewTaskPriority("medium");
    setNewTaskDueDate("");
    setAddingToColumn(null);
  }

  function handleDragStart(task: Task) {
    setDraggedTask(task);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(status: TaskStatus) {
    if (draggedTask && draggedTask.status !== status) {
      const progress = status === "done" ? 100 : status === "todo" ? 0 : draggedTask.progress;
      updateTask({ ...draggedTask, status, progress });
    }
    setDraggedTask(null);
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-1">
      {columns.map((column) => {
        const columnTasks = filteredTasks.filter(
          (t) => t.status === column.id
        );
        return (
          <div
            key={column.id}
            className="flex-1 min-w-[280px] max-w-[380px] flex flex-col"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span>{column.emoji}</span>
                <h2 className="text-sm font-semibold text-gray-700">
                  {column.title}
                </h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() =>
                  setAddingToColumn(
                    addingToColumn === column.id ? null : column.id
                  )
                }
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {addingToColumn === column.id && (
                <div className="bg-white border-2 border-indigo-200 rounded-xl p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddTask(column.id)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newTaskCourse}
                      onChange={(e) => setNewTaskCourse(e.target.value)}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Course...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newTaskCategory}
                      onChange={(e) =>
                        setNewTaskCategory(e.target.value as TaskCategory)
                      }
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="exam">Exam</option>
                      <option value="project">Project</option>
                      <option value="reading">Reading</option>
                      <option value="lab">Lab</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={newTaskPriority}
                      onChange={(e) =>
                        setNewTaskPriority(e.target.value as Priority)
                      }
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="flex-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setAddingToColumn(null)}
                      className="px-2 py-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                >
                  <TaskCard task={task} />
                </div>
              ))}

              {columnTasks.length === 0 && addingToColumn !== column.id && (
                <button
                  onClick={() => setAddingToColumn(column.id)}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                >
                  + Add task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
