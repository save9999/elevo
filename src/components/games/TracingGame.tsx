"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import ExerciseShell from "../ExerciseShell";
import ConfettiBlast from "../ConfettiBlast";

// ── Shapes to trace by age group ────────────────────────────────────────────
// Each shape is a series of "guide points" the user must pass through in order
interface TraceShape {
  char: string;
  label: string;
  // Path as SVG path for display
  svgPath: string;
  // Normalized guide points [0-1] to check stroke
  guidePoints: { x: number; y: number }[];
  strokes: number; // how many separate strokes needed (info)
}

const SHAPES_BY_AGE: Record<string, TraceShape[]> = {
  maternelle: [
    {
      char: "O",
      label: "La lettre O",
      svgPath: "M 150 80 A 70 70 0 1 1 149 80 Z",
      guidePoints: Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        return { x: 0.5 + Math.cos(a) * 0.35, y: 0.5 + Math.sin(a) * 0.35 };
      }),
      strokes: 1,
    },
    {
      char: "I",
      label: "La lettre I",
      svgPath: "M 150 40 L 150 260",
      guidePoints: Array.from({ length: 12 }).map((_, i) => ({
        x: 0.5,
        y: 0.15 + (i / 11) * 0.7,
      })),
      strokes: 1,
    },
    {
      char: "L",
      label: "La lettre L",
      svgPath: "M 100 40 L 100 260 L 220 260",
      guidePoints: [
        ...Array.from({ length: 8 }).map((_, i) => ({ x: 0.33, y: 0.15 + (i / 7) * 0.7 })),
        ...Array.from({ length: 6 }).map((_, i) => ({ x: 0.33 + (i / 5) * 0.4, y: 0.85 })),
      ],
      strokes: 1,
    },
    {
      char: "1",
      label: "Le chiffre 1",
      svgPath: "M 120 100 L 150 60 L 150 260",
      guidePoints: [
        ...Array.from({ length: 3 }).map((_, i) => ({ x: 0.4 + (i / 2) * 0.1, y: 0.33 - (i / 2) * 0.13 })),
        ...Array.from({ length: 10 }).map((_, i) => ({ x: 0.5, y: 0.2 + (i / 9) * 0.7 })),
      ],
      strokes: 1,
    },
  ],
  primaire: [
    {
      char: "A",
      label: "La lettre A",
      svgPath: "M 80 260 L 150 60 L 220 260 M 110 180 L 190 180",
      guidePoints: [
        ...Array.from({ length: 8 }).map((_, i) => ({ x: 0.27 + (i / 7) * 0.23, y: 0.85 - (i / 7) * 0.65 })),
        ...Array.from({ length: 8 }).map((_, i) => ({ x: 0.5 + (i / 7) * 0.23, y: 0.2 + (i / 7) * 0.65 })),
        ...Array.from({ length: 5 }).map((_, i) => ({ x: 0.37 + (i / 4) * 0.26, y: 0.6 })),
      ],
      strokes: 3,
    },
    {
      char: "8",
      label: "Le chiffre 8",
      svgPath: "M 150 60 A 40 40 0 1 0 150 140 A 40 40 0 1 1 150 220 A 40 40 0 1 1 150 140 A 40 40 0 1 0 150 60",
      guidePoints: Array.from({ length: 24 }).map((_, i) => {
        const t = i / 24;
        if (t < 0.5) {
          const a = t * 2 * Math.PI * 2 - Math.PI / 2;
          return { x: 0.5 + Math.cos(a) * 0.15, y: 0.3 + Math.sin(a) * 0.15 };
        }
        const a = (t - 0.5) * 2 * Math.PI * 2 - Math.PI / 2;
        return { x: 0.5 + Math.cos(a) * 0.15, y: 0.65 + Math.sin(a) * 0.15 };
      }),
      strokes: 1,
    },
    {
      char: "S",
      label: "La lettre S",
      svgPath: "M 210 90 Q 160 50 110 90 Q 80 130 150 160 Q 220 190 190 230 Q 140 270 90 230",
      guidePoints: Array.from({ length: 18 }).map((_, i) => {
        const t = i / 17;
        const y = 0.2 + t * 0.6;
        const x = 0.5 + Math.sin(t * Math.PI * 1.5) * 0.22;
        return { x, y };
      }),
      strokes: 1,
    },
  ],
  "college-lycee": [
    {
      char: "∞",
      label: "L'infini",
      svgPath: "M 80 150 Q 130 100 180 150 Q 230 200 280 150 Q 230 100 180 150 Q 130 200 80 150",
      guidePoints: Array.from({ length: 28 }).map((_, i) => {
        const t = (i / 28) * Math.PI * 2;
        return { x: 0.5 + Math.sin(t) * 0.32, y: 0.5 + Math.sin(t * 2) * 0.18 };
      }),
      strokes: 1,
    },
    {
      char: "Σ",
      label: "Somme (sigma)",
      svgPath: "M 200 60 L 80 60 L 150 160 L 80 260 L 200 260",
      guidePoints: [
        ...Array.from({ length: 6 }).map((_, i) => ({ x: 0.67 - (i / 5) * 0.4, y: 0.2 })),
        ...Array.from({ length: 6 }).map((_, i) => ({ x: 0.27 + (i / 5) * 0.23, y: 0.2 + (i / 5) * 0.33 })),
        ...Array.from({ length: 6 }).map((_, i) => ({ x: 0.5 - (i / 5) * 0.23, y: 0.53 + (i / 5) * 0.33 })),
        ...Array.from({ length: 6 }).map((_, i) => ({ x: 0.27 + (i / 5) * 0.4, y: 0.86 })),
      ],
      strokes: 1,
    },
  ],
};

