"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import LumoCharacter from "@/components/LumoCharacter";
import StarRating from "@/components/StarRating";

interface ExerciseData {
  narrative?: string;
  story?: string;
  questions?: { q: string; options: string[]; correct: number; explanation?: string }[];
  problems?: { q: string; answer: string; hint?: string; explanation?: string }[];
  scenarios?: { situation: string; q: string; options: string[]; best: number; explanation?: string; advice?: string }[];
  lumoComment?: string;
}

export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const chapterId = params.chapterId as string;
  const stepId = params.stepId as string;

  const [data, setData] = useState<ExerciseData | null>(null);
  const [exerciseType, setExerciseType] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"narrative" | "exercise" | "done">("narrative");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [rewards, setRewards] = useState<{ xpEarned: number; starsEarned: number; stars: number } | null>(null);
  const [lumoMood, setLumoMood] = useState<"happy" | "excited" | "proud" | "idle">("happy");

  useEffect(() => {
    fetch("/api/ai/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, chapterId, stepId }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setData(result.data);
          setExerciseType(result.exerciseType);
          setStepTitle(result.step?.title || "");
          const qCount = result.data.questions?.length || result.data.problems?.length || result.data.scenarios?.length || 0;
          setAnswers(new Array(qCount).fill(null));
        }
        setLoading(false);
      });
  }, [childId, chapterId, stepId]);

  const getQuestions = useCallback(() => {
    if (!data) return [];
    if (data.questions) return data.questions.map((q) => ({ ...q, type: "qcm" as const }));
    if (data.scenarios) return data.scenarios.map((s) => ({ q: s.q, options: s.options, correct: s.best, explanation: s.explanation, type: "qcm" as const }));
    if (data.problems) return data.problems.map((p) => ({ q: p.q, answer: p.answer, hint: p.hint, explanation: p.explanation, type: "input" as const }));
    return [];
  }, [data]);

  const handleAnswer = (answer: number | string) => {
    const updated = [...answers];
    updated[currentQ] = answer;
    setAnswers(updated);
    setShowFeedback(true);

    const questions = getQuestions();
    const q = questions[currentQ];
    const isCorrect = q.type === "input"
      ? String(answer).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
      : answer === q.correct;

    setLumoMood(isCorrect ? "excited" : "idle");

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setLumoMood("happy");
      } else {
        finishExercise(updated);
      }
    }, 2000);
  };

  const finishExercise = async (finalAnswers: (number | string | null)[]) => {
    const questions = getQuestions();
    let correct = 0;
    questions.forEach((q, i) => {
      if (q.type === "input") {
        if (String(finalAnswers[i]).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) correct++;
      } else {
        if (finalAnswers[i] === q.correct) correct++;
      }
    });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setLumoMood("proud");
    setPhase("done");

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, chapterId, stepId, score: finalScore, isBoss: false }),
    });
    const rewardData = await res.json();
    setRewards(rewardData);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-indigo-50 to-white">
      <div className="w-20 h-20"><LumoCharacter ageGroup="primaire" mood="excited" /></div>
      <p className="text-gray-500 animate-pulse">Lumo prépare ton aventure...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Erreur de chargement</p>
      <button onClick={() => router.back()} className="text-elevo-purple font-bold">← Retour</button>
    </div>
  );

  if (phase === "narrative") return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-black text-gray-800 mb-4">📜 {stepTitle}</h2>
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{data.narrative || data.story}</p>
        </div>
        {data.story && data.narrative && (
          <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{data.story}</p>
          </div>
        )}
        <div className="flex items-end gap-3 mb-6">
          <div className="w-12 h-12"><LumoCharacter ageGroup="primaire" mood="happy" size="sm" /></div>
          <div className="bg-elevo-purple/10 rounded-2xl rounded-bl-none p-3 flex-1">
            <p className="text-sm text-elevo-purple">{data.lumoComment || "C'est parti ! Tu es prêt ?"}</p>
          </div>
        </div>
        <button
          onClick={() => setPhase("exercise")}
          className="w-full py-4 rounded-2xl bg-elevo-purple text-white font-black text-lg shadow-lg active:scale-95 transition-all"
        >
          Commencer l&apos;épreuve ⚔️
        </button>
      </div>
    </div>
  );

  if (phase === "exercise") {
    const questions = getQuestions();
    const q = questions[currentQ];
    if (!q) return null;

    const currentAnswer = answers[currentQ];
    const isCorrect = q.type === "input"
      ? String(currentAnswer).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
      : currentAnswer === q.correct;

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => router.back()} className="text-gray-400">✕</button>
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-elevo-purple rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 font-bold">{currentQ + 1}/{questions.length}</span>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16"><LumoCharacter ageGroup="primaire" mood={lumoMood} /></div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-md mb-4">
            <p className="text-gray-800 font-bold text-center">{q.q}</p>
          </div>
          {q.type === "qcm" && q.options && (
            <div className="space-y-3">
              {q.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => !showFeedback && handleAnswer(i)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-2xl font-bold transition-all ${
                    showFeedback && i === q.correct
                      ? "bg-green-100 border-2 border-green-400 text-green-800"
                      : showFeedback && currentAnswer === i && !isCorrect
                        ? "bg-red-100 border-2 border-red-400 text-red-800"
                        : "bg-white border-2 border-gray-100 hover:border-elevo-purple/50 active:scale-[0.98]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {q.type === "input" && !showFeedback && (
            <form onSubmit={(e) => { e.preventDefault(); const input = (e.target as HTMLFormElement).elements.namedItem("answer") as HTMLInputElement; if (input.value) handleAnswer(input.value); }}>
              <input name="answer" type="text" autoFocus placeholder="Ta réponse..." className="w-full p-4 rounded-2xl border-2 border-gray-200 text-center text-lg font-bold focus:border-elevo-purple focus:outline-none" />
              <button type="submit" className="w-full mt-3 py-3 rounded-2xl bg-elevo-purple text-white font-bold">Valider</button>
              {q.hint && <p className="text-center text-xs text-gray-400 mt-2">💡 {q.hint}</p>}
            </form>
          )}
          {showFeedback && (
            <div className={`mt-4 p-4 rounded-2xl ${isCorrect ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              <p className="font-bold text-sm">{isCorrect ? "✅ Bravo !" : "💪 Pas tout à fait..."}</p>
              {q.explanation && <p className="text-xs text-gray-600 mt-1">{q.explanation}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 mb-4"><LumoCharacter ageGroup="primaire" mood="proud" /></div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">Épreuve terminée !</h2>
      <p className="text-gray-500 mb-4">Score : {score}%</p>
      {rewards && (
        <div className="flex flex-col items-center gap-2 mb-6">
          <StarRating stars={rewards.stars} size="lg" animated />
          <div className="flex gap-4 text-lg font-bold">
            <span className="text-elevo-purple">+{rewards.xpEarned} XP</span>
            <span>⭐ +{rewards.starsEarned}</span>
          </div>
        </div>
      )}
      <button
        onClick={() => router.push(`/child/${childId}/chapter/${chapterId}`)}
        className="py-4 px-8 rounded-2xl bg-elevo-purple text-white font-black text-lg shadow-lg active:scale-95 transition-all"
      >
        Continuer l&apos;aventure →
      </button>
    </div>
  );
}
