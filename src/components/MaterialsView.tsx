"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTaskContext } from "@/context/TaskContext";
import { Material } from "@/types";
import {
  getMaterials,
  uploadFile,
  deleteMaterial,
  getFileBlob,
  formatFileSize,
  getFileTypeLabel,
} from "@/lib/fileStorage";
import {
  Upload,
  FileText,
  Presentation,
  File,
  Trash2,
  Download,
  FolderOpen,
} from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ACCEPT_STRING =
  ".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

function FileIcon({ type }: { type: string }) {
  if (type.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
  if (type.includes("presentation") || type.includes("powerpoint"))
    return <Presentation className="w-8 h-8 text-orange-500" />;
  if (type.includes("word") || type.includes("document"))
    return <FileText className="w-8 h-8 text-blue-500" />;
  return <File className="w-8 h-8 text-gray-500" />;
}

export default function MaterialsView() {
  const { user } = useAuth();
  const { courses } = useTaskContext();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filterCourseId, setFilterCourseId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadCourseId, setUploadCourseId] = useState<string>(
    courses[0]?.id ?? ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = user?.id ?? "";

  const refreshMaterials = useCallback(async () => {
    if (!userId) return;
    const mats = await getMaterials(userId);
    setMaterials(mats);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getMaterials(userId).then((mats) => {
      if (!cancelled) setMaterials(mats);
    });
    return () => { cancelled = true; };
  }, [userId]);

  async function handleFiles(files: FileList | File[]) {
    if (!userId || courses.length === 0) return;
    setUploading(true);
    const courseId = uploadCourseId || courses[0]?.id || "";
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      await uploadFile(userId, file, courseId);
    }
    await refreshMaterials();
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  async function handleDelete(materialId: string) {
    if (!userId) return;
    await deleteMaterial(userId, materialId);
    await refreshMaterials();
  }

  async function handleDownload(material: Material) {
    const blob = await getFileBlob(material.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = material.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const filtered = filterCourseId
    ? materials.filter((m) => m.courseId === filterCourseId)
    : materials;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <div className="h-full overflow-y-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-1">
          Drag & drop files here, or{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-400 mb-4">PDF, Word, PowerPoint</p>

        {courses.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <label className="text-xs text-gray-500">Upload to:</label>
            <select
              value={uploadCourseId}
              onChange={(e) => setUploadCourseId(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {courses.length === 0 && (
          <p className="text-xs text-amber-600">
            Add a course first before uploading materials
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        {uploading && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">Uploading...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Uploaded Materials ({sorted.length})
        </h3>
        <select
          value={filterCourseId}
          onChange={(e) => setFilterCourseId(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No materials uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload lecture slides, PDFs, or documents above
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((material) => {
            const course = courses.find((c) => c.id === material.courseId);
            return (
              <div
                key={material.id}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-indigo-200 transition-colors group"
              >
                <FileIcon type={material.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {material.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">
                      {getFileTypeLabel(material.type)}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {formatFileSize(material.size)}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    {course && (
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: course.color + "20",
                          color: course.color,
                        }}
                      >
                        {course.code}
                      </span>
                    )}
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(material)}
                    title="Download"
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
