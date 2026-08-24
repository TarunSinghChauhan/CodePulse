import { describe, it, expect } from "vitest";
import { detectLanguage } from "../detectLanguage";

describe("detectLanguage", () => {
  it("detects Python from def", () => {
    expect(detectLanguage("def foo():\n    pass")).toBe("python");
  });

  it("detects JavaScript from arrow function", () => {
    expect(detectLanguage("const foo = () => {}")).toBe("javascript");
  });

  it("detects JavaScript from function keyword", () => {
    expect(detectLanguage("function foo() {}")).toBe("javascript");
  });

  it("detects Java from public class", () => {
    expect(detectLanguage("public class Main {}")).toBe("java");
  });

  it("detects Rust from fn and arrow", () => {
    expect(detectLanguage("fn main() -> i32 { 0 }")).toBe("rust");
  });

  it("detects Go from package main", () => {
    expect(detectLanguage("package main\nfunc main() {}")).toBe("go");
  });

  it("returns plaintext for unrecognized code", () => {
    expect(detectLanguage("some random text")).toBe("plaintext");
  });

  it("does not misclassify python 'from X import Y' as ambiguous plain import", () => {
    expect(detectLanguage("from math import sqrt")).toBe("plaintext");
  });
});
