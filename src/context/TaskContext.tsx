"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Task, Course, ViewMode } from "@/types";

interface TaskContextType {
  tasks: Task[];
  courses: Course[];
  selectedCourseId: string | null;
  selectedTaskId: string | null;
  viewMode: ViewMode;
  searchQuery: string;
  setTasks: (tasks: Task[]) => void;
  setCourses: (courses: Course[]) => void;
  setSelectedCourseId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  filteredTasks: Task[];
  getCourseById: (id: string) => Course | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface TaskProviderProps {
  children: ReactNode;
  userId: string;
}

export function TaskProvider({ children, userId }: TaskProviderProps) {
  const tasksKey = `taskflow-tasks-${userId}`;
  const coursesKey = `taskflow-courses-${userId}`;

  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage(tasksKey, [])
  );
  const [courses, setCourses] = useState<Course[]>(() =>
    loadFromStorage(coursesKey, [])
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  }, [tasks, tasksKey]);

  useEffect(() => {
    localStorage.setItem(coursesKey, JSON.stringify(courses));
  }, [courses, coursesKey]);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const updateTask = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskId((prev) => (prev === id ? null : prev));
  }, []);

  const addCourse = useCallback((course: Course) => {
    setCourses((prev) => [...prev, course]);
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.courseId !== id));
    setSelectedCourseId((prev) => (prev === id ? null : prev));
  }, []);

  const getCourseById = useCallback(
    (id: string) => courses.find((c) => c.id === id),
    [courses]
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesCourse =
      !selectedCourseId || task.courseId === selectedCourseId;
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        courses,
        selectedCourseId,
        selectedTaskId,
        viewMode,
        searchQuery,
        setTasks,
        setCourses,
        setSelectedCourseId,
        setSelectedTaskId,
        setViewMode,
        setSearchQuery,
        addTask,
        updateTask,
        deleteTask,
        addCourse,
        deleteCourse,
        filteredTasks,
        getCourseById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
