import { NextRequest, NextResponse } from "next/server";
import { ExecutionScript } from "@/types/codepulse";

const OPENROUTER_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT = `You are CodePulse Engine — an AI that transforms any code into a cinematic, step-by-step execution walkthrough.

Your job is to think like a senior engineer narrating a documentary about code. You do not summarize. You walk through the code exactly as a CPU would execute it — line by line — while explaining WHY each line exists, what it does to memory and state, and what a beginner would miss.

Your tone: confident, clear, slightly dramatic like a nature documentary narrator. Never condescending. Always specific — reference actual variable names, values, line numbers.

CRITICAL: You always return valid JSON only. Never return markdown, prose, or explanation outside the JSON. Your entire response must be parseable by JSON.parse().`;

function buildUserPrompt(code: string, language: string): string {
  return `Analyze the following code and return a complete CodePulse execution script as JSON.

CODE TO ANALYZE:
"""
${code}
"""

DETECTED LANGUAGE: ${language}

Return ONLY this exact JSON structure — no markdown, no explanation, no code fences:

{
  "language": "python",
  "title": "Short descriptive title (max 8 words)",
  "summary": "One sentence explaining what this code does overall.",
  "complexity": "beginner",
  "estimated_duration_seconds": 45,
  "variables": [
    { "name": "var_name", "type": "int", "color": "purple" }
  ],
  "steps": [
    {
      "step_id": 1,
      "line_start": 1,
      "line_end": 1,
      "highlight_type": "declare",
      "narration": "Cinematic narration text — 1-3 dramatic but clear sentences. Reference actual variable names and values.",
      "explanation": "Technical explanation — 1-2 precise sentences shown as subtitle.",
      "variable_states": [
        { "name": "var_name", "value": "actual_value", "changed": true, "change_type": "created" }
      ],
      "call_stack": ["main"],
      "memory_note": "Optional memory note or empty string.",
      "pause_after_ms": 800
    }
  ],
  "concepts": [
    { "name": "loops", "explanation": "Plain English explanation as demonstrated here.", "line_references": [3] }
  ],
  "explain_levels": {
    "eli5": "Explain using a real-world physical analogy. Max 3 sentences.",
    "intermediate": "For someone who knows basic programming. Max 4 sentences.",
    "senior": "Design decisions, tradeoffs, edge cases. Max 5 sentences."
  },
  "break_mode": {
    "bug_description": "Description of the bug being injected",
    "line_to_modify": 3,
    "original_line": "original code on that line",
    "buggy_line": "same line with deliberate bug",
    "bug_type": "off_by_one",
    "failure_point_step": 5,
    "failure_narration": "Dramatic narration of the moment it breaks. 2-3 sentences.",
    "fix_explanation": "Clear explanation of what went wrong and the one-line fix."
  },
  "share_metadata": {
    "og_title": "Title for social sharing",
    "og_description": "Max 120 chars description",
    "tags": ["python"]
  }
}

RULES:
- steps must cover EVERY line — nothing skipped
- Return ONLY the JSON — nothing else
- No triple backticks anywhere`;
}

function extractJSON(raw: string): string {
  const cleaned = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/```\s*$/im, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return cleaned.slice(start, end + 1);
}

async function callGroq(code: string, language: string): Promise<ExecutionScript> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(code, language) },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw: string = data.choices[0].message.content;
  const jsonStr = extractJSON(raw);
  return JSON.parse(jsonStr) as ExecutionScript;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, language = "auto" } = body as { code: string; language?: string };

    if (!code || code.trim().length < 3) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const script = await callGroq(code, language);
    return NextResponse.json({ script }, { status: 200 });

  } catch (error) {
    console.error("[/api/analyze]", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}