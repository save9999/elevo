"use client";
import { useState, useEffect, useCallback } from "react";
import ExerciseShell from "./ExerciseShell";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { LumoMood } from "./LumoCompanion";

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface FunQuizProps {
  title?: string;
  icon?: string;
  questions: Question[];
  accentColor?: string;
  onComplete: (score: number, xp: number) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
  { bg: "bg-violet-50 hover:bg-violet-100 border-violet-200", selected: "bg-violet-100 border-violet-400 ring-2 ring-violet-300", letter: "bg-violet-500" },
  { bg: "bg-blue-50 hover:bg-blue-100 border-blue-200", selected: "bg-blue-100 border-blue-400 ring-2 ring-blue-300", letter: "bg-blue-500" },
  { bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200", selected: "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300", letter: "bg-emerald-500" },
  { bg: "bg-amber-50 hover:bg-amber-100 border-amber-200", selected: "bg-amber-100 border-amber-400 ring-2 ring-amber-300", letter: "bg-amber-500" },
];

const LUMO_CORRECT = [
  "Bravo ! Tu gères ! 🌟",
  "Parfait ! Continue ! ✨",
  "Exactement ! Impressionnant ! 💪",
  "Oui ! Tu es trop fort(e) ! 🎯",
  "Bien joué ! 🔥",
];

const LUMO_WRONG = [
  "Pas grave, on continue ! 💙",
  "C'est en se trompant qu'on apprend ! 🌱",
  "Presque ! La prochaine sera la bonne ! ✊",
  "Allez, on lâche rien ! 💫",
];

const LUMO_STREAK = [
  "3 d'affilée ! Tu es en feu ! 🔥🔥",
  "Série en cours ! Rien ne t'arrête ! ⚡",
  "Incroyable série ! Tu es un génie ! 🧠✨",
];

export default function FunQuiz({ title = "Quiz", icon = "🧠", questions, accentColor = "violet", onComplete }: FunQuizProps) {
  const { play } = useSoundEffects();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"question" | "feedback" | "done">("question");
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lumoMood, setLumoMood] = useState<LumoMood>("happy");
  const [lumoMsg, setLumoMsg] = useState<string | undefined>(undefined);
  const [cardAnim, setCardAnim] = useState("");

  const q = questions[current];

  const handleAnswer = useCallback((idx: number) => {
    if (phase !== "question") return;
    play("click");
    setSelected(idx);
    setPhase("feedback");

    const isCorrect = idx === q.correct;

    setTimeout(() => {
      if (isCorrect) {
        play("correct");
        setCorrectCount((c) => c + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setLumoMood("excited");

        if (newStreak >= 3) {
          setLumoMsg(LUMO_STREAK[Math.min(newStreak - 3, LUMO_STREAK.length - 1)]);
        } else {
          setLumoMsg(LUMO_CORRECT[Math.floor(Math.random() * LUMO_CORRECT.length)]);
        }
      } else {
        play("wrong");
        setStreak(0);
        setLumoMood("idle");
        setLumoMsg(LUMO_WRONG[Math.floor(Math.random() * LUMO_WRONG.length)]);
      }
    }, 200);

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCardAnim("animate-slide-out");
        setTimeout(() => {
          setCurrent((c) => c + 1);
          setSelected(null);
          setPhase("question");
          setLumoMood("happy");
          setLumoMsg(undefined);
          setCardAnim("animate-slide-in");
          setTimeout(() => setCardAnim(""), 300);
        }, 250);
      } else {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const score = Math.round((finalCorrect / questions.length) * 100);
        const xp = score >= 90 ? 50 : score >= 70 ? 35 : score >= 50 ? 25 : 15;
        setPhase("done");
        setLumoMood("proud");
        setLumoMsg(`${finalCorrect}/${questions.length} ! ${score >= 80 ? "Tu es un champion !" : "Bien joué !"} 🎉`);
        play("victory");
        setTimeout(() => onComplete(score, xp), 3000);
      }
    }, 1800);
  }, [current, phase, q, streak, correctCount, questions.length, play, onComplete]);

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "question") return;
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0 && idx < q.options.length) handleAnswer(idx);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, handleAnswer]);

  if (phase === "done") {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <ExerciseShell
        title={title} icon={icon}
        currentStep={questions.length} totalSteps={questions.length}
        streak={streak} lumoMood="proud"
        lumoMessage={lumoMsg}
        showConfetti={score >= 70}
        accentColor={accentColor}
      >
        <div className="text-center space-y-6 py-6">
          <div className="text-8xl animate-bounce" style={{ animationDuration: "1.5s" }}>
            {score >= 90 ? "🏆" : score >= 70 ? "⭐" : score >= 50 ? "👍" : "💪"}
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            {correctCount}/{questions.length}
          </h3>
          <p className="text-slate-500 font-semibold">
            {score >= 90 ? "Parfait ! Rien à redire !" :
             score >= 70 ? "Très bien ! Continue comme ça !" :
             score >= 50 ? "Pas mal du tout !" : "On s'améliore à chaque essai !"}
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg">
            +{score >= 90 ? 50 : score >= 70 ? 35 : score >= 50 ? 25 : 15} XP ✨
          </div>
        </div>
      </ExerciseShell>
    );
  }

  return (
    <ExerciseShell
      title={title} icon={icon}
      currentStep={current} totalSteps={questions.length}
      streak={streak} lumoMood={lumoMood}
      lumoMessage={lumoMsg}
      accentColor={accentColor}
    >
      <style>{`
        @keyframes slide-in { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-30px); } }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
        .animate-slide-out { animation: slide-out 0.2s ease-in; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0.5; } 50% { transform: scale(1.03); } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop { animation: pop-in 0.3s ease-out; }
      `}</style>

      <div className={cardAnim}>
        {/* Question */}
        <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 mb-4 shadow-sm">
          <p className="text-xl font-black text-slate-800 leading-relaxed">{q.q}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            const colors = OPTION_COLORS[i % OPTION_COLORS.length];
            const isSelected = selected === i;
            const isCorrect = i === q.correct;
            const showResult = phase === "feedback";

            let className = `relative flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold border-2 transition-all cursor-pointer `;

            if (showResult && isSelected && isCorrect) {
              className += "bg-green-100 border-green-400 ring-2 ring-green-300 animate-pop";
            } else if (showResult && isSelected && !isCorrect) {
              className += "bg-red-100 border-red-400 ring-2 ring-red-300 animate-shake";
            } else if (showResult && isCorrect) {
              className += "bg-green-50 border-green-300";
            } else if (isSelected) {
              className += colors.selected;
            } else {
              className += `${colors.bg} active:scale-[0.98]`;
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={phase !== "question"}
                className={className}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                  showResult && isCorrect ? "bg-green-500" :
                  showResult && isSelected && !isCorrect ? "bg-red-500" :
                  colors.letter
                }`}>
                  {showResult && isCorrect ? "✓" : showResult && isSelected ? "✗" : OPTION_LETTERS[i]}
                </div>
                <span className="text-slate-700 text-left flex-1">{opt}</span>

                {/* Feedback icon */}
                {showResult && isSelected && (
                  <span className="text-xl">
                    {isCorrect ? "🎉" : "😅"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {phase === "feedback" && q.explanation && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 animate-pop">
            <p className="text-sm text-blue-700 font-medium">💡 {q.explanation}</p>
          </div>
        )}
      </div>
    </ExerciseShell>
  );
}
