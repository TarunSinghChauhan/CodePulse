// ============================================================
// POST /api/explain-line
// User clicks a line → deep dive explanation
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { LineExplanation, VariableState } from "@/types/codepulse";

const OPENROUTER_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  try {
    const { code, lineNumber, lineText, variableStates } = await req.json() as {
      code: string;
      lineNumber: number;
      lineText: string;
      variableStates: VariableState[];
    };

    const prompt = `The user clicked on line ${lineNumber} of this code:

FULL CODE:
"""
${code}
"""

CLICKED LINE:
"${lineText}"

CURRENT VARIABLE STATES AT THIS POINT:
${JSON.stringify(variableStates, null, 2)}

Return ONLY this JSON — no markdown, no prose:

{
  "line_number": ${lineNumber},
  "what_it_does": "2-3 sentences. Specific about values and effects.",
  "why_it_exists": "Why this line is necessary. What breaks if you remove it. 1-2 sentences.",
  "what_if_changed": "What happens if this line was changed or removed. 2 sentences.",
  "related_concept": "Name of the programming concept this line demonstrates.",
  "concept_explanation": "Plain English explanation of that concept in 2 sentences.",
  "common_mistake": "Most common mistake beginners make with this type of line. 1 sentence.",
  "equivalent_in": {
    "javascript": "equivalent JS code",
    "java": "equivalent Java code",
    "rust": "equivalent Rust code"
  }
}`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
  Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  "Content-Type": "application/json",
},
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const raw = data.choices[0].message.content
      .replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    const explanation = JSON.parse(raw) as LineExplanation;
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("[/api/explain-line]", error);
    return NextResponse.json({ error: "Failed to explain line" }, { status: 500 });
  }
}
