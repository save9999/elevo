"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Child {
  id: string; name: string; avatar: string; ageGroup: string;
  level: number; xp: number; streak: number;
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
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => {
        if (!r.ok) { router.push("/parent"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setChild(data);
        const greetings = ageGreetings[data.ageGroup] || ageGreetings["primaire"];
        setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
        setLoading(false);
      });
  }, [id, router]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          {/* Top row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
                {child.avatar}
              </div>
              <div>
                <h1 className="font-black text-white text-xl">{child.name}</h1>
                <p className="text-white/70 text-sm">{greeting}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {child.streak > 0 && (
                <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-center">
                  <div className="text-lg">🔥</div>
                  <div className="text-xs font-bold text-white">{child.streak}j</div>
                </div>
              )}
              <Link
                href="/parent"
                className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-xs font-bold text-white hover:bg-white/30 transition-colors"
              >
                👨‍👩‍👧 Parents
              </Link>
            </div>
          </div>

          {/* XP Bar */}
          <XPBar xp={child.xp} level={child.level} />

          {/* Recent achievements */}
          {child.achievements.length > 0 && (
            <div className="flex gap-2 mt-4">
              {child.achievements.slice(0, 4).map((a) => (
                <span key={a.id} title={a.title} className="text-2xl">{a.emoji}</span>
              ))}
              {child.achievements.length > 4 && (
                <span className="text-white/60 text-sm self-center">+{child.achievements.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="bg-slate-50 rounded-t-[2rem] min-h-[calc(100vh-200px)] px-6 pt-8 pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Alert if troubles detected */}
          {troubles.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-amber-800 text-sm">On travaille ensemble !</p>
                <p className="text-amber-700 text-sm">
                  Elevo a préparé des exercices spéciaux pour t&apos;aider avec {troubles[0]}.
                </p>
              </div>
            </div>
          )}

          <h2 className="font-black text-2xl text-slate-800 mb-6">
            Que veux-tu faire aujourd&apos;hui ? 🎯
          </h2>

          {/* Module grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableModules.map((mod) => (
              <Link
                key={mod.id}
                href={`/child/${child.id}/module/${mod.id}`}
                className={`card-bubble border-2 ${mod.border} ${mod.bg} p-5 flex flex-col gap-3 group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {mod.emoji}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm leading-tight">{mod.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{mod.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Chat with Elevo */}
          <div className="mt-8">
            <Link
              href={`/child/${child.id}/chat`}
              className="card-bubble bg-gradient-to-r from-violet-500 to-purple-600 p-6 flex items-center gap-4 hover:shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="font-black text-white text-lg">Parler avec Elevo IA</h3>
                <p className="text-white/80 text-sm">Pose n&apos;importe quelle question, je suis là pour toi !</p>
              </div>
              <span className="text-white text-2xl">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
