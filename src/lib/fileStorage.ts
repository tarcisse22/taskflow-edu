import { Material } from "@/types";

const DB_NAME = "taskflow-edu-files";
const DB_VERSION = 1;
const FILES_STORE = "files";
const META_STORE = "metadata";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE);
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function userMetaKey(userId: string): string {
  return `materials-${userId}`;
}

export async function getMaterials(userId: string): Promise<Material[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const store = tx.objectStore(META_STORE);
    const request = store.get(userMetaKey(userId));
    request.onsuccess = () => resolve((request.result as Material[]) || []);
    request.onerror = () => reject(request.error);
  });
}

async function saveMaterials(
  userId: string,
  materials: Material[]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    const store = tx.objectStore(META_STORE);
    const request = store.put(materials, userMetaKey(userId));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function uploadFile(
  userId: string,
  file: File,
  courseId: string
): Promise<Material> {
  const db = await openDB();
  const id = crypto.randomUUID();
  const arrayBuffer = await file.arrayBuffer();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, "readwrite");
    const store = tx.objectStore(FILES_STORE);
    const request = store.put(arrayBuffer, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  const material: Material = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    courseId,
    uploadedAt: new Date().toISOString(),
  };

  const materials = await getMaterials(userId);
  materials.push(material);
  await saveMaterials(userId, materials);

  return material;
}

export async function getFileBlob(materialId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, "readonly");
    const store = tx.objectStore(FILES_STORE);
    const request = store.get(materialId);
    request.onsuccess = () => {
      const data = request.result as ArrayBuffer | undefined;
      resolve(data ? new Blob([data]) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMaterial(
  userId: string,
  materialId: string
): Promise<void> {
  const db = await openDB();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILES_STORE, "readwrite");
    const store = tx.objectStore(FILES_STORE);
    const request = store.delete(materialId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

  const materials = await getMaterials(userId);
  const updated = materials.filter((m) => m.id !== materialId);
  await saveMaterials(userId, updated);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_MAP: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PPTX",
  "application/vnd.ms-powerpoint": "PPT",
};

export function getFileTypeLabel(mimeType: string): string {
  return EXT_MAP[mimeType] || mimeType.split("/").pop()?.toUpperCase() || "FILE";
}
