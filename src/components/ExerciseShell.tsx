"use client";
import { useState, useEffect } from "react";
import LumoCompanion from "./LumoCompanion";
import ConfettiBlast from "./ConfettiBlast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import type { LumoMood } from "./LumoCompanion";

interface ExerciseShellProps {
  title: string;
  icon: string;
  currentStep: number;
  totalSteps: number;
  streak?: number;
  lumoMood?: LumoMood;
  lumoMessage?: string;
  showConfetti?: boolean;
  accentColor?: string;
  children: React.ReactNode;
}

export default function ExerciseShell({
  title, icon, currentStep, totalSteps, streak = 0,
  lumoMood = "happy", lumoMessage, showConfetti = false,
  accentColor = "violet", children,
}: ExerciseShellProps) {
  const { play } = useSoundEffects();
  const [prevStep, setPrevStep] = useState(currentStep);
  const [animateProgress, setAnimateProgress] = useState(false);
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  // Animate on step change
  useEffect(() => {
    if (currentStep !== prevStep) {
      setAnimateProgress(true);
      const t = setTimeout(() => setAnimateProgress(false), 600);
      setPrevStep(currentStep);
      return () => clearTimeout(t);
    }
  }, [currentStep, prevStep]);

  // Streak sound
  useEffect(() => {
    if (streak === 3) play("streak");
    else if (streak === 5) play("combo");
  }, [streak, play]);

  const gradients: Record<string, string> = {
    violet: "from-violet-500 to-purple-600",
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-green-500",
    pink: "from-pink-500 to-rose-500",
    amber: "from-amber-500 to-orange-500",
    indigo: "from-indigo-500 to-blue-600",
  };

  const bgGrad = gradients[accentColor] || gradients.violet;

  return (
    <div className="relative min-h-[400px]">
      <ConfettiBlast active={showConfetti} />

      {/* Header bar */}
      <div className={`bg-gradient-to-r ${bgGrad} rounded-2xl p-4 mb-4 shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-white font-bold text-lg">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Streak badge */}
            {streak >= 2 && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold transition-all ${
                streak >= 5 ? "bg-amber-400 text-amber-900 animate-pulse" :
                streak >= 3 ? "bg-orange-400 text-orange-900" :
                "bg-white/20 text-white"
              }`}>
                🔥 {streak}
              </div>
            )}
            <span className="text-white/80 text-sm font-bold">
              {currentStep}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              animateProgress ? "bg-yellow-300" : "bg-white/90"
            }`}
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      </div>

      {/* Lumo message bubble */}
      {lumoMessage && (
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0">
            <LumoCompanion mood={lumoMood} size="sm" />
          </div>
          <div className="bg-white border-2 border-violet-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex-1">
            <p className="text-sm font-semibold text-slate-700">{lumoMessage}</p>
          </div>
        </div>
      )}

      {/* Exercise content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
