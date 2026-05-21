"use client";

import { useState } from "react";
import { Material } from "@/types";
import { getFileBlob } from "@/lib/fileStorage";
import {
  extractText,
  generateStudyContent,
  AIAction,
  AIResult,
  Summary,
  FlashcardSet,
  Quiz,
  CheatSheet,
} from "@/lib/aiService";
import {
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  FileText,
  ChevronLeft,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface StudyToolsProps {
  material: Material;
  onClose: () => void;
}

type Tab = AIAction | null;

export default function StudyTools({ material, onClose }: StudyToolsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Partial<Record<AIAction, AIResult>>>(
    {}
  );
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  async function getText(): Promise<string> {
    if (extractedText) return extractedText;
    const blob = await getFileBlob(material.id, material.type);
    if (!blob) throw new Error("File not found");
    const text = await extractText(blob, material.name);
    setExtractedText(text);
    return text;
  }

  async function handleAction(action: AIAction) {
    setActiveTab(action);
    if (results[action]) return;

    setLoading(true);
    setError(null);
    try {
      const text = await getText();
      const result = await generateStudyContent(action, text);
      setResults((prev) => ({ ...prev, [action]: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggleFlip(index: number) {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const tabs: { action: AIAction; label: string; icon: typeof Sparkles }[] = [
    { action: "summarize", label: "Summary", icon: Sparkles },
    { action: "flashcards", label: "Flashcards", icon: Layers },
    { action: "quiz", label: "Quiz", icon: HelpCircle },
    { action: "cheatsheet", label: "Cheat Sheet", icon: FileText },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/60 rounded-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <BookOpen className="w-4 h-4 text-indigo-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {material.name}
          </p>
          <p className="text-xs text-gray-500">AI Study Tools</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        {tabs.map(({ action, label, icon: Icon }) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === action
                ? "text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {!activeTab && (
          <div className="text-center py-8 text-gray-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-300" />
            <p className="text-sm">
              Select a study tool above to get started
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 mx-auto mb-2 text-indigo-500 animate-spin" />
            <p className="text-sm text-gray-500">
              Analyzing your lecture materials...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={() => {
                if (activeTab) {
                  setResults((prev) => {
                    const next = { ...prev };
                    delete next[activeTab];
                    return next;
                  });
                  handleAction(activeTab);
                }
              }}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && activeTab === "summarize" && results.summarize && (
          <SummaryView data={results.summarize as Summary} />
        )}

        {!loading &&
          !error &&
          activeTab === "flashcards" &&
          results.flashcards && (
            <FlashcardsView
              data={results.flashcards as FlashcardSet}
              flippedCards={flippedCards}
              onFlip={toggleFlip}
            />
          )}

        {!loading && !error && activeTab === "quiz" && results.quiz && (
          <QuizView
            data={results.quiz as Quiz}
            answers={quizAnswers}
            setAnswers={setQuizAnswers}
            showResults={showQuizResults}
            setShowResults={setShowQuizResults}
          />
        )}

        {!loading &&
          !error &&
          activeTab === "cheatsheet" &&
          results.cheatsheet && (
            <CheatSheetView data={results.cheatsheet as CheatSheet} />
          )}
      </div>
    </div>
  );
}

function SummaryView({ data }: { data: Summary }) {
  return (
    <div className="space-y-4">
      {data.title && (
        <h3 className="font-semibold text-gray-900">{data.title}</h3>
      )}

      {data.keyPoints?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Key Points
          </h4>
          <ul className="space-y-1.5">
            {data.keyPoints.map((point, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-gray-700"
              >
                <span className="text-indigo-500 mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.concepts?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Key Concepts
          </h4>
          <div className="space-y-2">
            {data.concepts.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <span className="font-medium text-sm text-gray-900">
                  {c.term}
                </span>
                <p className="text-sm text-gray-600 mt-0.5">{c.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.importantFormulas && data.importantFormulas.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Important Formulas
          </h4>
          <div className="bg-amber-50 rounded-lg p-3 space-y-1">
            {data.importantFormulas.map((f, i) => (
              <p key={i} className="text-sm font-mono text-amber-800">
                {f}
              </p>
            ))}
          </div>
        </div>
      )}

      {data.studyTips && data.studyTips.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Study Tips
          </h4>
          <ul className="space-y-1">
            {data.studyTips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-600">
                💡 {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FlashcardsView({
  data,
  flippedCards,
  onFlip,
}: {
  data: FlashcardSet;
  flippedCards: Set<number>;
  onFlip: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Click a card to flip it ({data.flashcards.length} cards)
      </p>
      {data.flashcards.map((card, i) => (
        <button
          key={i}
          onClick={() => onFlip(i)}
          className="w-full text-left bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-indigo-400">
              #{i + 1}
            </span>
            <span className="text-xs text-gray-400">
              {flippedCards.has(i) ? "Answer" : "Question"}
            </span>
          </div>
          <p className="text-sm text-gray-800 mt-2">
            {flippedCards.has(i) ? card.back : card.front}
          </p>
        </button>
      ))}
    </div>
  );
}

function QuizView({
  data,
  answers,
  setAnswers,
  showResults,
  setShowResults,
}: {
  data: Quiz;
  answers: Record<number, string>;
  setAnswers: (a: Record<number, string>) => void;
  showResults: boolean;
  setShowResults: (v: boolean) => void;
}) {
  const total = data.quiz.length;
  const answered = Object.keys(answers).length;

  function getScore() {
    let correct = 0;
    data.quiz.forEach((q, i) => {
      if (q.type === "multiple_choice") {
        if (answers[i]?.charAt(0) === q.correct?.charAt(0)) correct++;
      } else {
        const userAnswer = (answers[i] || "").toLowerCase().trim();
        const expected = (q.answer || "").toLowerCase().trim();
        if (userAnswer && expected.includes(userAnswer)) correct++;
      }
    });
    return correct;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {answered}/{total} answered
        </p>
        {answered > 0 && (
          <button
            onClick={() => setShowResults(!showResults)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showResults ? "Hide results" : "Check answers"}
          </button>
        )}
      </div>

      {showResults && (
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-indigo-700">
            {getScore()}/{total} correct
          </p>
        </div>
      )}

      {data.quiz.map((q, i) => {
        const isCorrect =
          q.type === "multiple_choice"
            ? answers[i]?.charAt(0) === q.correct?.charAt(0)
            : (answers[i] || "").toLowerCase().trim() ===
              (q.answer || "").toLowerCase().trim();

        return (
          <div
            key={i}
            className="bg-gray-50 rounded-lg p-4 space-y-2"
          >
            <div className="flex gap-2">
              <span className="text-xs font-medium text-gray-400 mt-0.5">
                Q{i + 1}
              </span>
              <p className="text-sm text-gray-800 flex-1">{q.question}</p>
              {showResults && answers[i] && (
                <span>
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </span>
              )}
            </div>

            {q.type === "multiple_choice" && q.options && (
              <div className="space-y-1 ml-6">
                {q.options.map((opt, j) => {
                  const letter = opt.charAt(0);
                  const selected = answers[i]?.charAt(0) === letter;
                  return (
                    <button
                      key={j}
                      onClick={() =>
                        setAnswers({ ...answers, [i]: letter })
                      }
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                        selected
                          ? showResults
                            ? isCorrect
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                            : "bg-indigo-100 text-indigo-800 border border-indigo-300"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "short_answer" && (
              <div className="ml-6">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={answers[i] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [i]: e.target.value })
                  }
                  className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    showResults && answers[i]
                      ? isCorrect
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              </div>
            )}

            {showResults && answers[i] && (
              <p className="text-xs text-gray-500 ml-6 mt-1">
                {!isCorrect && (
                  <span className="text-red-600 font-medium">
                    Correct: {q.correct || q.answer}
                    {" — "}
                  </span>
                )}
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CheatSheetView({ data }: { data: CheatSheet }) {
  return (
    <div className="space-y-4">
      {data.title && (
        <h3 className="font-semibold text-gray-900">{data.title}</h3>
      )}
      {data.sections.map((section, i) => (
        <div key={i}>
          <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1.5">
            {section.heading}
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <ul className="space-y-1">
              {section.items.map((item, j) => (
                <li key={j} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-400">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
