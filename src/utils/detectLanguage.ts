export function detectLanguage(code: string): string {
  if (code.includes("def ") || (code.includes("import ") && !code.includes("from ")))
    return "python";
  if (code.includes("function ") || code.includes("const ") || code.includes("=>"))
    return "javascript";
  if (code.includes("public class") || code.includes("System.out"))
    return "java";
  if (code.includes("fn ") && code.includes("->")) return "rust";
  if (code.includes("package main") || code.includes("func ")) return "go";
  return "plaintext";
}