interface TracingGameProps {
  ageGroup: string;
  onComplete: (score: number, xp: number) => void;
}

const CANVAS_SIZE = 300;

export default function TracingGame({ ageGroup, onComplete }: TracingGameProps) {
  const shapes = SHAPES_BY_AGE[ageGroup] || SHAPES_BY_AGE.primaire;
  const { play } = useSoundEffects();
  const [shapeIdx, setShapeIdx] = useState(() => Math.floor(Math.random() * shapes.length));
  const shape = shapes[shapeIdx];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokePoints, setStrokePoints] = useState<{ x: number; y: number }[]>([]);
  const [guidesHit, setGuidesHit] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"drawing" | "scoring" | "done">("drawing");
  const [lastScore, setLastScore] = useState(0);
  const [shapesCompleted, setShapesCompleted] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lumoMsg, setLumoMsg] = useState(`Trace ${shape.label} avec ton doigt !`);
  const totalShapes = 3;

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Background grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo((i * CANVAS_SIZE) / 6, 0);
      ctx.lineTo((i * CANVAS_SIZE) / 6, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (i * CANVAS_SIZE) / 6);
      ctx.lineTo(CANVAS_SIZE, (i * CANVAS_SIZE) / 6);
      ctx.stroke();
    }

    // Draw guide shape (ghost)
    ctx.fillStyle = "#c7d2fe";
    ctx.font = "bold 220px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(shape.char, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);

    // Draw guide points (dots showing the path)
    shape.guidePoints.forEach((gp, i) => {
      ctx.beginPath();
      ctx.arc(gp.x * CANVAS_SIZE, gp.y * CANVAS_SIZE, 4, 0, Math.PI * 2);
      ctx.fillStyle = guidesHit[i] ? "#10b981" : "#a78bfa";
      ctx.fill();
    });

    // Draw user's stroke
    if (strokePoints.length > 1) {
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(strokePoints[0].x, strokePoints[0].y);
      strokePoints.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [shape, strokePoints, guidesHit]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Initialize guide hit tracker when shape changes
  useEffect(() => {
    setGuidesHit(new Array(shape.guidePoints.length).fill(false));
    setStrokePoints([]);
  }, [shape]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "drawing") return;
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    setStrokePoints([{ x, y }]);
    play("click");
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || phase !== "drawing") return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    setStrokePoints((prev) => [...prev, { x, y }]);

    // Check which guide points are hit
    setGuidesHit((prev) => {
      const next = [...prev];
      shape.guidePoints.forEach((gp, i) => {
        if (next[i]) return;
        const gx = gp.x * CANVAS_SIZE;
        const gy = gp.y * CANVAS_SIZE;
        const dist = Math.hypot(x - gx, y - gy);
        if (dist < 22) {
          next[i] = true;
        }
      });
      return next;
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Score based on guide points hit
    setTimeout(() => scoreDrawing(), 300);
  };

  const scoreDrawing = () => {
    const hits = guidesHit.filter(Boolean).length;
    const total = shape.guidePoints.length;
    const accuracy = Math.round((hits / total) * 100);
    setLastScore(accuracy);
    setPhase("scoring");

    if (accuracy >= 80) {
      play("victory");
      setLumoMsg("Parfait ! ✨");
      setShowConfetti(true);
    } else if (accuracy >= 50) {
      play("correct");
      setLumoMsg("Pas mal ! Continue !");
    } else {
      play("wrong");
      setLumoMsg("Essaie de suivre les points verts");
    }
    setTotalScore((s) => s + accuracy);
  };

  const nextShape = () => {
    setShowConfetti(false);
    const newCount = shapesCompleted + 1;
    setShapesCompleted(newCount);

    if (newCount >= totalShapes) {
      const avgScore = Math.round((totalScore + lastScore) / totalShapes);
      const xp = avgScore >= 80 ? 60 : avgScore >= 50 ? 40 : 25;
      onComplete(avgScore, xp);
      return;
    }

    let next;
    do { next = Math.floor(Math.random() * shapes.length); } while (next === shapeIdx);
    setShapeIdx(next);
    setStrokePoints([]);
    setGuidesHit(new Array(shapes[next].guidePoints.length).fill(false));
    setPhase("drawing");
    setLumoMsg(`Trace ${shapes[next].label} !`);
  };

  const clearDrawing = () => {
    play("click");
    setStrokePoints([]);
    setGuidesHit(new Array(shape.guidePoints.length).fill(false));
  };

  return (
    <ExerciseShell
      title="Tracé au doigt"
      icon="✏️"
      currentStep={shapesCompleted}
      totalSteps={totalShapes}
      accentColor="violet"
      lumoMood={lastScore >= 80 ? "excited" : lastScore >= 50 ? "happy" : "idle"}
      lumoMessage={lumoMsg}
    >
      <ConfettiBlast active={showConfetti} />

      {/* Title */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl p-3 mb-3 text-center border-2 border-violet-200">
        <p className="text-xs font-bold text-violet-500 uppercase mb-1">Trace</p>
        <p className="text-xl font-black text-violet-700">{shape.label}</p>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border-2 border-violet-100 relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full touch-none select-none rounded-xl"
          style={{ aspectRatio: "1 / 1" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Progress indicator */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-black text-violet-700 shadow-sm">
          {guidesHit.filter(Boolean).length}/{shape.guidePoints.length}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {phase === "drawing" ? (
          <>
            <button
              onClick={clearDrawing}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold active:scale-95 transition-transform"
            >
              🔄 Effacer
            </button>
            <button
              onClick={scoreDrawing}
              disabled={strokePoints.length < 5}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black active:scale-95 transition-transform disabled:opacity-50"
            >
              Valider ✓
            </button>
          </>
        ) : (
          <button
            onClick={nextShape}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-lg active:scale-95 transition-transform"
          >
            {shapesCompleted + 1 < totalShapes ? "Tracé suivant →" : "Terminé 🎉"}
          </button>
        )}
      </div>

      {phase === "scoring" && (
        <div className="mt-3 bg-white rounded-2xl p-3 text-center border-2 border-violet-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Précision</p>
          <p className={`text-3xl font-black ${lastScore >= 80 ? "text-green-600" : lastScore >= 50 ? "text-amber-600" : "text-red-500"}`}>
            {lastScore}%
          </p>
        </div>
      )}
    </ExerciseShell>
  );
}
