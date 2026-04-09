"use client";
import { useState, useCallback } from "react";
import ExerciseShell from "./ExerciseShell";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface Problem {
  q: string;
  answer: string;
}

interface MathChallengeProps {
  problems: Problem[];
  ageGroup: string;
  onComplete: (score: number, xp: number) => void;
}

export default function MathChallenge({ problems, ageGroup, onComplete }: MathChallengeProps) {
  const { play } = useSoundEffects();
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"input" | "feedback" | "done">("input");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "">("");
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lumoMsg, setLumoMsg] = useState<string | undefined>();
  const [shakeQ, setShakeQ] = useState(false);

  const isSimple = ageGroup === "maternelle";
  const p = problems[current];

  const submit = useCallback(() => {
    if (!input.trim() || phase !== "input") return;
    const isCorrect = input.trim().toLowerCase() === p.answer.toLowerCase();
    setPhase("feedback");

    if (isCorrect) {
      setFeedback("correct");
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
      play("correct");
      setLumoMsg("Bravo ! 🌟");
    } else {
      setFeedback("wrong");
      setStreak(0);
      setShakeQ(true);
      play("wrong");
      setLumoMsg(`C'était ${p.answer} ! On continue 💪`);
      setTimeout(() => setShakeQ(false), 500);
    }

    setTimeout(() => {
      if (current < problems.length - 1) {
        setCurrent((c) => c + 1);
        setInput("");
        setPhase("input");
        setFeedback("");
        setLumoMsg(undefined);
      } else {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const score = Math.round((finalCorrect / problems.length) * 100);
        const xp = score >= 90 ? 55 : score >= 70 ? 40 : score >= 50 ? 25 : 15;
        setPhase("done");
        play("victory");
        setTimeout(() => onComplete(score, xp), 2500);
      }
    }, 1500);
  }, [input, phase, p, current, problems.length, correctCount, play, onComplete]);

  const appendDigit = useCallback((d: string) => {
    if (phase !== "input") return;
    play("pop");
    setInput((v) => v + d);
  }, [phase, play]);

  const backspace = useCallback(() => {
    setInput((v) => v.slice(0, -1));
  }, []);

  if (phase === "done") {
    const score = Math.round((correctCount / problems.length) * 100);
    return (
      <ExerciseShell
        title="Maths" icon="🧮"
        currentStep={problems.length} totalSteps={problems.length}
        streak={streak} lumoMood="proud"
        showConfetti={score >= 70} accentColor="green"
      >
        <div className="text-center space-y-6 py-6">
          <div className="text-8xl animate-bounce" style={{ animationDuration: "1.5s" }}>
            {score >= 90 ? "🧮" : score >= 70 ? "⭐" : "💪"}
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            {correctCount}/{problems.length}
          </h3>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl font-bold text-lg shadow-lg">
            +{score >= 90 ? 55 : score >= 70 ? 40 : score >= 50 ? 25 : 15} XP ✨
          </div>
        </div>
      </ExerciseShell>
    );
  }

  return (
    <ExerciseShell
      title="Maths" icon="🧮"
      currentStep={current} totalSteps={problems.length}
      streak={streak}
      lumoMood={feedback === "correct" ? "excited" : feedback === "wrong" ? "idle" : "happy"}
      lumoMessage={lumoMsg}
      accentColor="green"
    >
      <style>{`
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
        .shake { animation: shake 0.4s ease-in-out; }
        @keyframes bounce-number { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .bounce-num { animation: bounce-number 0.2s ease-out; }
      `}</style>

      {/* Problem display */}
      <div className={`bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 text-center border-2 transition-all mb-4 ${
        feedback === "correct" ? "border-green-400 bg-green-50" :
        feedback === "wrong" ? "border-red-400 bg-red-50" :
        "border-emerald-100"
      } ${shakeQ ? "shake" : ""}`}>
        <p className="text-3xl font-black text-slate-800 leading-relaxed">{p.q}</p>

        {feedback === "correct" && (
          <div className="mt-3 text-green-600 font-bold text-xl animate-bounce">✓ Correct ! 🎉</div>
        )}
        {feedback === "wrong" && (
          <div className="mt-3 text-red-500 font-bold text-xl">
            Réponse : <span className="text-red-700">{p.answer}</span>
          </div>
        )}
      </div>

      {/* Answer display */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 mb-4 text-center min-h-[56px] flex items-center justify-center">
        <span className={`text-3xl font-black text-slate-800 tracking-wider ${input ? "bounce-num" : ""}`}>
          {input || <span className="text-slate-300">?</span>}
        </span>
      </div>

      {/* Keyboard */}
      {isSimple ? (
        // Visual number pad for maternelle
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
            <button
              key={n}
              onClick={() => appendDigit(String(n))}
              disabled={phase !== "input"}
              className="h-14 rounded-2xl bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 text-2xl font-black text-slate-700 active:scale-90 active:bg-emerald-50 transition-all shadow-sm hover:border-emerald-300"
            >
              {n}
            </button>
          ))}
        </div>
      ) : (
        // Text input for older kids
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ta réponse…"
            className="w-full border-2 border-emerald-200 rounded-2xl px-5 py-4 text-slate-800 text-xl font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
            autoFocus
            disabled={phase !== "input"}
          />
        </form>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {isSimple && (
          <button
            onClick={backspace}
            className="px-5 py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
          >
            ← Effacer
          </button>
        )}
        <button
          onClick={submit}
          disabled={!input.trim() || phase !== "input"}
          className="flex-1 py-3.5 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Valider ✓
        </button>
      </div>
    </ExerciseShell>
  );
}
