"use client";
import { useEffect, useRef, useState } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// ── Textes normés par âge (inspirés des tests ELFE / Alouette simplifiés) ──
// Les normes sont issues de la littérature (Lequette & al. 2008, ELFE)
// MCLM = Mots Correctement Lus par Minute

const TEXTS_BY_AGE: Record<string, { text: string; wordCount: number; normAvg: number; normLow: number }> = {
  // Maternelle (GS) : lecture de syllabes/mots isolés
  maternelle: {
    text: "le chat a vu le rat sur le toit la lune est belle maman lit une page papa joue avec moi le ciel est bleu",
    wordCount: 25,
    normAvg: 20,
    normLow: 10,
  },
  // Primaire (moyenne CE1-CM2) : norme intermédiaire
  primaire: {
    text: "Un petit garçon se promenait dans la forêt. Soudain, il aperçut un écureuil qui grimpait à un arbre. L'animal avait les joues pleines de noisettes. Il faisait des provisions pour l'hiver. Le garçon sourit et continua sa balade tranquillement parmi les grands arbres verts.",
    wordCount: 48,
    normAvg: 90,  // CE2 moyen
    normLow: 50,
  },
  // Collège/Lycée : texte plus complexe
  "college-lycee": {
    text: "L'adolescence est une période de transformations profondes où le jeune construit progressivement son identité. Cette étape, bien que parfois difficile, est essentielle dans le développement psychologique et social. Les relations avec les pairs prennent une importance croissante, tandis que celles avec la famille évoluent vers davantage d'autonomie.",
    wordCount: 52,
    normAvg: 140,
    normLow: 90,
  },
};

interface ReadingSpeedTestProps {
  ageGroup: string;
  onComplete: (result: {
    mclm: number;
    percentile: "low" | "normal" | "high";
    duration: number;
    errors: number;
    wordCount: number;
  }) => void;
}

export default function ReadingSpeedTest({ ageGroup, onComplete }: ReadingSpeedTestProps) {
  const { play } = useSoundEffects();
  const testData = TEXTS_BY_AGE[ageGroup] || TEXTS_BY_AGE.primaire;
  const [phase, setPhase] = useState<"ready" | "reading" | "done">("ready");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (phase === "reading" && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed((Date.now() - startTime) / 1000);
      }, 100);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [phase, startTime]);

  const handleStart = () => {
    play("click");
    setStartTime(Date.now());
    setPhase("reading");
    setElapsed(0);
    setErrors(0);
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    play("correct");
    const duration = (Date.now() - (startTime || Date.now())) / 1000;
    const mclm = Math.round((testData.wordCount - errors) / (duration / 60));
    let percentile: "low" | "normal" | "high" = "normal";
    if (mclm < testData.normLow) percentile = "low";
    else if (mclm > testData.normAvg * 1.2) percentile = "high";

    setPhase("done");
    onComplete({
      mclm,
      percentile,
      duration,
      errors,
      wordCount: testData.wordCount,
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  if (phase === "ready") {
    return (
      <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl border-2 border-sky-200">
        <div className="text-center">
          <div className="text-5xl mb-2">📖</div>
          <h3 className="text-xl font-black text-slate-800">Test de lecture rapide</h3>
          <p className="text-sm text-slate-600 mt-2">
            Lis le texte à voix haute le plus vite et clairement possible.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Quand tu as terminé, clique sur &quot;Fini&quot;.
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-sky-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Mots à lire</p>
          <p className="text-lg font-black text-sky-600">{testData.wordCount}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-700 font-semibold">
            💡 Un parent ou un adulte peut compter les erreurs pendant que tu lis.
          </p>
        </div>
        <button
          onClick={handleStart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
        >
          Je suis prêt(e) — Start ⏱️
        </button>
      </div>
    );
  }

  if (phase === "reading") {
    return (
      <div className="space-y-4">
        {/* Timer */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 text-center sticky top-3 z-10 shadow-xl">
          <p className="text-xs uppercase text-slate-400 font-bold">Chronomètre</p>
          <p className="text-4xl font-black tabular-nums">{formatTime(elapsed)}</p>
        </div>

        {/* Text to read */}
        <div className="bg-white rounded-2xl p-6 border-2 border-sky-200 shadow-sm">
          <p className="text-xl leading-relaxed font-medium text-slate-800" style={{ fontFamily: "Georgia, serif" }}>
            {testData.text}
          </p>
        </div>

        {/* Error counter */}
        <div className="bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600">Erreurs de lecture</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setErrors((e) => Math.max(0, e - 1))}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-black active:scale-90 transition-transform"
              >−</button>
              <span className="text-xl font-black text-red-500 w-6 text-center">{errors}</span>
              <button
                onClick={() => setErrors((e) => e + 1)}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-black active:scale-90 transition-transform"
              >+</button>
            </div>
          </div>
        </div>

        <button
          onClick={handleStop}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg shadow-lg active:scale-95 transition-transform"
        >
          ✓ Fini — Arrêter
        </button>
      </div>
    );
  }

  return null;
}
