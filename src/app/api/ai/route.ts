import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const PROMPTS = {
  summarize: `Analyze these lecture notes/slides and create a concise study summary. Format your response as JSON:
{
  "title": "Topic title",
  "keyPoints": ["point 1", "point 2", ...],
  "concepts": [{"term": "term", "definition": "definition"}, ...],
  "importantFormulas": ["formula 1", ...],
  "studyTips": ["tip 1", ...]
}
Only include sections that are relevant. Keep key points clear and actionable.`,

  flashcards: `Create study flashcards from these lecture notes/slides. Format your response as JSON:
{
  "flashcards": [
    {"front": "question or term", "back": "answer or definition"},
    ...
  ]
}
Create 8-15 flashcards covering the most important concepts. Make questions specific and answers concise.`,

  quiz: `Generate a practice quiz from these lecture notes/slides. Format your response as JSON:
{
  "quiz": [
    {
      "question": "question text",
      "type": "multiple_choice",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": "A",
      "explanation": "brief explanation"
    },
    {
      "question": "question text",
      "type": "short_answer",
      "answer": "expected answer",
      "explanation": "brief explanation"
    }
  ]
}
Create 8-12 questions mixing multiple choice and short answer. Cover key concepts from the material.`,

  cheatsheet: `Create a compact cheat sheet from these lecture notes/slides. Format your response as JSON:
{
  "title": "Cheat Sheet: Topic",
  "sections": [
    {
      "heading": "Section name",
      "items": ["concise point 1", "concise point 2", ...]
    }
  ]
}
Keep it dense and exam-focused. Include formulas, definitions, key relationships, and common pitfalls. Organize by topic.`,
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { action, text } = await request.json();

    if (!action || !text) {
      return Response.json(
        { error: "Missing action or text" },
        { status: 400 }
      );
    }

    const prompt = PROMPTS[action as keyof typeof PROMPTS];
    if (!prompt) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      prompt,
      `\n\nHere is the lecture content:\n\n${text}`,
    ]);

    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json({ result: parsed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
