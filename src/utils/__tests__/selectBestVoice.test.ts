import { describe, it, expect } from "vitest";
import { selectBestVoice } from "../playbackCalc";

const v = (name: string, lang: string, localService = false) => ({ name, lang, localService });

describe("selectBestVoice", () => {
  it("prefers Google UK English Male above all", () => {
    const voices = [v("Random", "en-US"), v("Google UK English Male", "en-GB"), v("Daniel", "en-US")];
    expect(selectBestVoice(voices)?.name).toBe("Google UK English Male");
  });

  it("falls back to Google US English if UK not present", () => {
    const voices = [v("Random", "en-US"), v("Google US English", "en-US")];
    expect(selectBestVoice(voices)?.name).toBe("Google US English");
  });

  it("falls back to a name containing Daniel", () => {
    const voices = [v("Some Daniel Voice", "en-GB")];
    expect(selectBestVoice(voices)?.name).toBe("Some Daniel Voice");
  });

  it("falls back to non-local en-US voice", () => {
    const voices = [v("Local Voice", "en-US", true), v("Cloud Voice", "en-US", false)];
    expect(selectBestVoice(voices)?.name).toBe("Cloud Voice");
  });

  it("falls back to any english voice as last resort", () => {
    const voices = [v("Some Voice", "en-AU")];
    expect(selectBestVoice(voices)?.name).toBe("Some Voice");
  });

  it("returns undefined when no voices match", () => {
    const voices = [v("French Voice", "fr-FR")];
    expect(selectBestVoice(voices)).toBeUndefined();
  });
});
