import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/analyze", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns 400 when code is missing", async () => {
    const res = await POST(makeRequest({ code: "" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("No code provided");
  });

  it("returns 400 when code is too short", async () => {
    const res = await POST(makeRequest({ code: "ab" }));
    expect(res.status).toBe(400);
  });

  it("returns 200 with parsed script on success", async () => {
    const fakeScript = { language: "python", title: "Test", steps: [] };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(fakeScript) } }],
      }),
    });

    const res = await POST(makeRequest({ code: "print('hi')", language: "python" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.script).toEqual(fakeScript);
  });

  it("strips markdown code fences before parsing JSON", async () => {
    const fakeScript = { language: "python", title: "Fenced", steps: [] };
    const fenced = "```json\n" + JSON.stringify(fakeScript) + "\n```";
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: fenced } }] }),
    });

    const res = await POST(makeRequest({ code: "x = 1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.script).toEqual(fakeScript);
  });

  it("returns 500 when the Groq API call fails", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "service unavailable",
    });

    const res = await POST(makeRequest({ code: "x = 1" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Analysis failed. Please try again.");
  });

  it("returns 502 when the AI response is not valid JSON", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "{not valid json}" } }],
      }),
    });

    const res = await POST(makeRequest({ code: "x = 1" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("AI returned invalid JSON. Please try again.");
  });

  it("returns 500 when AI response has an opening brace but no closing brace", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "{ this never closes" } }],
      }),
    });

    const res = await POST(makeRequest({ code: "x = 1" }));
    expect(res.status).toBe(500);
  });
});