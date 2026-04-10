"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import ExerciseShell from "../ExerciseShell";
import ConfettiBlast from "../ConfettiBlast";

interface MemorySimonGameProps {
  ageGroup: string;
  onComplete: (score: number, xp: number) => void;
}

interface Pad {
  id: number;
  color: string;
  bgColor: string;
  litColor: string;
  emoji: string;
  tone: number; // frequency for sound
}

// 4 pads with distinct colors + sounds
const PADS: Pad[] = [
  { id: 0, color: "red", bgColor: "#ef4444", litColor: "#fca5a5", emoji: "🍓", tone: 329.63 },     // E4
  { id: 1, color: "blue", bgColor: "#3b82f6", litColor: "#93c5fd", emoji: "🫐", tone: 392.00 },   // G4
  { id: 2, color: "green", bgColor: "#10b981", litColor: "#6ee7b7", emoji: "🥝", tone: 440.00 },  // A4
  { id: 3, color: "yellow", bgColor: "#f59e0b", litColor: "#fde68a", emoji: "🍋", tone: 523.25 }, // C5
];

export default function MemorySimonGame({ ageGroup, onComplete }: MemorySimonGameProps) {
  const { play } = useSoundEffects();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "showing" | "waiting" | "gameover" | "success">("idle");
  const [round, setRound] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [litPad, setLitPad] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lumoMsg, setLumoMsg] = useState("Regarde bien la séquence !");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Start length depending on age
  const startLength = ageGroup === "maternelle" ? 2 : ageGroup === "primaire" ? 3 : 4;
  const maxRounds = 8;

  // Play a musical tone for a pad
  const playTone = useCallback((freq: number, duration = 0.35) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2000;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.05);
    } catch {}
  }, []);

  // Light a pad and play its tone
  const lightPad = useCallback((id: number, duration = 450) => {
    setLitPad(id);
    playTone(PADS[id].tone, duration / 1000);
    setTimeout(() => setLitPad(null), duration - 50);
  }, [playTone]);

  // Start new game
  const startGame = useCallback(() => {
    const initial = Array.from({ length: startLength }, () => Math.floor(Math.random() * 4));
    setSequence(initial);
    setUserInput([]);
    setRound(1);
    setPhase("showing");
    setLumoMsg("Mémorise bien...");
  }, [startLength]);

  // Play the sequence
  useEffect(() => {
    if (phase !== "showing") return;

    const play = async () => {
      await new Promise((r) => setTimeout(r, 600));
      for (let i = 0; i < sequence.length; i++) {
        lightPad(sequence[i], 500);
        await new Promise((r) => setTimeout(r, 700));
      }
      setPhase("waiting");
      setLumoMsg("À ton tour ! Répète la séquence");
    };
    play();
  }, [phase, sequence, lightPad]);

  // User presses a pad
  const handlePadPress = (id: number) => {
    if (phase !== "waiting") return;
    lightPad(id, 350);

    const newInput = [...userInput, id];
    setUserInput(newInput);

    // Check if this press is correct
    const currentIdx = newInput.length - 1;
    if (sequence[currentIdx] !== id) {
      // Wrong!
      play("wrong");
      setPhase("gameover");
      setLumoMsg(`Oups ! Tu as atteint le niveau ${round}`);
      setTimeout(() => {
        const finalScore = Math.round((round / maxRounds) * 100);
        const xp = finalScore >= 70 ? 55 : finalScore >= 40 ? 35 : 20;
        if (round > highScore) setHighScore(round);
        onComplete(finalScore, xp);
      }, 2000);
      return;
    }

    // Check if sequence is complete
    if (newInput.length === sequence.length) {
      play("correct");
      if (round >= maxRounds) {
        // Won the game!
        setPhase("success");
        setShowConfetti(true);
        setLumoMsg("INCROYABLE ! Tu as tout retenu ! 🏆");
        play("victory");
        setTimeout(() => onComplete(100, 70), 3000);
        return;
      }
      // Next round: add one more to sequence
      setLumoMsg(`Bravo ! Niveau ${round + 1}`);
      setTimeout(() => {
        setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
        setUserInput([]);
        setRound((r) => r + 1);
        setPhase("showing");
      }, 1000);
    }
  };

  if (phase === "idle") {
    return (
      <ExerciseShell
        title="Mémoire de Lumo"
        icon="🧠"
        currentStep={0}
        totalSteps={maxRounds}
        accentColor="pink"
        lumoMood="happy"
        lumoMessage="Tu as une bonne mémoire ?"
      >
        <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-6 text-center border-2 border-pink-200">
          <div className="text-6xl mb-3">🧠</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Simon de Lumo</h3>
          <p className="text-sm text-slate-600 mb-4">
            Lumo joue une séquence de sons colorés.<br />
            Répète-la sans te tromper !<br />
            À chaque niveau, la séquence grandit.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4 max-w-xs mx-auto">
            {PADS.map((p) => (
              <div key={p.id} className="aspect-square rounded-xl flex items-center justify-center text-3xl" style={{ background: p.bgColor }}>
                {p.emoji}
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
          >
            Commencer ! 🎵
          </button>
        </div>
      </ExerciseShell>
    );
  }

  return (
    <ExerciseShell
      title="Mémoire de Lumo"
      icon="🧠"
      currentStep={round}
      totalSteps={maxRounds}
      streak={round}
      accentColor="pink"
      lumoMood={phase === "showing" ? "idle" : phase === "success" ? "proud" : "happy"}
      lumoMessage={lumoMsg}
    >
      <ConfettiBlast active={showConfetti} />

      {/* Round indicator */}
      <div className="bg-white rounded-2xl p-3 mb-4 flex items-center justify-between shadow-sm border-2 border-pink-100">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase">Niveau</p>
          <p className="text-2xl font-black text-pink-600">{round}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Séquence</p>
          <p className="text-lg font-black text-slate-700">
            {userInput.length}/{sequence.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-500 uppercase">Phase</p>
          <p className="text-sm font-black">
            {phase === "showing" ? "👀 Regarde" : phase === "waiting" ? "👉 À toi" : phase === "gameover" ? "❌" : "🏆"}
          </p>
        </div>
      </div>

      {/* Pad grid */}
      <div className="bg-slate-900 rounded-3xl p-5 shadow-2xl">
        <div className="grid grid-cols-2 gap-3">
          {PADS.map((pad) => {
            const lit = litPad === pad.id;
            return (
              <button
                key={pad.id}
                disabled={phase !== "waiting"}
                onClick={() => handlePadPress(pad.id)}
                className="aspect-square rounded-2xl flex items-center justify-center text-5xl font-black transition-all duration-150 shadow-lg active:scale-95 disabled:cursor-not-allowed"
                style={{
                  background: lit ? pad.litColor : pad.bgColor,
                  boxShadow: lit ? `0 0 40px ${pad.bgColor}, inset 0 0 20px rgba(255,255,255,0.3)` : `0 4px 0 rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)`,
                  transform: lit ? "scale(0.96)" : "scale(1)",
                  opacity: phase === "showing" ? (lit ? 1 : 0.6) : 1,
                }}
              >
                <span style={{ opacity: lit ? 1 : 0.9 }}>{pad.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 font-bold text-center mt-3">
        💡 Écoute bien les sons, ils t&apos;aident à retenir !
      </p>
    </ExerciseShell>
  );
}
