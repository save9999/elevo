"use client";
import { useState, useCallback, useRef } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// ── Paires minimales françaises classiques ────────────────────────────────
// Inspirées des tests ODEDYS et BALE
// La discrimination /p/-/b/, /t/-/d/, /k/-/g/, /s/-/z/, /f/-/v/, /ch/-/j/
// est un marqueur fort de trouble phonologique (précurseur dyslexie)

interface PhonemePair {
  word1: string;
  word2: string;
  phoneme: string;
  // For each trial: is it "same" or "different"?
  isSame: boolean;
}

const PAIRS: PhonemePair[] = [
  // Sourde/sonore occlusives
  { word1: "poule", word2: "boule", phoneme: "p/b", isSame: false },
  { word1: "pain", word2: "pain", phoneme: "p/b", isSame: true },
  { word1: "dent", word2: "tente", phoneme: "t/d", isSame: false },
  { word1: "tas", word2: "tas", phoneme: "t/d", isSame: true },
  { word1: "car", word2: "gare", phoneme: "k/g", isSame: false },
  { word1: "gare", word2: "gare", phoneme: "k/g", isSame: true },
  // Fricatives
  { word1: "sous", word2: "zou", phoneme: "s/z", isSame: false },
  { word1: "zoo", word2: "zoo", phoneme: "s/z", isSame: true },
  { word1: "fin", word2: "vin", phoneme: "f/v", isSame: false },
  { word1: "feu", word2: "feu", phoneme: "f/v", isSame: true },
  { word1: "chat", word2: "jatte", phoneme: "ch/j", isSame: false },
  { word1: "joue", word2: "joue", phoneme: "ch/j", isSame: true },
  // Liquides
  { word1: "rue", word2: "lune", phoneme: "r/l", isSame: false },
  { word1: "roue", word2: "roue", phoneme: "r/l", isSame: true },
  // Nasales
  { word1: "main", word2: "bain", phoneme: "m/b", isSame: false },
  { word1: "mot", word2: "mot", phoneme: "m/n", isSame: true },
];

interface PhonemeTestProps {
  ageGroup: string;
  onComplete: (result: {
    correct: number;
    total: number;
    accuracy: number;
    avgRT: number;
    difficulties: string[];
  }) => void;
}

// Speak a word using Web Speech API
function speak(word: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      // Find best French voice
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((v) => v.lang.startsWith("fr") && (v.name.includes("Amélie") || v.name.includes("Thomas") || v.name.includes("Virginie")))
        || voices.find((v) => v.lang.startsWith("fr"));
      if (frenchVoice) utterance.voice = frenchVoice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setTimeout(() => resolve(), 3000); // fallback timeout
    } catch {
      resolve();
    }
  });
}

export default function PhonemeTest({ ageGroup, onComplete }: PhonemeTestProps) {
  void ageGroup; // not used for now, all ages use same pairs
  const { play } = useSoundEffects();
  const [trialIdx, setTrialIdx] = useState(0);
  const [trials] = useState(() => [...PAIRS].sort(() => Math.random() - 0.5).slice(0, 10));
  const [phase, setPhase] = useState<"ready" | "listening" | "answering" | "feedback" | "done">("ready");
  const [answers, setAnswers] = useState<{ correct: boolean; rt: number; phoneme: string }[]>([]);
  const [playedBoth, setPlayedBoth] = useState(false);
  const trialStartRef = useRef<number>(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const currentPair = trials[trialIdx];

  const playPair = useCallback(async () => {
    if (!currentPair) return;
    setPhase("listening");
    setPlayedBoth(false);
    await speak(currentPair.word1);
    await new Promise((r) => setTimeout(r, 400));
    await speak(currentPair.word2);
    setPlayedBoth(true);
    setPhase("answering");
    trialStartRef.current = Date.now();
  }, [currentPair]);

  const handleAnswer = (userSaysSame: boolean) => {
    if (phase !== "answering") return;
    const rt = Date.now() - trialStartRef.current;
    const isCorrect = userSaysSame === currentPair.isSame;
    setFeedback(isCorrect ? "correct" : "wrong");
    play(isCorrect ? "correct" : "wrong");

    const newAnswers = [...answers, { correct: isCorrect, rt, phoneme: currentPair.phoneme }];
    setAnswers(newAnswers);
    setPhase("feedback");

    setTimeout(() => {
      setFeedback(null);
      if (trialIdx >= trials.length - 1) {
        setPhase("done");
        finish(newAnswers);
      } else {
        setTrialIdx((i) => i + 1);
        setPhase("ready");
        setPlayedBoth(false);
      }
    }, 1200);
  };

  const finish = (finalAnswers: typeof answers) => {
    const correct = finalAnswers.filter((a) => a.correct).length;
    const total = finalAnswers.length;
    const accuracy = Math.round((correct / total) * 100);
    const avgRT = Math.round(finalAnswers.reduce((a, b) => a + b.rt, 0) / total);
    // Identify difficulties: phoneme pairs where errors happened
    const errorPhonemes = finalAnswers.filter((a) => !a.correct).map((a) => a.phoneme);
    const difficulties = Array.from(new Set(errorPhonemes));

    onComplete({ correct, total, accuracy, avgRT, difficulties });
  };

  if (phase === "done") return null;

  return (
    <div className="space-y-4 p-5 bg-gradient-to-br from-violet-50 to-indigo-100 rounded-2xl border-2 border-violet-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800">Écoute les mots</h3>
          <p className="text-xs text-slate-500 font-semibold">{trialIdx + 1}/{trials.length}</p>
        </div>
        <div className="text-4xl">🎧</div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-white rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500" style={{ width: `${(trialIdx / trials.length) * 100}%` }} />
      </div>

      {/* Main action */}
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border-2 border-violet-100 min-h-[180px] flex flex-col items-center justify-center gap-3">
        {phase === "ready" && (
          <>
            <p className="text-sm text-slate-600 font-semibold">Tu vas entendre deux mots.<br />Sont-ils identiques ou différents ?</p>
            <button
              onClick={playPair}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
            >
              🔊 Écouter
            </button>
          </>
        )}

        {phase === "listening" && (
          <>
            <div className="flex gap-2 items-center">
              <span className="text-5xl animate-pulse">🔊</span>
            </div>
            <p className="text-sm text-slate-500 font-semibold">Écoute attentivement...</p>
          </>
        )}

        {phase === "answering" && playedBoth && (
          <>
            <p className="text-sm text-slate-600 font-bold mb-2">Les deux mots sont :</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => handleAnswer(true)}
                className="py-4 rounded-2xl bg-green-50 hover:bg-green-100 border-2 border-green-300 font-black text-green-700 text-lg active:scale-95 transition-transform"
              >
                ✓ Pareils
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="py-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 font-black text-orange-700 text-lg active:scale-95 transition-transform"
              >
                ✗ Différents
              </button>
            </div>
            <button
              onClick={playPair}
              className="text-xs text-slate-500 font-semibold underline mt-2"
            >
              🔁 Réécouter
            </button>
          </>
        )}

        {phase === "feedback" && feedback && (
          <>
            <div className="text-6xl">{feedback === "correct" ? "✓" : "✗"}</div>
            <p className={`text-lg font-black ${feedback === "correct" ? "text-green-600" : "text-red-500"}`}>
              {feedback === "correct" ? "Bravo !" : "Pas tout à fait..."}
            </p>
            <p className="text-xs text-slate-500">
              Les mots : <span className="font-bold">{currentPair.word1}</span> / <span className="font-bold">{currentPair.word2}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
