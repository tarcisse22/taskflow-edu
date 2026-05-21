export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskCategory =
  | "assignment"
  | "exam"
  | "project"
  | "reading"
  | "lab"
  | "other";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  courseId: string;
  dueDate: string;
  createdAt: string;
  progress: number;
  subtasks: Subtask[];
  attachments: string[];
  notes: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  instructor: string;
}

export type ViewMode = "board" | "list" | "calendar";

export type SidebarView = "home" | "my_tasks" | "upcoming" | "progress" | "goals" | "materials";

export interface Material {
  id: string;
  name: string;
  type: string;
  size: number;
  courseId: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
