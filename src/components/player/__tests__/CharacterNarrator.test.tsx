import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CharacterNarrator } from "../CharacterNarrator";

describe("CharacterNarrator", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the 'add narrator' button when character is 'none'", () => {
    render(
      <CharacterNarrator character="none" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={false} />
    );
    expect(screen.getByText("+ Add narrator character")).toBeInTheDocument();
  });

  it("clicking the add-narrator button opens the picker modal", () => {
    render(
      <CharacterNarrator character="none" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={false} />
    );
    fireEvent.click(screen.getByText("+ Add narrator character"));
    expect(screen.getByText("Choose your narrator")).toBeInTheDocument();
  });

  it("shows the selected character's name tag instead of the add button", () => {
    render(
      <CharacterNarrator character="batman" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={false} />
    );
    expect(screen.queryByText("+ Add narrator character")).not.toBeInTheDocument();
    expect(screen.getAllByText("Batman").length).toBeGreaterThan(0);
  });

  it("shows the speech bubble with narration text when speaking", () => {
    render(
      <CharacterNarrator
        character="spiderman"
        onCharacterChange={vi.fn()}
        currentNarration="With great power comes great responsibility."
        isSpeaking={true}
      />
    );
    expect(screen.getByText(/With great power/)).toBeInTheDocument();
  });

  it("does not show the speech bubble when not speaking", () => {
    render(
      <CharacterNarrator character="spiderman" onCharacterChange={vi.fn()} currentNarration="Some narration" isSpeaking={false} />
    );
    expect(screen.queryByText("Some narration")).not.toBeInTheDocument();
  });

  it("does not show the speech bubble when speaking but narration is empty", () => {
    render(
      <CharacterNarrator character="superman" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={true} />
    );
    expect(screen.getAllByText("Superman").length).toBeGreaterThan(0);
  });

  it("clicking the avatar opens the picker modal", () => {
    const { container } = render(
      <CharacterNarrator character="batman" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={false} />
    );
    const avatar = container.querySelector("svg")!.parentElement!;
    fireEvent.click(avatar);
    expect(screen.getByText("Choose your narrator")).toBeInTheDocument();
  });

  it("selecting a character in the picker calls onCharacterChange", async () => {
    const onCharacterChange = vi.fn();
    render(
      <CharacterNarrator character="none" onCharacterChange={onCharacterChange} currentNarration="" isSpeaking={false} />
    );
    fireEvent.click(screen.getByText("+ Add narrator character"));
    fireEvent.click(screen.getByText("Superman"));
    expect(onCharacterChange).toHaveBeenCalledWith("superman");
    await waitFor(() => {
      expect(screen.queryByText("Choose your narrator")).not.toBeInTheDocument();
    });
  });

  it("'Remove character' button calls onCharacterChange with 'none'", async () => {
    const onCharacterChange = vi.fn();
    const { container } = render(
      <CharacterNarrator character="batman" onCharacterChange={onCharacterChange} currentNarration="" isSpeaking={false} />
    );
    const avatar = container.querySelector("svg")!.parentElement!;
    fireEvent.click(avatar);
    fireEvent.click(screen.getByText("Remove character"));
    expect(onCharacterChange).toHaveBeenCalledWith("none");
    await waitFor(() => {
      expect(screen.queryByText("Choose your narrator")).not.toBeInTheDocument();
    });
  });

  it("clicking the modal backdrop closes the picker without changing character", async () => {
    const onCharacterChange = vi.fn();
    render(
      <CharacterNarrator character="none" onCharacterChange={onCharacterChange} currentNarration="" isSpeaking={false} />
    );
    fireEvent.click(screen.getByText("+ Add narrator character"));
    const card = screen.getByText("Choose your narrator").parentElement!;
    const backdrop = card.parentElement!;
    fireEvent.click(backdrop);
    expect(onCharacterChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText("Choose your narrator")).not.toBeInTheDocument();
    });
  });

  it("clicking inside the modal card does not close the picker (stopPropagation)", () => {
    render(
      <CharacterNarrator character="none" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={false} />
    );
    fireEvent.click(screen.getByText("+ Add narrator character"));
    const card = screen.getByText("Choose your narrator").parentElement!;
    fireEvent.click(card);
    expect(screen.getByText("Choose your narrator")).toBeInTheDocument();
  });

  it("toggles mouth-open state on an interval while speaking with a character selected", () => {
    vi.useFakeTimers();
    render(
      <CharacterNarrator character="batman" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={true} />
    );
    vi.advanceTimersByTime(1000);
    expect(screen.getAllByText("Batman").length).toBeGreaterThan(0);
  });

  it("clears the mouth interval when isSpeaking becomes false", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <CharacterNarrator character="batman" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={true} />
    );
    vi.advanceTimersByTime(200);
    rerender(
      <CharacterNarrator character="batman" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={false} />
    );
    vi.advanceTimersByTime(500);
    expect(screen.getAllByText("Batman").length).toBeGreaterThan(0);
  });

  it("does not run the mouth interval when character is 'none', even if isSpeaking is true", () => {
    vi.useFakeTimers();
    render(
      <CharacterNarrator character="none" onCharacterChange={vi.fn()} currentNarration="" isSpeaking={true} />
    );
    vi.advanceTimersByTime(500);
    expect(screen.getByText("+ Add narrator character")).toBeInTheDocument();
  });
});
