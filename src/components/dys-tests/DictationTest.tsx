"use client";
import { useState, useRef, useCallback } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// ── Dictée de mots pour dépister la dysorthographie ────────────────────
// Mélange de mots réguliers (phonologie normale) et irréguliers
// (mémorisation orthographique requise).
// Les erreurs phono vs lexicales renseignent différemment.

interface DictationWord {
  word: string;
  type: "regular" | "irregular";
  phonemes: string; // approximation phonétique simple
}

const WORDS_BY_AGE: Record<string, DictationWord[]> = {
  maternelle: [
    { word: "ami", type: "regular", phonemes: "a-mi" },
    { word: "chat", type: "irregular", phonemes: "cha" },
    { word: "loup", type: "irregular", phonemes: "lou" },
    { word: "rue", type: "regular", phonemes: "ru" },
    { word: "lune", type: "regular", phonemes: "lune" },
    { word: "pain", type: "irregular", phonemes: "pin" },
  ],
  primaire: [
    { word: "ballon", type: "regular", phonemes: "ba-lon" },
    { word: "femme", type: "irregular", phonemes: "fam" },
    { word: "oignon", type: "irregular", phonemes: "o-gnon" },
    { word: "bonjour", type: "regular", phonemes: "bon-jour" },
    { word: "ensemble", type: "regular", phonemes: "en-sem-ble" },
    { word: "éléphant", type: "irregular", phonemes: "é-lé-fan" },
    { word: "monsieur", type: "irregular", phonemes: "me-sieu" },
    { word: "beaucoup", type: "irregular", phonemes: "bo-cou" },
  ],
  "college-lycee": [
    { word: "phénoménal", type: "irregular", phonemes: "fé-no-mé-nal" },
    { word: "apprentissage", type: "regular", phonemes: "a-pren-ti-ssa-ge" },
    { word: "orthographe", type: "regular", phonemes: "or-to-graf" },
    { word: "aujourd'hui", type: "irregular", phonemes: "o-jour-di" },
    { word: "géographie", type: "regular", phonemes: "jé-o-gra-fi" },
    { word: "paysage", type: "irregular", phonemes: "pé-i-zaj" },
    { word: "intelligent", type: "regular", phonemes: "in-tè-li-jan" },
    { word: "parallèle", type: "regular", phonemes: "pa-ra-lèl" },
  ],
};

interface DictationTestProps {
  ageGroup: string;
  onComplete: (result: {
    totalWords: number;
    orthographicCorrect: number;  // perfect spelling
    phoneticCorrect: number;       // phonologically correct
    avgTimePerWord: number;
    regularErrors: number;
    irregularErrors: number;
  }) => void;
}

function speak(word: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "fr-FR";
      utterance.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find((v) => v.lang.startsWith("fr") && (v.name.includes("Amélie") || v.name.includes("Thomas")))
        || voices.find((v) => v.lang.startsWith("fr"));
      if (frenchVoice) utterance.voice = frenchVoice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setTimeout(() => resolve(), 3000);
    } catch {
      resolve();
    }
  });
}

