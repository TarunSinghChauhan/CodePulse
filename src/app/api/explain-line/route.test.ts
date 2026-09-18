import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/explain-line", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/explain-line", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns explanation JSON on success", async () => {
    const fakeExplanation = {
      line_number: 3,
      what_it_does: "Sets x to 1.",
      why_it_exists: "Needed for the loop.",
    };
    (global.fetch as any).mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(fakeExplanation) } }],
      }),
    });

    const res = await POST(
      makeRequest({ code: "x = 1", lineNumber: 3, lineText: "x = 1", variableStates: [] })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.explanation).toEqual(fakeExplanation);
  });

  it("strips markdown code fences before parsing", async () => {
    const fakeExplanation = { line_number: 1, what_it_does: "Fenced response." };
    const fenced = "```json\n" + JSON.stringify(fakeExplanation) + "\n```";
    (global.fetch as any).mockResolvedValue({
      json: async () => ({ choices: [{ message: { content: fenced } }] }),
    });

    const res = await POST(
      makeRequest({ code: "y = 2", lineNumber: 1, lineText: "y = 2", variableStates: [] })
    );
    const body = await res.json();
    expect(body.explanation).toEqual(fakeExplanation);
  });

  it("returns 500 when the AI response is not valid JSON", async () => {
    (global.fetch as any).mockResolvedValue({
      json: async () => ({
        choices: [{ message: { content: "not json {" } }],
      }),
    });

    const res = await POST(
      makeRequest({ code: "z = 3", lineNumber: 1, lineText: "z = 3", variableStates: [] })
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to explain line");
  });

  it("returns 500 when fetch itself throws", async () => {
    (global.fetch as any).mockRejectedValue(new Error("network down"));

    const res = await POST(
      makeRequest({ code: "z = 3", lineNumber: 1, lineText: "z = 3", variableStates: [] })
    );
    expect(res.status).toBe(500);
  });
});
