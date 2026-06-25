import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

const SYSTEM_INSTRUCTION =
  "You are an expert prompt engineer who writes structured prompts for Claude Code (an agentic AI coding assistant). Convert the developer's rough description into a single ready-to-paste Claude Code prompt with these sections: ## TASK (one clear line), ## CONTEXT (tech stack and files if mentioned), ## PROBLEM (precise description), ## REQUIREMENTS (numbered list), ## EXPECTED OUTCOME (what done looks like). Be direct and technical. No code blocks, no commentary outside the sections.";

const TASK_TYPE_LABELS: Record<string, string> = {
  idea: "New Project Idea",
  bug: "Bug Fix",
  feature: "New Feature",
  refactor: "Refactor",
  ui: "UI / Design",
  performance: "Performance Optimization",
  api: "API / Backend",
  auth: "Authentication",
  db: "Database",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problem, context, taskType } = body as {
      problem: string;
      context: string;
      taskType: string;
    };

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not set." },
        { status: 500 }
      );
    }

    if (!problem || problem.trim().length === 0) {
      return NextResponse.json(
        { error: "Problem description is required." },
        { status: 400 }
      );
    }

    const taskLabel = TASK_TYPE_LABELS[taskType] ?? taskType;

    const userMessage = `Task Type: ${taskLabel}\n\nProblem / Task:\n${problem.trim()}${
      context && context.trim() ? `\n\nExtra Context:\n${context.trim()}` : ""
    }`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "Gemini API request failed." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "No output from Gemini API." },
        { status: 502 }
      );
    }

    return NextResponse.json({ prompt: text });
  } catch (err) {
    console.error("generate-prompt error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
