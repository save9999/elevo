"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LumoCharacter, { LumoMood, getLumoMood } from "@/components/LumoCharacter";
import { useLumoSpeech } from "@/components/useLumoSpeech";

interface Child {
  id: string; name: string; avatar: string; ageGroup: string;
  level: number; xp: number; streak: number; lastActivity: string | null;
  sessions: { id: string; module: string; xpEarned: number }[];
}

type Activity = "home" | "chat" | "game";

// ── Mini-jeu : Lumo pose des devinettes ──────────────────────────────────────
const RIDDLES: Record<string, { q: string; options: string[]; correct: number; reaction: string }[]> = {
  maternelle: [
    { q: "De quelle couleur est le ciel ?", options: ["Rouge", "Bleu", "Vert", "Jaune"], correct: 1, reaction: "Super ! Le ciel est bleu comme mes yeux ! 🌈" },
    { q: "Quel animal fait 'Meow' ?", options: ["Chien", "Vache", "Chat", "Canard"], correct: 2, reaction: "Bravo ! Miaou ! 🐱" },
    { q: "Combien font 2 + 2 ?", options: ["3", "5", "4", "6"], correct: 2, reaction: "Génial ! Tu es fort(e) en maths ! 🔢" },
    { q: "Quel fruit est rouge ?", options: ["Banane", "Pomme", "Citron", "Raisin"], correct: 1, reaction: "Bien joué ! La pomme rouge, miam ! 🍎" },
    { q: "Qu'est-ce qui brille la nuit ?", options: ["Le soleil", "La lune", "Les étoiles", "La lune et les étoiles"], correct: 3, reaction: "Exactement ! La nuit est magique ! ⭐" },
  ],
  primaire: [
    { q: "Quelle est la capitale de la France ?", options: ["Lyon", "Marseille", "Paris", "Bordeaux"], correct: 2, reaction: "Bravo ! Paris, ville des lumières ! 🗼" },
    { q: "Combien y a-t-il de planètes dans le système solaire ?", options: ["7", "8", "9", "10"], correct: 1, reaction: "Exact ! 8 planètes dont la Terre ! 🚀" },
    { q: "Quel est le plus grand animal terrestre ?", options: ["Lion", "Éléphant", "Rhinocéros", "Girafe"], correct: 1, reaction: "Super ! L'éléphant peut peser 6 tonnes ! 🐘" },
    { q: "Quelle est la formule de l'eau ?", options: ["CO2", "H2O", "O2", "NaCl"], correct: 1, reaction: "Parfait ! H2O, deux hydrogène un oxygène ! 💧" },
    { q: "Qui a peint la Joconde ?", options: ["Picasso", "Monet", "Léonard de Vinci", "Raphaël"], correct: 2, reaction: "Bravo ! Un génie absolu du XVe siècle ! 🎨" },
  ],
  "college-lycee": [
    { q: "Quelle est la vitesse de la lumière ?", options: ["100 000 km/s", "200 000 km/s", "300 000 km/s", "400 000 km/s"], correct: 2, reaction: "Parfait ! 300 000 km/s, soit 1 milliard km/h ! ⚡" },
    { q: "Qui a découvert la pénicilline ?", options: ["Pasteur", "Curie", "Fleming", "Darwin"], correct: 2, reaction: "Exact ! Fleming en 1928 par accident ! 💊" },
    { q: "Quelle est la racine carrée de 196 ?", options: ["12", "14", "16", "13"], correct: 1, reaction: "Excellent ! 14 × 14 = 196, bien calculé ! 🔢" },
    { q: "En quelle année a commencé la Première Guerre mondiale ?", options: ["1910", "1912", "1914", "1916"], correct: 2, reaction: "Correct ! 1914-1918, une période sombre de l'histoire ! 📚" },
    { q: "Quel gaz est le plus abondant dans l'atmosphère terrestre ?", options: ["Oxygène", "CO2", "Azote", "Argon"], correct: 2, reaction: "Bravo ! L'azote représente 78% de l'air ! 🌍" },
  ],
};

