import { useEffect, useRef, useState } from "react";
import { usePlaybackStore } from "@/stores/playback";
import type { Character } from "@/components/player/CharacterNarrator";

let globalSpeakId = 0;

const CHARACTER_SETTINGS = {
  batman:    { rate: 0.7,  pitch: 0.55 },
  spiderman: { rate: 1.1,  pitch: 1.35 },
  superman:  { rate: 0.85, pitch: 0.85 },
  none:      { rate: 0.78, pitch: 0.88 },
};

export function usePlayback(character: Character = "none") {
  const {
    script, status, currentStep,
    speed, narratingEnabled, nextStep,
  } = usePlaybackStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (status !== "playing" || !script) return;

    const step = script.steps[currentStep];
    if (!step) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    activeRef.current = true;

    globalSpeakId++;
    const myId = globalSpeakId;

    const { rate, pitch } = CHARACTER_SETTINGS[character] || CHARACTER_SETTINGS.none;
    const chars = step.narration.length;
    const speechMs = (chars / (rate * 11)) * 1000;
    const totalWait = (speechMs + 2000) / speed;

    if (narratingEnabled && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      timerRef.current = setTimeout(() => {
        if (myId !== globalSpeakId) return;

        const utterance = new SpeechSynthesisUtterance(step.narration);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const voice =
          voices.find((v) => v.name === "Google UK English Male") ||
          voices.find((v) => v.name === "Google US English") ||
          voices.find((v) => v.name.includes("Daniel")) ||
          voices.find((v) => v.name.includes("David")) ||
          voices.find((v) => v.lang === "en-US" && !v.localService) ||
          voices.find((v) => v.lang.startsWith("en"));

        if (voice) utterance.voice = voice;

        const resumeTimer = setInterval(() => {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        }, 500);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          clearInterval(resumeTimer);
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          clearInterval(resumeTimer);
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);

        timerRef.current = setTimeout(() => {
          clearInterval(resumeTimer);
          setIsSpeaking(false);
          if (myId !== globalSpeakId) return;
          if (activeRef.current) nextStep();
        }, totalWait);

      }, 600);

    } else {
      timerRef.current = setTimeout(() => {
        if (myId !== globalSpeakId) return;
        if (activeRef.current) nextStep();
      }, totalWait);
    }

    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, currentStep, script, speed, narratingEnabled, nextStep, character]);

  useEffect(() => {
    if (status === "paused" || status === "idle") {
      globalSpeakId++;
      activeRef.current = false;
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [status]);

  useEffect(() => {
    return () => {
      globalSpeakId++;
      activeRef.current = false;
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const currentStepData = script?.steps[currentStep] ?? null;
  const totalSteps = script?.steps.length ?? 0;
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;
  const activeLines = currentStepData
    ? Array.from(
        { length: currentStepData.line_end - currentStepData.line_start + 1 },
        (_, i) => currentStepData.line_start + i
      )
    : [];

  return { currentStepData, totalSteps, progress, activeLines, isSpeaking };
}