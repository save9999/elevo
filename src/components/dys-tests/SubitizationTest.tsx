"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// ── Test de subitisation (perception immédiate du nombre) ────────────────
// La subitisation est la capacité à percevoir instantanément une petite
// quantité (typiquement 1-5 objets) sans compter. Un déficit dans ce
// processus est un marqueur fort de dyscalculie développementale.
// Référence: Butterworth (2005), Dehaene (1997).

interface SubitizationTestProps {
  ageGroup: string;
  onComplete: (result: {
    correct: number;
    total: number;
    accuracy: number;
    avgRT: number;
    maxSubitized: number; // max quantité correctement reconnue en < 1s
  }) => void;
}

interface Trial {
  count: number;
  positions: { x: number; y: number }[];
}

function generateTrial(targetCount: number): Trial {
  const positions: { x: number; y: number }[] = [];
  const minDist = 18;
  let attempts = 0;
  while (positions.length < targetCount && attempts < 200) {
    attempts++;
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    const tooClose = positions.some((p) => Math.hypot(p.x - x, p.y - y) < minDist);
    if (!tooClose) positions.push({ x, y });
  }
  return { count: positions.length, positions };
}

export default function SubitizationTest({ ageGroup, onComplete }: SubitizationTestProps) {
  void ageGroup;
  const { play } = useSoundEffects();
  const [phase, setPhase] = useState<"ready" | "fixation" | "stimulus" | "answer" | "feedback" | "done">("ready");
  const [trialIdx, setTrialIdx] = useState(0);
  const [trials] = useState<Trial[]>(() => {
    // Generate 12 trials: 2x (1,2,3,4,5,6) shuffled
    const counts = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
    return counts.sort(() => Math.random() - 0.5).map(generateTrial);
  });
  const [currentTrial, setCurrentTrial] = useState<Trial | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; rt: number; target: number; given: number }[]>([]);
  const stimulusStartRef = useRef<number>(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const startTrial = useCallback((idx: number) => {
    setCurrentTrial(null);
    setPhase("fixation");
    setTimeout(() => {
      setCurrentTrial(trials[idx]);
      setPhase("stimulus");
      stimulusStartRef.current = Date.now();
      // Show stimulus for 700ms (subitizing window)
      setTimeout(() => {
        setPhase("answer");
      }, 700);
    }, 600);
  }, [trials]);

  const startTest = () => {
    play("click");
    setTrialIdx(0);
    startTrial(0);
  };

  const handleAnswer = (userCount: number) => {
    if (phase !== "answer") return;
    const rt = Date.now() - stimulusStartRef.current;
    const target = currentTrial?.count || 0;
    const isCorrect = userCount === target;
    play(isCorrect ? "correct" : "wrong");
    setFeedback(isCorrect ? "correct" : "wrong");

    const newAnswers = [...answers, { correct: isCorrect, rt, target, given: userCount }];
    setAnswers(newAnswers);
    setPhase("feedback");

    setTimeout(() => {
      setFeedback(null);
      if (trialIdx >= trials.length - 1) {
        setPhase("done");
        finish(newAnswers);
      } else {
        const nextIdx = trialIdx + 1;
        setTrialIdx(nextIdx);
        startTrial(nextIdx);
      }
    }, 1000);
  };

  const finish = (finalAnswers: typeof answers) => {
    const correct = finalAnswers.filter((a) => a.correct).length;
    const total = finalAnswers.length;
    const accuracy = Math.round((correct / total) * 100);
    const avgRT = Math.round(finalAnswers.reduce((a, b) => a + b.rt, 0) / total);
    // Find max subitized: highest quantity correctly identified in < 800ms
    const fast = finalAnswers.filter((a) => a.correct && a.rt < 800);
    const maxSubitized = fast.length > 0 ? Math.max(...fast.map((a) => a.target)) : 0;

    onComplete({ correct, total, accuracy, avgRT, maxSubitized });
  };

  if (phase === "done") return null;

  return (
    <div className="space-y-4 p-5 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl border-2 border-cyan-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800">Combien de points ?</h3>
          <p className="text-xs text-slate-500 font-semibold">{phase === "ready" ? "Préparation" : `${trialIdx + 1}/${trials.length}`}</p>
        </div>
        <div className="text-4xl">🎯</div>
      </div>

      {/* Progress */}
      {phase !== "ready" && (
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style={{ width: `${(trialIdx / trials.length) * 100}%` }} />
        </div>
      )}

      {/* Main stimulus area */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-cyan-100 relative" style={{ aspectRatio: "1 / 1", maxWidth: "280px", margin: "0 auto" }}>
        {phase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 gap-3">
            <div className="text-5xl">🎯</div>
            <p className="text-sm text-slate-600 font-semibold">
              Des points vont apparaître très vite.<br />
              Dis combien tu en vois, sans compter !
            </p>
            <button
              onClick={startTest}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-lg active:scale-95 transition-transform"
            >
              Commencer !
            </button>
          </div>
        )}

        {phase === "fixation" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-black text-slate-300">+</span>
          </div>
        )}

        {phase === "stimulus" && currentTrial && (
          <div className="absolute inset-0">
            {currentTrial.positions.map((p, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        )}

        {phase === "answer" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-black text-slate-700">Combien ?</p>
          </div>
        )}

        {phase === "feedback" && feedback && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${feedback === "correct" ? "bg-green-50" : "bg-red-50"} rounded-2xl`}>
            <div className="text-6xl">{feedback === "correct" ? "✓" : "✗"}</div>
            <p className="text-lg font-black mt-2" style={{ color: feedback === "correct" ? "#16a34a" : "#dc2626" }}>
              {currentTrial?.count} point{(currentTrial?.count || 0) > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Number keys */}
      {phase === "answer" && (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleAnswer(n)}
              className="aspect-square rounded-xl bg-white border-2 border-cyan-200 hover:bg-cyan-50 active:scale-90 transition-all text-2xl font-black text-slate-700 shadow-sm"
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