// Simple phonetic similarity: normalize and compare
function phoneticMatch(user: string, target: string): boolean {
  const normalize = (s: string) => s.toLowerCase()
    .replace(/[àâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u")
    .replace(/ç/g, "s")
    .replace(/qu/g, "k")
    .replace(/ph/g, "f")
    .replace(/[^a-z]/g, "");
  return normalize(user) === normalize(target);
}

export default function DictationTest({ ageGroup, onComplete }: DictationTestProps) {
  const { play } = useSoundEffects();
  const words = WORDS_BY_AGE[ageGroup] || WORDS_BY_AGE.primaire;
  const [trials] = useState(() => [...words].sort(() => Math.random() - 0.5).slice(0, 8));
  const [trialIdx, setTrialIdx] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"ready" | "listen" | "input" | "feedback" | "done">("ready");
  const [answers, setAnswers] = useState<{ word: string; user: string; correct: boolean; phoneticOk: boolean; type: "regular" | "irregular"; time: number }[]>([]);
  const wordStartRef = useRef<number>(0);
  const [feedback, setFeedback] = useState<"correct" | "phonetic" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = trials[trialIdx];

  const playWord = useCallback(async () => {
    if (!currentWord) return;
    setPhase("listen");
    await speak(currentWord.word);
    setPhase("input");
    wordStartRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentWord]);

  const startTest = () => {
    play("click");
    setTrialIdx(0);
    setInput("");
    playWord();
  };

  const submitWord = () => {
    if (!input.trim() || phase !== "input") return;
    const time = Date.now() - wordStartRef.current;
    const userAnswer = input.trim().toLowerCase();
    const targetAnswer = currentWord.word.toLowerCase();
    const exactMatch = userAnswer === targetAnswer;
    const phoneticOk = !exactMatch && phoneticMatch(userAnswer, targetAnswer);

    setFeedback(exactMatch ? "correct" : phoneticOk ? "phonetic" : "wrong");
    play(exactMatch ? "correct" : phoneticOk ? "pop" : "wrong");

    const newAnswers = [...answers, {
      word: currentWord.word,
      user: userAnswer,
      correct: exactMatch,
      phoneticOk: exactMatch || phoneticOk,
      type: currentWord.type,
      time,
    }];
    setAnswers(newAnswers);
    setPhase("feedback");

    setTimeout(() => {
      setFeedback(null);
      setInput("");
      if (trialIdx >= trials.length - 1) {
        setPhase("done");
        finish(newAnswers);
      } else {
        setTrialIdx((i) => i + 1);
        setTimeout(() => playWord(), 300);
      }
    }, 1500);
  };

  const finish = (finalAnswers: typeof answers) => {
    const orthographicCorrect = finalAnswers.filter((a) => a.correct).length;
    const phoneticCorrect = finalAnswers.filter((a) => a.phoneticOk).length;
    const avgTimePerWord = Math.round(finalAnswers.reduce((s, a) => s + a.time, 0) / finalAnswers.length / 1000);
    const regularErrors = finalAnswers.filter((a) => a.type === "regular" && !a.correct).length;
    const irregularErrors = finalAnswers.filter((a) => a.type === "irregular" && !a.correct).length;

    onComplete({
      totalWords: finalAnswers.length,
      orthographicCorrect,
      phoneticCorrect,
      avgTimePerWord,
      regularErrors,
      irregularErrors,
    });
  };

  if (phase === "done") return null;

  return (
    <div className="space-y-4 p-5 bg-gradient-to-br from-purple-50 to-fuchsia-100 rounded-2xl border-2 border-purple-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800">Dictée chronométrée</h3>
          <p className="text-xs text-slate-500 font-semibold">{phase === "ready" ? "Préparation" : `Mot ${trialIdx + 1}/${trials.length}`}</p>
        </div>
        <div className="text-4xl">✍️</div>
      </div>

      {phase !== "ready" && (
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${(trialIdx / trials.length) * 100}%` }} />
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-100 min-h-[200px] flex flex-col items-center justify-center gap-4">
        {phase === "ready" && (
          <>
            <div className="text-5xl">✍️</div>
            <p className="text-sm text-slate-600 font-semibold text-center">
              Lumo va te dicter des mots.<br />
              Écris-les le mieux possible !
            </p>
            <button
              onClick={startTest}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-black shadow-lg active:scale-95 transition-transform"
            >
              🎤 Commencer
            </button>
          </>
        )}

        {phase === "listen" && (
          <>
            <span className="text-6xl animate-pulse">🔊</span>
            <p className="text-sm text-slate-500 font-semibold">Écoute bien...</p>
          </>
        )}

        {phase === "input" && (
          <div className="w-full">
            <button
              onClick={playWord}
              className="text-xs text-purple-600 font-bold underline mb-3 block mx-auto"
            >
              🔁 Réécouter le mot
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitWord()}
              placeholder="Écris le mot ici…"
              className="w-full text-2xl font-bold text-slate-800 border-b-4 border-purple-300 focus:border-purple-500 outline-none pb-2 text-center bg-transparent"
              autoFocus
            />
            <button
              onClick={submitWord}
              disabled={!input.trim()}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-black disabled:opacity-50 active:scale-95 transition-transform"
            >
              Valider ✓
            </button>
          </div>
        )}

        {phase === "feedback" && feedback && (
          <>
            <div className="text-6xl">
              {feedback === "correct" ? "✓" : feedback === "phonetic" ? "≈" : "✗"}
            </div>
            <p className={`text-lg font-black ${feedback === "correct" ? "text-green-600" : feedback === "phonetic" ? "text-amber-600" : "text-red-500"}`}>
              {feedback === "correct" ? "Parfait !" : feedback === "phonetic" ? "Presque !" : "Oups..."}
            </p>
            <p className="text-sm text-slate-600">
              Le mot : <span className="font-black">{currentWord.word}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
