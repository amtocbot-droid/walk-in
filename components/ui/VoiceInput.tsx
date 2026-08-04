"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { trackEvent } from "@/lib/telemetry";

declare global {
  interface Window {
    webkitSpeechRecognition?: typeof SpeechRecognition;
    SpeechRecognition?: typeof SpeechRecognition;
  }
}

export default function VoiceInput({ onResult }: { onResult?: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }, []);

  const handleResult = useCallback(
    (text: string) => {
      if (!text) return;
      trackEvent("voice.result", { transcript: text });
      onResult?.(text);
    },
    [onResult]
  );

  const start = () => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      finalTranscriptRef.current = "";
      trackEvent("voice.start");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interim += transcript;
        }
      }
      setTranscript(finalTranscriptRef.current || interim);
    };

    recognition.onend = () => {
      setListening(false);
      const final = finalTranscriptRef.current.trim();
      if (final) {
        setTranscript(final);
        handleResult(final);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.start();
  };

  if (!supported) return null;

  return (
    <button
      onClick={start}
      className={`flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-white shadow-lg backdrop-blur transition-colors ${
        listening ? "bg-red-500/90 animate-pulse" : "bg-slate-800/80 hover:bg-slate-700/80"
      }`}
      aria-label="Voice search"
    >
      <span>{listening ? "🎙 Listening…" : "🎤 Voice"}</span>
      {transcript && !listening && (
        <span className="max-w-[10rem] truncate text-slate-300">{transcript}</span>
      )}
    </button>
  );
}
