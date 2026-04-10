"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import ExerciseShell from "../ExerciseShell";
import ConfettiBlast from "../ConfettiBlast";

// ── Words to find by age group ──────────────────────────────────────────────
const WORDS_BY_AGE: Record<string, string[]> = {
  maternelle: ["CHAT", "CHIEN", "MAMAN", "PAPA", "LUNE", "SOLEIL", "ROUGE", "BLEU"],
  primaire: ["ECOLE", "AMITIE", "PLANETE", "DRAGON", "MAGIE", "ETOILE", "LIVRE", "JARDIN"],
  "college-lycee": ["REVOLUTION", "PHILOSOPHIE", "UNIVERS", "SYMPHONIE", "LIBERTE", "AVENTURE"],
};

interface FallingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
  vy: number; // velocity
  vx: number;
  rotation: number;
  rotSpeed: number;
  isTarget: boolean;
  caught: boolean;
}

interface LetterFishingGameProps {
  ageGroup: string;
  onComplete: (score: number, xp: number) => void;
}

const CANVAS_W = 400;
const CANVAS_H = 500;

export default function LetterFishingGame({ ageGroup, onComplete }: LetterFishingGameProps) {
  const words = WORDS_BY_AGE[ageGroup] || WORDS_BY_AGE.primaire;
  const { play } = useSoundEffects();
  const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * words.length));
  const currentWord = words[wordIdx];
  const [collected, setCollected] = useState<string[]>([]);
  const [phase, setPhase] = useState<"ready" | "playing" | "won" | "done">("ready");
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string; x: number; y: number } | null>(null);
  const letterIdRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalWords = 3;

  // Generate random letter (target or decoy)
  const spawnLetter = useCallback(() => {
    if (phase !== "playing") return;
    const missingLetters = currentWord.split("").filter((l) => {
      const needed = currentWord.split("").filter((c) => c === l).length;
      const have = collected.filter((c) => c === l).length;
      return have < needed;
    });

    // 55% chance of target letter, 45% decoy
    const isTarget = missingLetters.length > 0 && Math.random() < 0.55;
    let letter: string;
    if (isTarget) {
      letter = missingLetters[Math.floor(Math.random() * missingLetters.length)];
    } else {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      do {
        letter = alphabet[Math.floor(Math.random() * alphabet.length)];
      } while (missingLetters.includes(letter) && Math.random() < 0.5);
    }

    setLetters((prev) => [
      ...prev,
      {
        id: letterIdRef.current++,
        letter,
        x: 40 + Math.random() * (CANVAS_W - 80),
        y: -40,
        vy: 80 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 40,
        rotation: Math.random() * 40 - 20,
        rotSpeed: (Math.random() - 0.5) * 60,
        isTarget,
        caught: false,
      },
    ]);
  }, [phase, currentWord, collected]);

  // Animation loop
  useEffect(() => {
    if (phase !== "playing") return;

    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Spawn new letter every ~800ms
      if (time - lastSpawnRef.current > 800) {
        lastSpawnRef.current = time;
        spawnLetter();
      }

      setLetters((prev) => {
        const updated = prev.map((l) => ({
          ...l,
          x: l.x + l.vx * dt,
          y: l.y + l.vy * dt,
          rotation: l.rotation + l.rotSpeed * dt,
        }));

        // Check for letters going off screen (missed)
        const missed = updated.filter((l) => !l.caught && l.y > CANVAS_H && l.isTarget);
        if (missed.length > 0) {
          play("wrong");
          setLives((lv) => Math.max(0, lv - missed.length));
          setCombo(0);
        }

        return updated.filter((l) => l.y < CANVAS_H + 50);
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, spawnLetter, play]);

  // Handle letter click/tap
  const handleLetterClick = useCallback((letter: FallingLetter) => {
    if (phase !== "playing" || letter.caught) return;

    setLetters((prev) => prev.map((l) => (l.id === letter.id ? { ...l, caught: true } : l)));

    if (letter.isTarget) {
      play("correct");
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore((s) => s + 10 * Math.max(1, newCombo));
      setCollected((prev) => [...prev, letter.letter]);
      setFeedback({ text: `+${10 * Math.max(1, newCombo)}${newCombo > 2 ? ` x${newCombo}!` : ""}`, color: "#10b981", x: letter.x, y: letter.y });
      if (newCombo === 3) play("streak");
      if (newCombo >= 5) play("combo");
    } else {
      play("wrong");
      setLives((lv) => Math.max(0, lv - 1));
      setCombo(0);
      setFeedback({ text: "-1 ♥", color: "#ef4444", x: letter.x, y: letter.y });
    }

    setTimeout(() => setFeedback(null), 800);
  }, [phase, combo, play]);

  // Check win condition
  useEffect(() => {
    const expected = currentWord.split("").sort().join("");
    const got = [...collected].sort().join("");
    if (got === expected && phase === "playing") {
      play("victory");
      setShowConfetti(true);
      setPhase("won");
      const newCount = wordsCompleted + 1;
      setWordsCompleted(newCount);

      setTimeout(() => {
        setShowConfetti(false);
        if (newCount >= totalWords) {
          setPhase("done");
          const finalScore = Math.min(100, Math.round((score / (totalWords * 80)) * 100));
          onComplete(finalScore, finalScore >= 80 ? 60 : finalScore >= 50 ? 40 : 25);
        } else {
          // Next word
          let next;
          do {
            next = Math.floor(Math.random() * words.length);
          } while (next === wordIdx);
          setWordIdx(next);
          setCollected([]);
          setLetters([]);
          setPhase("playing");
          lastSpawnRef.current = performance.now();
        }
      }, 2500);
    }
  }, [collected, currentWord, phase, wordsCompleted, words, wordIdx, score, play, onComplete]);

  // Check lose condition
  useEffect(() => {
    if (lives <= 0 && phase === "playing") {
      setPhase("done");
      play("wrong");
      setTimeout(() => {
        const finalScore = Math.round((wordsCompleted / totalWords) * 100);
        onComplete(finalScore, finalScore >= 50 ? 30 : 15);
      }, 1500);
    }
  }, [lives, phase, wordsCompleted, play, onComplete]);

  const startGame = () => {
    play("click");
    setPhase("playing");
    setLetters([]);
    setCollected([]);
    setLives(3);
    setScore(0);
    setWordsCompleted(0);
    setCombo(0);
    lastSpawnRef.current = performance.now();
  };

  if (phase === "ready") {
    return (
      <ExerciseShell
        title="Pêche aux lettres"
        icon="🎣"
        currentStep={0}
        totalSteps={totalWords}
        accentColor="blue"
        lumoMood="happy"
        lumoMessage={`Attrape les lettres pour former "${currentWord}" !`}
      >
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-6 text-center border-2 border-sky-200">
          <div className="text-6xl mb-3">🎣</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Pêche aux lettres</h3>
          <p className="text-sm text-slate-600 mb-4">
            Les lettres tombent du ciel !<br />
            Touche celles qui forment le mot, évite les autres.
          </p>
          <div className="bg-white rounded-2xl p-4 mb-4 border-2 border-sky-200">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ton mot à former</p>
            <p className="text-4xl font-black text-sky-600 tracking-widest">{currentWord}</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600 font-bold mb-4">
            <span>❤️❤️❤️ 3 vies</span>
            <span>•</span>
            <span>🎯 {totalWords} mots</span>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
          >
            Commencer ! 🚀
          </button>
        </div>
      </ExerciseShell>
    );
  }

  return (
    <ExerciseShell
      title="Pêche aux lettres"
      icon="🎣"
      currentStep={wordsCompleted}
      totalSteps={totalWords}
      streak={combo}
      accentColor="blue"
      lumoMood={combo >= 3 ? "excited" : "happy"}
    >
      <ConfettiBlast active={showConfetti} />

      {/* Stats bar */}
      <div className="flex justify-between items-center mb-3 bg-white rounded-2xl p-3 shadow-sm border-2 border-sky-100">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-xl transition-opacity ${i < lives ? "opacity-100" : "opacity-20"}`}>
              ❤️
            </span>
          ))}
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 font-bold">MOT</p>
          <p className="text-lg font-black text-slate-700">
            {currentWord.split("").map((l, i) => {
              const needed = currentWord.slice(0, i + 1).split("").filter((c) => c === l).length;
              const have = collected.filter((c) => c === l).length;
              const done = have >= needed;
              return (
                <span key={i} className={done ? "text-green-500" : "text-slate-300"}>
                  {done ? l : "_"}
                </span>
              );
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-bold">SCORE</p>
          <p className="text-lg font-black text-sky-600">{score}</p>
        </div>
      </div>

      {/* Game canvas */}
      <div
        ref={containerRef}
        className="relative bg-gradient-to-b from-sky-200 via-sky-100 to-blue-100 rounded-2xl overflow-hidden border-4 border-sky-300 shadow-inner touch-none select-none"
        style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, maxWidth: "100%" }}
      >
        {/* Background clouds */}
        <div className="absolute top-4 left-8 text-4xl opacity-50">☁️</div>
        <div className="absolute top-12 right-12 text-3xl opacity-40">☁️</div>
        <div className="absolute top-24 left-1/3 text-3xl opacity-30">☁️</div>

        {/* Water at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-blue-400/40 to-blue-600/60">
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300/60 animate-pulse" />
          <div className="absolute bottom-2 left-1/4 text-xl">🐟</div>
          <div className="absolute bottom-4 right-1/3 text-xl">🐠</div>
        </div>

        {/* Fisherman Lumo */}
        <div className="absolute bottom-14 right-4 text-4xl select-none">🎣</div>

        {/* Falling letters */}
        {letters.map((letter) => {
          if (letter.caught) return null;
          const xPct = (letter.x / CANVAS_W) * 100;
          const yPct = (letter.y / CANVAS_H) * 100;
          return (
            <button
              key={letter.id}
              onClick={() => handleLetterClick(letter)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleLetterClick(letter);
              }}
              className="absolute w-11 h-11 rounded-full flex items-center justify-center font-black text-xl shadow-lg active:scale-90 transition-transform pointer-events-auto select-none"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: `translate(-50%, -50%) rotate(${letter.rotation}deg)`,
                background: letter.isTarget
                  ? "linear-gradient(135deg, #fde047, #f59e0b)"
                  : "linear-gradient(135deg, #e2e8f0, #94a3b8)",
                color: letter.isTarget ? "#78350f" : "#334155",
                border: letter.isTarget ? "3px solid #fbbf24" : "3px solid #64748b",
              }}
            >
              {letter.letter}
            </button>
          );
        })}

        {/* Feedback popup */}
        {feedback && (
          <div
            className="absolute pointer-events-none font-black text-lg select-none"
            style={{
              left: `${(feedback.x / CANVAS_W) * 100}%`,
              top: `${(feedback.y / CANVAS_H) * 100}%`,
              color: feedback.color,
              transform: "translate(-50%, -100%)",
              animation: "float-up 0.8s ease-out forwards",
            }}
          >
            {feedback.text}
          </div>
        )}

        {/* Won overlay */}
        {phase === "won" && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <div className="bg-white rounded-3xl p-6 text-center shadow-2xl">
              <div className="text-6xl mb-2">🎉</div>
              <p className="text-2xl font-black text-green-600">{currentWord} !</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 font-bold text-center mt-3">
        💡 Touche les lettres du mot avant qu&apos;elles tombent dans l&apos;eau !
      </p>

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -150%) scale(1.3); }
        }
      `}</style>
    </ExerciseShell>
  );
}
