"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LumoCharacter, { getLumoMood, getLumoMessage } from "@/components/LumoCharacter";

interface Child {
  id: string; name: string; avatar: string; ageGroup: string;
  level: number; xp: number; streak: number; lastActivity: string | null;
  profile: {
    scoreReading: number; scoreWriting: number; scoreMath: number;
    scoreMemory: number; scoreAttention: number; personalPlan: string;
    troubles: string;
  } | null;
  achievements: { id: string; title: string; emoji: string }[];
}

const modules = [
  {
    id: "assessment",
    name: "Mon évaluation",
    desc: "Découvre tes super-pouvoirs !",
    emoji: "🔍",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    ageGroups: ["maternelle", "primaire", "college-lycee"],
  },
  {
    id: "reading",
    name: "Lecture & Langage",
    desc: "Lis, comprends, explore les mots !",
    emoji: "📖",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ageGroups: ["maternelle", "primaire", "college-lycee"],
  },
  {
    id: "math",
    name: "Maths & Logique",
    desc: "Compte, calcule et résous des énigmes !",
    emoji: "🔢",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
    border: "border-green-200",
    ageGroups: ["maternelle", "primaire", "college-lycee"],
  },
  {
    id: "memory",
    name: "Mémoire & Attention",
    desc: "Entraîne ton cerveau comme un champion !",
    emoji: "🧠",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    ageGroups: ["maternelle", "primaire", "college-lycee"],
  },
  {
    id: "emotional",
    name: "Mes émotions",
    desc: "Comprends et gère tes sentiments.",
    emoji: "❤️",
    color: "from-red-400 to-pink-500",
    bg: "bg-red-50",
    border: "border-red-200",
    ageGroups: ["maternelle", "primaire", "college-lycee"],
  },
  {
    id: "social",
    name: "Relations & Amitié",
    desc: "Mieux se comprendre et s&apos;entraider.",
    emoji: "🤝",
    color: "from-orange-400 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    ageGroups: ["primaire", "college-lycee"],
  },
  {
    id: "physical",
    name: "Bien-être & Corps",
    desc: "Sommeil, alimentation, sport : prends soin de toi !",
    emoji: "💪",
    color: "from-teal-500 to-green-500",
    bg: "bg-teal-50",
    border: "border-teal-200",
    ageGroups: ["primaire", "college-lycee"],
  },
  {
    id: "creativity",
    name: "Créativité & Culture",
    desc: "Exprime-toi, invente, découvre le monde !",
    emoji: "🎨",
    color: "from-yellow-400 to-orange-400",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    ageGroups: ["maternelle", "primaire", "college-lycee"],
  },
  {
    id: "orientation",
    name: "Mon avenir",
    desc: "Découvre tes passions et tes métiers !",
    emoji: "🚀",
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    ageGroups: ["college-lycee"],
  },
];

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpPerLevel = 500;
  const currentXp = xp % xpPerLevel;
  const pct = Math.min((currentXp / xpPerLevel) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-black text-white/90">Niv.{level}</span>
      <div className="flex-1 h-4 bg-white/20 rounded-full overflow-hidden">
        <div
          className="xp-bar h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white/80">{currentXp}/{xpPerLevel}</span>
    </div>
  );
}

const ageGreetings: Record<string, string[]> = {
  maternelle: ["C&apos;est l&apos;heure d&apos;apprendre ! 🌈", "On joue et on découvre ! 🎈", "Super journée en vue ! ⭐"],
  primaire: ["Prêt(e) pour une nouvelle aventure ? 🚀", "Continue comme ça, tu es génial(e) ! 💪", "Nouvelle session, nouveaux super-pouvoirs ! ⚡"],
  "college-lycee": ["Concentre-toi et donne le meilleur ! 🎯", "Chaque effort compte pour ton futur ! 🌟", "Tu es capable de grandes choses ! 🏆"],
};

