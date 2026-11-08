# CodePulse

Paste code, press play, and watch it run: CodePulse asks an LLM to turn any snippet into a step-by-step execution walkthrough, then plays it back with a highlighted editor, a live variable tracker, a call stack and spoken narration.

## What it does

- **Execution walkthrough.** `POST /api/analyze` sends the code to a Llama model on Groq and gets back a structured script: a title, a summary, the variables with their types, and a list of steps. Each step has the lines it covers, a highlight type (declare, loop, condition, return, ...), a narration, a technical explanation, the variable values after the step, and the call stack.
- **Playback.** Play, pause, step back and forward, seek on the progress bar, and four speeds. The editor (Monaco) highlights the current lines as the walkthrough moves.
- **Spoken narration** through the browser's Web Speech API, with an optional animated narrator character (Batman, Spiderman or Superman) that can be switched on and off.
- **Three explanation levels** for the same code: ELI5, intermediate and senior.
- **Click any line** for a deeper explanation (`POST /api/explain-line`): what it does, why it exists, what happens if it changes, the underlying concept, a common beginner mistake, and the same idea in other languages.
- **Break mode.** Each script includes a plausible bug in the code (off-by-one, wrong operator, and so on) that playback can switch to and explain.
- Four built-in demos: bubble sort, Fibonacci, binary search and palindrome.

## Honest limitations

- The walkthrough is **written by an LLM, not produced by executing your code**. Variable values and the order of steps can be wrong, especially for long or unusual programs. Treat it as a guided explanation, not a debugger.
- Language detection is a keyword heuristic (`src/utils/detectLanguage.ts`); it can guess wrong for short snippets.
- Narration quality depends on the voices installed in your browser.

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # then put your Groq key in GROQ_API_KEY
npm run dev                        # http://localhost:3000
```

A free Groq API key is enough: https://console.groq.com/keys

## Tests

```bash
npm test                      # vitest run
npx vitest run --coverage     # with coverage
```

The suite has 158 tests (Vitest, Testing Library, jsdom) covering the playback store, the playback hook, every player component, the editor wrapper, both API routes (with `fetch` mocked, so no key is needed) and the utility functions. Current coverage: 100% of lines and functions, 99% of statements and 95% of branches. The uncovered branches are the Monaco editor internals and the exact timing of speech callbacks.

## Stack

Next.js 14 (App Router), React 18, TypeScript, Zustand, Monaco Editor, Framer Motion, Tailwind CSS, Groq (Llama 4 Scout for walkthroughs, Llama 3.3 70B for line explanations).

## Project layout

```
src/app/api/analyze/       walkthrough generation (LLM call, JSON extraction, validation)
src/app/api/explain-line/  single-line deep dive
src/components/editor/     Monaco editor with step highlighting
src/components/player/     controls, variable tracker, narration overlay, narrator, break mode
src/hooks/usePlayback.ts   timing, speech synthesis and step advancement
src/stores/playback.ts     Zustand store for the walkthrough and playback state
src/types/codepulse.ts     the ExecutionScript type everything is built around
src/utils/                 timing, seeking, language detection and formatting helpers
```