// ── Réactions de Lumo aux clics ───────────────────────────────────────────────
const LUMO_REACTIONS: Record<string, string[]> = {
  maternelle: [
    "Hihihi ! Tu me chatouilles ! 😄",
    "Waouh, t'es trop fort(e) ! ⭐",
    "On est les meilleurs amis ! 🤗",
    "Je t'adore ! 💛",
    "Tu me fais trop rire ! 😂",
  ],
  primaire: [
    "Hey, pas de chatouilles ! 😄",
    "Tu es vraiment top ! 🚀",
    "On va tout déchirer ensemble ! 💪",
    "Super équipe qu'on forme ! ⭐",
    "Tu m'épates chaque fois ! 🎉",
  ],
  "college-lycee": [
    "Ça va, ça va ! 😄",
    "Toujours là pour toi ! 🤙",
    "On va accomplir de grandes choses ! ✨",
    "Cool de te voir aujourd'hui ! 😎",
    "Tu assures vraiment ! 🔥",
  ],
};

// ── Chat avec Lumo (via API IA) ───────────────────────────────────────────────
interface Message { role: "user" | "assistant"; content: string }

function LumoChat({ child }: { child: Child }) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: `Salut ${child.name.split(" ")[0]} ! 🌟 Je suis Lumo, ton compagnon ! De quoi veux-tu qu'on parle ?`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMsg],
        childProfile: {
          name: child.name,
          age: child.ageGroup === "maternelle" ? 5 : child.ageGroup === "primaire" ? 8 : 14,
          ageGroup: child.ageGroup,
          level: child.level,
          lumoPersona: true,
        },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    }
    setLoading(false);
  }

  const lumoColor =
    child.ageGroup === "maternelle" ? "from-amber-400 to-orange-500" :
    child.ageGroup === "primaire" ? "from-emerald-500 to-teal-600" :
    "from-violet-500 to-purple-600";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "assistant" && (
              <div className="shrink-0 mt-1">
                <LumoCharacter
                  ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
                  level={child.level}
                  mood="happy"
                  size={36}
                />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? `bg-gradient-to-br ${lumoColor} text-white rounded-br-sm`
                : "bg-white text-slate-700 shadow-sm rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="shrink-0">
              <LumoCharacter ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"} level={child.level} mood="idle" size={36} />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-slate-100 bg-white px-4 py-3">
        <form onSubmit={send} className="flex gap-2">
          <input
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Parle à Lumo…"
            className="flex-1 border-2 border-slate-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-violet-400 text-slate-700 text-sm"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}
            className={`bg-gradient-to-r ${lumoColor} text-white w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-60 font-bold`}>
            →
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function LumoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [activity, setActivity] = useState<Activity>("home");
  const [lumoMood, setLumoMood] = useState<LumoMood>("idle");
  const [reactionMsg, setReactionMsg] = useState<string | null>(null);
  const [reactionKey, setReactionKey] = useState(0);
  const [started, setStarted] = useState(false);
  const pendingGreeting = useRef<string | null>(null);

  // Jeu de devinettes
  const [riddleStep, setRiddleStep] = useState(0);
  const [riddleScore, setRiddleScore] = useState(0);
  const [riddleChosen, setRiddleChosen] = useState<number | null>(null);
  const [riddleFeedback, setRiddleFeedback] = useState<string | null>(null);
  const [riddleDone, setRiddleDone] = useState(false);
  const [riddleList, setRiddleList] = useState<(typeof RIDDLES)[string]>([]);

  const ageGroupKey = (child?.ageGroup ?? "primaire") as "maternelle" | "primaire" | "college-lycee";
  const { speak, speaking } = useLumoSpeech(ageGroupKey);

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => { if (!r.ok) { router.push("/parent"); return null; } return r.json(); })
      .then((data) => {
        if (!data) return;
        setChild(data);
        setLumoMood(getLumoMood(data));
        const pool = RIDDLES[data.ageGroup] || RIDDLES.primaire;
        setRiddleList([...pool].sort(() => Math.random() - 0.5).slice(0, 5));
        // Stocke le salut pour le jouer après interaction utilisateur
        const greetings: Record<string, string> = {
          maternelle: `Salut ${data.name.split(" ")[0]} ! C'est moi, Lumo ! On va s'amuser ensemble !`,
          primaire: `Hey ${data.name.split(" ")[0]} ! Je suis Lumo, ton compagnon d'aventure !`,
          "college-lycee": `Salut ${data.name.split(" ")[0]} ! Je suis Lumo. On va faire de grandes choses ensemble !`,
        };
        pendingGreeting.current = greetings[data.ageGroup] || greetings.primaire;
      });
  }, [id, router]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLumoClick() {
    if (!child) return;
    const reactions = LUMO_REACTIONS[child.ageGroup] || LUMO_REACTIONS.primaire;
    const msg = reactions[Math.floor(Math.random() * reactions.length)];
    setReactionMsg(msg);
    setReactionKey((k) => k + 1);
    setLumoMood("excited");
    // Lumo dit sa réaction à voix haute
    speak(msg.replace(/[😄🌟💛😂🚀💪⭐🎉🔥😎✨🤙]/g, ""));
    setTimeout(() => {
      setLumoMood(getLumoMood(child));
      setReactionMsg(null);
    }, 3000);
  }

  function startGame() {
    setActivity("game");
    setRiddleStep(0);
    setRiddleScore(0);
    setRiddleChosen(null);
    setRiddleFeedback(null);
    setRiddleDone(false);
    speak("C'est parti ! Je te pose une devinette, tu réponds !");
  }

  function pickRiddle(idx: number) {
    if (riddleChosen !== null || !riddleList.length) return;
    const riddle = riddleList[riddleStep];
    setRiddleChosen(idx);
    const correct = idx === riddle.correct;
    if (correct) {
      setRiddleScore((s) => s + 1);
      setLumoMood("excited");
    } else {
      setLumoMood("idle");
    }
    const feedback = correct
      ? riddle.reaction.replace(/[🏼🎨🚀💧📚🌍🐘⚡💊🔢🌍😄🌈🐱🔢🍎⭐]/g, "")
      : `Pas tout à fait. La bonne réponse était : ${riddle.options[riddle.correct]}`;
    setRiddleFeedback(correct ? riddle.reaction : `Pas tout à fait… La bonne réponse était : "${riddle.options[riddle.correct]}" 🤔`);
    speak(feedback);
    setTimeout(() => {
      if (riddleStep >= riddleList.length - 1) {
        setRiddleDone(true);
        setLumoMood("proud");
        speak("Bravo ! La partie est terminée ! Tu as été fantastique !");
      } else {
        setRiddleStep((s) => s + 1);
        setRiddleChosen(null);
        setRiddleFeedback(null);
        setLumoMood("happy");
      }
    }, 2500);
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-bounce">🌟</div>
      </div>
    );
  }

  // Écran de démarrage — nécessaire pour débloquer l'autoplay audio dans les navigateurs
  if (!started) {
    const bg =
      child.ageGroup === "maternelle" ? "from-amber-500 via-orange-500 to-yellow-500" :
      child.ageGroup === "primaire" ? "from-emerald-600 via-teal-600 to-cyan-500" :
      "from-violet-700 via-purple-600 to-indigo-600";
    const firstName = child.name.split(" ")[0];
    return (
      <div className={`min-h-screen bg-gradient-to-br ${bg} flex flex-col items-center justify-center p-8`}>
        <LumoCharacter
          ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
          level={child.level}
          mood="happy"
          size={180}
          className="drop-shadow-2xl mb-6"
        />
        <h1 className="text-white font-black text-3xl text-center mb-2">
          {child.ageGroup === "maternelle" ? `Salut ${firstName} !` : `Hey ${firstName} !`}
        </h1>
        <p className="text-white/80 text-center mb-8 text-lg">
          Lumo est prêt à jouer avec toi !
        </p>
        <button
          onClick={() => {
            setStarted(true);
            if (pendingGreeting.current) {
              setTimeout(() => speak(pendingGreeting.current!), 200);
            }
          }}
          className="bg-white font-black text-slate-700 text-xl px-10 py-5 rounded-3xl shadow-2xl active:scale-95 transition-all"
        >
          {child.ageGroup === "maternelle" ? "🌟 Appuie ici !" : "🚀 C'est parti !"}
        </button>
      </div>
    );
  }

  const bgGradient =
    child.ageGroup === "maternelle" ? "from-amber-500 via-orange-500 to-yellow-500" :
    child.ageGroup === "primaire" ? "from-emerald-600 via-teal-600 to-cyan-500" :
    "from-violet-700 via-purple-600 to-indigo-600";

  const accentColor =
    child.ageGroup === "maternelle" ? "from-amber-400 to-orange-500" :
    child.ageGroup === "primaire" ? "from-emerald-400 to-teal-500" :
    "from-violet-500 to-purple-600";

  const totalXp = child.sessions?.reduce((sum, s) => sum + s.xpEarned, 0) ?? 0;
  const sessionCount = child.sessions?.length ?? 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex flex-col`}>
      {/* Header */}
      <header className="px-4 pt-6 pb-3 flex items-center gap-3 shrink-0">
        <Link href={`/child/${id}`} className="text-white/80 hover:text-white p-2 text-xl">←</Link>
        <div>
          <h1 className="font-black text-white text-lg">Lumo</h1>
          <p className="text-white/70 text-xs">Ton compagnon de toujours ✨</p>
        </div>
        <div className="ml-auto flex gap-2">
          {(["home", "game", "chat"] as Activity[]).map((a) => (
            <button key={a} onClick={() => setActivity(a)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activity === a ? "bg-white text-slate-700" : "bg-white/20 text-white hover:bg-white/30"
              }`}>
              {a === "home" ? "🏠" : a === "game" ? "🎮" : "💬"}
            </button>
          ))}
        </div>
      </header>

      {/* ── HOME : interaction avec Lumo ── */}
      {activity === "home" && (
        <div className="flex-1 flex flex-col items-center px-4 pb-8">
          {/* Message de réaction */}
          {reactionMsg && (
            <div key={reactionKey} className="speech-bubble bg-white rounded-2xl rounded-bl-sm px-5 py-3 shadow-xl mb-2 max-w-[280px] text-center">
              <p className="text-sm font-bold text-slate-700">{reactionMsg}</p>
            </div>
          )}
          {!reactionMsg && (
            <div className="bg-white/90 rounded-2xl px-5 py-2.5 shadow-md mb-2 max-w-[260px] text-center">
              <p className="text-sm font-semibold text-slate-700">
                {child.ageGroup === "maternelle" ? "Appuie sur moi ! 👆" :
                child.ageGroup === "primaire" ? "Clique sur moi ! 👆" :
                "Touche-moi pour interagir ! 👆"}
              </p>
            </div>
          )}

          {/* Lumo grand et cliquable */}
          <LumoCharacter
            ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
            level={child.level}
            mood={lumoMood}
            speaking={speaking}
            size={220}
            onClick={handleLumoClick}
            className="drop-shadow-2xl"
          />

          {/* Stats de l'aventure partagée */}
          <div className="bg-white/15 backdrop-blur rounded-3xl p-5 w-full max-w-sm mt-4 space-y-3">
            <p className="text-white font-black text-center text-sm">Notre aventure ensemble</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 rounded-2xl py-3 text-center">
                <p className="text-2xl font-black text-white">{sessionCount}</p>
                <p className="text-white/70 text-xs font-medium">Sessions</p>
              </div>
              <div className="bg-white/20 rounded-2xl py-3 text-center">
                <p className="text-2xl font-black text-white">{totalXp}</p>
                <p className="text-white/70 text-xs font-medium">XP gagnés</p>
              </div>
              <div className="bg-white/20 rounded-2xl py-3 text-center">
                <p className="text-2xl font-black text-white">{child.streak}🔥</p>
                <p className="text-white/70 text-xs font-medium">Jours</p>
              </div>
            </div>
          </div>

          {/* Boutons d'humeur */}
          <div className="bg-white/15 backdrop-blur rounded-3xl p-5 w-full max-w-sm mt-3">
            <p className="text-white font-bold text-center text-sm mb-3">Comment tu te sens ?</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { emoji: "😄", label: "Super", mood: "excited" as LumoMood },
                { emoji: "🙂", label: "Bien", mood: "happy" as LumoMood },
                { emoji: "😐", label: "Moyen", mood: "idle" as LumoMood },
                { emoji: "😴", label: "Fatigué", mood: "sleeping" as LumoMood },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setLumoMood(item.mood);
                    const reacts: Record<string, string> = {
                      excited: "Génial ! Moi aussi je suis super content ! Allez, on s'amuse !",
                      happy: "Cool ! On va passer une super journée ensemble !",
                      idle: "Je suis là pour toi, quoi qu'il arrive !",
                      sleeping: "Tu es fatigué ? Repose-toi bien, je reste là !",
                    };
                    const msg = reacts[item.mood];
                    setReactionMsg(msg);
                    setReactionKey((k) => k + 1);
                    speak(msg);
                    setTimeout(() => setReactionMsg(null), 4000);
                  }}
                  className="flex flex-col items-center bg-white/20 hover:bg-white/35 rounded-2xl py-2.5 px-1 transition-all"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-white text-xs font-medium mt-0.5">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA jouer / parler */}
          <div className="flex gap-3 mt-4 w-full max-w-sm">
            <button onClick={startGame}
              className="flex-1 bg-white font-black text-slate-700 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm">
              🎮 Jeu de devinettes
            </button>
            <button onClick={() => setActivity("chat")}
              className="flex-1 bg-white/20 text-white font-bold py-4 rounded-2xl hover:bg-white/30 transition-all text-sm">
              💬 Parler
            </button>
          </div>
        </div>
      )}

      {/* ── GAME : devinettes avec Lumo ── */}
      {activity === "game" && (
        <div className="flex-1 bg-slate-50 rounded-t-[2rem] overflow-y-auto">
          <div className="max-w-md mx-auto px-5 py-7">
            {riddleDone ? (
              <div className="text-center space-y-6">
                <LumoCharacter
                  ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
                  level={child.level}
                  mood="proud"
                  size={180}
                  className="mx-auto"
                />
                <h2 className="text-3xl font-black text-slate-800">Partie terminée !</h2>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6">
                  <p className="text-5xl font-black text-violet-700 mb-1">{riddleScore}/{riddleList.length}</p>
                  <p className="text-slate-600 font-semibold">
                    {riddleScore === riddleList.length ? "Parfait ! Tu es imbattable ! 🏆" :
                    riddleScore >= Math.ceil(riddleList.length / 2) ? "Super résultat ! Encore un peu ! 💪" :
                    "Continue à t'entraîner, tu progresses ! 🌟"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={startGame}
                    className={`flex-1 bg-gradient-to-r ${accentColor} text-white font-bold py-4 rounded-2xl`}>
                    Rejouer 🔄
                  </button>
                  <button onClick={() => setActivity("home")}
                    className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl">
                    Accueil 🏠
                  </button>
                </div>
              </div>
            ) : riddleList.length > 0 ? (
              <div className="space-y-5">
                {/* Progress */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-slate-500">Question {riddleStep + 1}/{riddleList.length}</span>
                  <span className="text-sm font-black text-green-600">{riddleScore} ✓</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all"
                    style={{ width: `${(riddleStep / riddleList.length) * 100}%` }} />
                </div>

                {/* Lumo mini + question */}
                <div className="flex items-start gap-4">
                  <LumoCharacter
                    ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
                    level={child.level}
                    mood={lumoMood}
                    size={70}
                    className="shrink-0"
                  />
                  <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm flex-1">
                    <p className="font-black text-slate-800 text-base leading-snug">{riddleList[riddleStep].q}</p>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                  {riddleList[riddleStep].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => pickRiddle(i)}
                      disabled={riddleChosen !== null}
                      className={`px-4 py-4 rounded-2xl border-2 font-bold text-sm text-left transition-all ${
                        riddleChosen === null
                          ? "border-slate-200 bg-white text-slate-700 hover:border-violet-400 hover:bg-violet-50 active:scale-95"
                          : i === riddleList[riddleStep].correct
                          ? "border-green-400 bg-green-50 text-green-700"
                          : i === riddleChosen
                          ? "border-red-300 bg-red-50 text-red-600"
                          : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Feedback Lumo */}
                {riddleFeedback && (
                  <div className={`rounded-2xl p-4 text-sm font-semibold ${
                    riddleChosen === riddleList[riddleStep].correct
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-orange-50 border border-orange-200 text-orange-800"
                  }`}>
                    {riddleFeedback}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl animate-bounce">🎮</div>
                <p className="text-slate-500 mt-3">Chargement du jeu…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHAT : parler à Lumo ── */}
      {activity === "chat" && (
        <div className="flex-1 bg-slate-50 rounded-t-[2rem] flex flex-col overflow-hidden">
          <LumoChat child={child} />
        </div>
      )}
    </div>
  );
}