export default function ChildHomePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [lumoMsg, setLumoMsg] = useState("");
  const [msgKey, setMsgKey] = useState(0);

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => {
        if (!r.ok) { router.push("/parent"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setChild(data);
        setLumoMsg(getLumoMessage(data));
        setLoading(false);
      });
  }, [id, router]);

  // Change le message de Lumo toutes les 10 secondes
  useEffect(() => {
    if (!child) return;
    const interval = setInterval(() => {
      setLumoMsg(getLumoMessage(child));
      setMsgKey((k) => k + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, [child]);

  if (loading || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
        <div className="text-center text-white">
          <div className="text-7xl animate-bounce mb-4">🌟</div>
          <p className="font-bold text-xl">Chargement…</p>
        </div>
      </div>
    );
  }

  const availableModules = modules.filter((m) => m.ageGroups.includes(child.ageGroup));
  const troubles = (() => { try { return JSON.parse(child.profile?.troubles || "[]"); } catch { return []; } })();
  const lumoMood = getLumoMood(child);

  const bgGradient =
    child.ageGroup === "maternelle" ? "from-amber-500 via-orange-500 to-yellow-500" :
    child.ageGroup === "primaire" ? "from-emerald-600 via-teal-600 to-cyan-600" :
    "from-violet-600 via-purple-600 to-indigo-700";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Header avec Lumo */}
      <header className="px-4 pt-5 pb-0">
        <div className="max-w-md mx-auto">

          {/* Barre nav top */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg">{child.name}</span>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Niv.{child.level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {child.streak > 0 && (
                <div className="bg-white/20 backdrop-blur rounded-xl px-2.5 py-1.5 flex items-center gap-1">
                  <span className="text-base">🔥</span>
                  <span className="text-xs font-black text-white">{child.streak}j</span>
                </div>
              )}
              <Link href={`/child/${id}/profile`}
                className="bg-white/20 backdrop-blur rounded-xl px-2.5 py-1.5 text-sm font-bold text-white hover:bg-white/30 transition-colors">
                🏆
              </Link>
              <Link href="/parent"
                className="bg-white/20 backdrop-blur rounded-xl px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition-colors">
                👨‍👩‍👧
              </Link>
            </div>
          </div>

          {/* Zone Lumo */}
          <div className="flex flex-col items-center pt-2 pb-4">
            {/* Bulle de dialogue */}
            <div key={msgKey} className="speech-bubble relative bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-lg mb-1 max-w-[260px] text-center">
              <p className="text-sm font-semibold text-slate-700 leading-snug">{lumoMsg}</p>
              {/* Petite queue vers le bas */}
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
            </div>

            {/* Personnage Lumo cliquable */}
            <LumoCharacter
              ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
              level={child.level}
              mood={lumoMood}
              size={170}
              onClick={() => router.push(`/child/${id}/lumo`)}
            />

            <p className="text-white/60 text-xs mt-1 font-medium">Appuie sur Lumo pour jouer !</p>
          </div>

          {/* XP Bar */}
          <XPBar xp={child.xp} level={child.level} />
        </div>
      </header>

      {/* Main content */}
      <main className="bg-slate-50 rounded-t-[2rem] min-h-[calc(100vh-200px)] px-4 pt-7 pb-10">
        <div className="max-w-md mx-auto">
          {/* Alert if troubles detected */}
          {troubles.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-amber-800 text-sm">On travaille ensemble !</p>
                <p className="text-amber-700 text-sm">
                  Lumo a préparé des exercices spéciaux pour t&apos;aider avec {troubles[0]}.
                </p>
              </div>
            </div>
          )}

          <h2 className="font-black text-xl text-slate-800 mb-4">
            Que veux-tu faire ? 🎯
          </h2>

          {/* Lumo interaction card */}
          <Link
            href={`/child/${id}/lumo`}
            className={`card-bubble mb-5 p-4 flex items-center gap-4 bg-gradient-to-r ${
              child.ageGroup === "maternelle" ? "from-amber-400 to-orange-500" :
              child.ageGroup === "primaire" ? "from-emerald-500 to-teal-600" :
              "from-violet-500 to-purple-700"
            }`}
          >
            <div className="shrink-0">
              <LumoCharacter
                ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
                level={child.level}
                mood="happy"
                size={64}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white">Jouer avec Lumo !</p>
              <p className="text-white/80 text-xs mt-0.5">Parler, explorer, grandir ensemble</p>
            </div>
            <span className="text-white text-xl shrink-0">→</span>
          </Link>

          {/* Module grid */}
          <div className="grid grid-cols-2 gap-3">
            {availableModules.map((mod) => (
              <Link
                key={mod.id}
                href={`/child/${child.id}/module/${mod.id}`}
                className={`card-bubble border-2 ${mod.border} ${mod.bg} p-4 flex flex-col gap-2.5 group`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>
                  {mod.emoji}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-xs leading-tight">{mod.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{mod.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Chat IA */}
          <div className="mt-4">
            <Link
              href={`/child/${child.id}/chat`}
              className="card-bubble bg-white border-2 border-slate-100 p-4 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-md">
                🤖
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-800 text-sm">Elevo IA</p>
                <p className="text-xs text-slate-500">Pose n&apos;importe quelle question !</p>
              </div>
              <span className="text-slate-400 text-xl">→</span>
            </Link>
          </div>

          <div className="pb-6" />
        </div>
      </main>
    </div>
  );
}
