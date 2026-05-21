export type AIAction = "summarize" | "flashcards" | "quiz" | "cheatsheet";

export interface Summary {
  title: string;
  keyPoints: string[];
  concepts: { term: string; definition: string }[];
  importantFormulas?: string[];
  studyTips?: string[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSet {
  flashcards: Flashcard[];
}

export interface QuizQuestion {
  question: string;
  type: "multiple_choice" | "short_answer";
  options?: string[];
  correct?: string;
  answer?: string;
  explanation: string;
}

export interface Quiz {
  quiz: QuizQuestion[];
}

export interface CheatSheet {
  title: string;
  sections: { heading: string; items: string[] }[];
}

export type AIResult = Summary | FlashcardSet | Quiz | CheatSheet;

export async function extractText(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/extract-text", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to extract text");
  }

  const data = await res.json();
  return data.text;
}

export async function generateStudyContent(
  action: AIAction,
  text: string
): Promise<AIResult> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, text }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "AI request failed");
  }

  const data = await res.json();
  return data.result;
}
