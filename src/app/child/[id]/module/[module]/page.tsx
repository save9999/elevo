"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LumoCharacter from "@/components/LumoCharacter";

interface Child {
  id: string; name: string; avatar: string; ageGroup: string; level: number; xp: number;
}

// ── READING MODULE ─────────────────────────────────────────────────────────────
const ALL_STORIES: Record<string, { text: string; questions: { q: string; options: string[]; correct: number }[] }[]> = {
  maternelle: [
    {
      text: "🐱 Le chat s'appelle Mimi. Mimi aime jouer avec une pelote de laine rouge. Aujourd'hui, il fait beau et Mimi joue dans le jardin.",
      questions: [
        { q: "Comment s'appelle le chat ?", options: ["Tom", "Mimi", "Felix", "Luna"], correct: 1 },
        { q: "Avec quoi Mimi aime-t-il jouer ?", options: ["Une balle", "Une pelote de laine", "Un os", "Un poisson"], correct: 1 },
        { q: "Où Mimi joue-t-il aujourd'hui ?", options: ["Dans la maison", "À l'école", "Dans le jardin", "Dans la rue"], correct: 2 },
      ],
    },
    {
      text: "🐶 Léo est un petit chien très joyeux. Il a des poils tout dorés et une grande queue. Léo adore courir avec les enfants et attraper les balles rouges.",
      questions: [
        { q: "Comment s'appelle le chien ?", options: ["Max", "Rex", "Léo", "Fido"], correct: 2 },
        { q: "De quelle couleur sont ses poils ?", options: ["Blancs", "Noirs", "Dorés", "Gris"], correct: 2 },
        { q: "Qu'est-ce que Léo adore faire ?", options: ["Dormir", "Courir et attraper les balles", "Manger", "Nager"], correct: 1 },
      ],
    },
    {
      text: "🌧️ Aujourd'hui il pleut. Tom reste à la maison. Il dessine un arc-en-ciel avec ses crayons de couleur. Sa maman dit que c'est très beau.",
      questions: [
        { q: "Quel temps fait-il ?", options: ["Il fait beau", "Il neige", "Il pleut", "Il y a du vent"], correct: 2 },
        { q: "Que fait Tom ?", options: ["Il joue dehors", "Il dessine", "Il mange", "Il dort"], correct: 1 },
        { q: "Qu'est-ce que Tom dessine ?", options: ["Une maison", "Un chien", "Un arc-en-ciel", "Un arbre"], correct: 2 },
      ],
    },
  ],
  primaire: [
    {
      text: "🌍 La déforestation est un problème majeur pour notre planète. Chaque année, des millions d'arbres sont abattus pour faire place à des cultures ou des villes. Sans arbres, les animaux perdent leur habitat et l'air devient moins pur.",
      questions: [
        { q: "Qu'est-ce que la déforestation ?", options: ["Planter des arbres", "Couper des arbres", "Arroser les plantes", "Observer les oiseaux"], correct: 1 },
        { q: "Quelles sont les conséquences de la déforestation ?", options: ["Plus d'animaux", "Moins de pollution", "Les animaux perdent leur habitat", "L'air devient plus pur"], correct: 2 },
        { q: "Pourquoi coupe-t-on des arbres ?", options: ["Pour les vendre comme jouets", "Pour faire place à des cultures ou des villes", "Pour les replanter ailleurs", "Pour fabriquer des livres scolaires"], correct: 1 },
      ],
    },
    {
      text: "🦋 La métamorphose du papillon est l'un des phénomènes les plus fascinants de la nature. Une chenille tisse un cocon autour d'elle et, après plusieurs semaines, elle en sort transformée en magnifique papillon aux ailes colorées.",
      questions: [
        { q: "Qu'est-ce qu'une métamorphose ?", options: ["Un voyage", "Une transformation complète", "Une maladie", "Un jeu"], correct: 1 },
        { q: "Où la chenille se transforme-t-elle ?", options: ["Dans l'eau", "Dans un cocon", "Sous la terre", "Dans un arbre"], correct: 1 },
        { q: "En quoi se transforme la chenille ?", options: ["En abeille", "En araignée", "En papillon", "En fourmi"], correct: 2 },
      ],
    },
    {
      text: "🚀 Le système solaire est composé du Soleil et de tous les astres qui gravitent autour de lui. Il comprend huit planètes principales : Mercure, Vénus, la Terre, Mars, Jupiter, Saturne, Uranus et Neptune. La Terre est la seule planète connue où la vie existe.",
      questions: [
        { q: "Combien y a-t-il de planètes dans le système solaire ?", options: ["6", "7", "8", "9"], correct: 2 },
        { q: "Quelle est la planète où la vie existe ?", options: ["Mars", "Venus", "La Terre", "Jupiter"], correct: 2 },
        { q: "Autour de quoi gravitent les planètes ?", options: ["La Lune", "Le Soleil", "La Terre", "Une étoile lointaine"], correct: 1 },
      ],
    },
  ],
  "college-lycee": [
    {
      text: "🧬 La mitose est le processus par lequel une cellule se divise pour donner deux cellules filles identiques. Ce mécanisme est fondamental pour la croissance et la réparation des tissus. Il comprend quatre phases principales : la prophase, la métaphase, l'anaphase et la télophase.",
      questions: [
        { q: "Combien de cellules filles produit la mitose ?", options: ["1", "2", "4", "8"], correct: 1 },
        { q: "À quoi sert la mitose ?", options: ["À produire des gamètes", "À la croissance et réparation des tissus", "À la digestion", "À la respiration"], correct: 1 },
        { q: "Quelle est la première phase de la mitose ?", options: ["Anaphase", "Métaphase", "Prophase", "Télophase"], correct: 2 },
      ],
    },
    {
      text: "📜 La Révolution française de 1789 marque une rupture majeure dans l'histoire de France. Née d'une crise financière et sociale profonde, elle aboutit à l'abolition des privilèges, à la Déclaration des droits de l'homme et du citoyen, et à la fin de la monarchie absolue.",
      questions: [
        { q: "En quelle année a eu lieu la Révolution française ?", options: ["1689", "1789", "1789", "1889"], correct: 1 },
        { q: "Qu'est-ce que la Révolution a aboli ?", options: ["Le commerce", "Les privilèges", "L'agriculture", "La religion"], correct: 1 },
        { q: "Quel document a été rédigé pendant la Révolution ?", options: ["La Constitution américaine", "Le Manifeste du Parti communiste", "La Déclaration des droits de l'homme", "La Charte de l'ONU"], correct: 2 },
      ],
    },
    {
      text: "🌡️ Le réchauffement climatique désigne l'augmentation de la température moyenne à la surface de la Terre. Il est principalement causé par les émissions de gaz à effet de serre dues aux activités humaines. Ses conséquences incluent la montée des eaux, la multiplication des événements climatiques extrêmes et la disparition de nombreuses espèces.",
      questions: [
        { q: "Quelle est la principale cause du réchauffement climatique ?", options: ["Les volcans", "Les activités humaines", "Les marées", "Le soleil"], correct: 1 },
        { q: "Quelle est une conséquence du réchauffement ?", options: ["Plus de biodiversité", "Baisse des températures", "Montée des eaux", "Diminution des tempêtes"], correct: 2 },
        { q: "Par quoi le réchauffement est-il mesuré ?", options: ["La pression atmosphérique", "La température moyenne de la Terre", "Le niveau des océans", "Le nombre d'ouragans"], correct: 1 },
      ],
    },
  ],
};

function ReadingModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const storyList = ALL_STORIES[child.ageGroup] || ALL_STORIES.primaire;
  const [storyIdx] = useState(() => Math.floor(Math.random() * storyList.length));
  const story = storyList[storyIdx];
  const [step, setStep] = useState<"read" | "quiz" | "done">("read");
  const [answers, setAnswers] = useState<(number | null)[]>(story.questions.map(() => null));
  const [current, setCurrent] = useState(0);
  function answer(idx: number) {
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    if (current < story.questions.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 1500);
    } else {
      setTimeout(() => setStep("done"), 1500);
    }
  }

  if (step === "read") {
    return (
      <div className="space-y-5">
        {/* Lumo narrateur — affiché en haut, lit automatiquement */}
        <div className="flex items-center gap-4 bg-blue-50 rounded-2xl p-4">
          <div className="shrink-0">
            <LumoCharacter
              ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
              level={child.level}
              mood="happy"
              size={72}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-blue-700">Lumo te raconte l&apos;histoire !</p>
          </div>
        </div>

        {/* Texte de l'histoire */}
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 text-slate-700 text-base leading-relaxed font-medium shadow-sm">
          {story.text}
        </div>

        <button
          onClick={() => setStep("quiz")}
          className="btn-fun w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 text-lg"
        >
          J&apos;ai compris ! Quiz 🧠
        </button>
      </div>
    );
  }

  if (step === "quiz") {
    const q = story.questions[current];
    return (
      <div className="space-y-5">
        {/* Lumo pose la question */}
        <div className="flex items-center gap-3 mb-1">
          <LumoCharacter
            ageGroup={child.ageGroup as "maternelle" | "primaire" | "college-lycee"}
            level={child.level}
            mood="happy"
            size={52}
          />
          <div>
            <div className="flex justify-between text-sm text-slate-500 font-bold gap-4">
              <span>Question {current + 1}/{story.questions.length}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full w-40 mt-1">
              <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${(current / story.questions.length) * 100}%` }} />
            </div>
          </div>
        </div>
        <p className="text-xl font-black text-slate-800">{q.q}</p>
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => answer(i)}
              className={`text-left px-5 py-4 rounded-2xl font-semibold border-2 transition-all text-slate-700 ${
                answers[current] === i
                  ? i === q.correct
                    ? "bg-green-100 border-green-400"
                    : "bg-red-100 border-red-400"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const correct = answers.filter((a, i) => a === story.questions[i].correct).length;
  const score = Math.round((correct / story.questions.length) * 100);
  const xp = score >= 80 ? 50 : score >= 50 ? 30 : 15;
  return (
    <div className="text-center space-y-6">
      <div className="text-7xl">{score >= 80 ? "🏆" : score >= 50 ? "⭐" : "💪"}</div>
      <h3 className="text-3xl font-black text-slate-800">{correct}/{story.questions.length} bonnes réponses !</h3>
      <p className="text-slate-500">{score >= 80 ? "Excellent ! Tu as tout compris !" : score >= 50 ? "Bien joué ! Continue tes efforts !" : "Pas grave, lis à nouveau et réessaie !"}</p>
      <div className="bg-violet-50 rounded-2xl p-4">
        <p className="text-2xl font-black text-violet-600">+{xp} XP gagnés ! ✨</p>
      </div>
      <button
        onClick={() => onComplete(score, xp)}
        className="btn-fun w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 text-lg"
      >
        Continuer 🚀
      </button>
    </div>
  );
}

// ── MATH MODULE ─────────────────────────────────────────────────────────────
const MATH_POOLS: Record<string, { q: string; answer: string }[]> = {
  maternelle: [
    { q: "🍎🍎🍎 + 🍎🍎 = ?", answer: "5" },
    { q: "🐣🐣🐣🐣 - 🐣🐣 = ?", answer: "2" },
    { q: "3 + 4 = ?", answer: "7" },
    { q: "6 - 2 = ?", answer: "4" },
    { q: "2 + 2 = ?", answer: "4" },
    { q: "8 - 3 = ?", answer: "5" },
    { q: "🌟🌟 + 🌟🌟🌟 = ?", answer: "5" },
    { q: "4 + 3 = ?", answer: "7" },
    { q: "9 - 4 = ?", answer: "5" },
    { q: "🐱🐱🐱 + 🐱 = ?", answer: "4" },
    { q: "5 + 5 = ?", answer: "10" },
    { q: "7 - 3 = ?", answer: "4" },
  ],
  primaire: [
    { q: "24 × 3 = ?", answer: "72" },
    { q: "144 ÷ 12 = ?", answer: "12" },
    { q: "15% de 200 = ?", answer: "30" },
    { q: "√49 = ?", answer: "7" },
    { q: "63 ÷ 7 = ?", answer: "9" },
    { q: "17 × 4 = ?", answer: "68" },
    { q: "25% de 80 = ?", answer: "20" },
    { q: "√64 = ?", answer: "8" },
    { q: "45 + 38 = ?", answer: "83" },
    { q: "120 ÷ 8 = ?", answer: "15" },
    { q: "12 × 12 = ?", answer: "144" },
    { q: "50% de 150 = ?", answer: "75" },
  ],
  "college-lycee": [
    { q: "Résoudre : 2x + 5 = 13, x = ?", answer: "4" },
    { q: "sin(90°) = ?", answer: "1" },
    { q: "log₁₀(1000) = ?", answer: "3" },
    { q: "Dériver f(x) = x² : f'(x) = ?", answer: "2x" },
    { q: "Résoudre : 3x - 7 = 8, x = ?", answer: "5" },
    { q: "cos(0°) = ?", answer: "1" },
    { q: "log₂(8) = ?", answer: "3" },
    { q: "Dériver f(x) = 3x² : f'(x) = ?", answer: "6x" },
    { q: "Résoudre : x² = 25, x = ?", answer: "5" },
    { q: "tan(45°) = ?", answer: "1" },
    { q: "Périmètre d'un cercle de rayon 5 : 2π× ?", answer: "5" },
    { q: "Résoudre : 5x + 10 = 35, x = ?", answer: "5" },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function MathModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [done, setDone] = useState(false);

  const [problems] = useState(() => {
    const pool = MATH_POOLS[child.ageGroup] || MATH_POOLS.primaire;
    return shuffle(pool).slice(0, 5);
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const isCorrect = input.trim().toLowerCase() === problems[current].answer.toLowerCase();
    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      setAnswers((a) => [...a, input.trim()]);
      setFeedback("");
      setInput("");
      if (current >= problems.length - 1) setDone(true);
      else setCurrent((c) => c + 1);
    }, 1000);
  }

  if (done) {
    const correct = answers.filter((a, i) => a.toLowerCase() === problems[i].answer.toLowerCase()).length;
    const score = Math.round((correct / problems.length) * 100);
    const xp = score >= 80 ? 55 : score >= 50 ? 35 : 15;
    return (
      <div className="text-center space-y-6">
        <div className="text-7xl">{score >= 80 ? "🧮" : score >= 50 ? "⭐" : "💪"}</div>
        <h3 className="text-3xl font-black text-slate-800">{correct}/{problems.length} réponses correctes !</h3>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-2xl font-black text-green-600">+{xp} XP gagnés ! ✨</p>
        </div>
        <button onClick={() => onComplete(score, xp)} className="btn-fun w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 text-lg">
          Continuer 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-slate-500 font-bold">
        <span>Problème {current + 1}/{problems.length}</span>
        <span>{Math.round((current / problems.length) * 100)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full">
        <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${(current / problems.length) * 100}%` }} />
      </div>
      <div className={`bg-green-50 rounded-2xl p-8 text-center text-3xl font-black text-slate-800 transition-colors ${
        feedback === "correct" ? "bg-green-100" : feedback === "wrong" ? "bg-red-100" : ""
      }`}>
        {problems[current].q}
        {feedback === "correct" && <div className="text-green-500 mt-2 text-xl">✓ Correct !</div>}
        {feedback === "wrong" && <div className="text-red-500 mt-2 text-xl">✗ Réponse : {problems[current].answer}</div>}
      </div>
      <form onSubmit={submit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ta réponse…"
          className="flex-1 border-2 border-green-200 rounded-2xl px-4 py-3 text-slate-800 text-lg font-bold focus:outline-none focus:border-green-400"
          autoFocus
        />
        <button
          type="submit"
          className="btn-fun bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 text-lg"
        >
          ✓
        </button>
      </form>
    </div>
  );
}

// ── MEMORY MODULE ────────────────────────────────────────────────────────────
function MemoryModule({ onComplete }: { onComplete: (score: number, xp: number) => void }) {
  const emojis = ["🦊", "🐼", "🦁", "🐬", "🦋", "🐙", "🦄", "🐧"];
  const pairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  const [cards, setCards] = useState(pairs.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  function flip(id: number) {
    if (selected.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;
    const next = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(next);
    const newSel = [...selected, id];
    setSelected(newSel);
    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSel;
      if (next[a].emoji === next[b].emoji) {
        const matched = next.map((c) => newSel.includes(c.id) ? { ...c, matched: true } : c);
        setCards(matched);
        setSelected([]);
        if (matched.every((c) => c.matched)) setDone(true);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => newSel.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 900);
      }
    }
  }

  if (done) {
    const score = Math.max(0, 100 - (moves - emojis.length) * 5);
    const xp = score >= 80 ? 60 : score >= 50 ? 40 : 20;
    return (
      <div className="text-center space-y-6">
        <div className="text-7xl">🧠</div>
        <h3 className="text-3xl font-black text-slate-800">Bravo ! Toutes les paires trouvées !</h3>
        <p className="text-slate-500">{moves} coups pour tout trouver !</p>
        <div className="bg-pink-50 rounded-2xl p-4">
          <p className="text-2xl font-black text-pink-600">+{xp} XP gagnés ! ✨</p>
        </div>
        <button onClick={() => onComplete(score, xp)} className="btn-fun w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 text-lg">
          Continuer 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-500">
        <span>Trouve les paires !</span>
        <span>Coups : {moves}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flip(card.id)}
            className={`h-16 rounded-2xl text-3xl flex items-center justify-center font-bold transition-all duration-300 ${
              card.flipped || card.matched
                ? card.matched ? "bg-green-100 text-green-600 scale-95" : "bg-pink-100"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
          >
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── EMOTIONAL MODULE ─────────────────────────────────────────────────────────
function EmotionalModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const scenarios = [
    {
      situation: "Ton ami a dit quelque chose de blessant devant toute la classe.",
      emotion: "😢",
      question: "Comment tu te sens ?",
      options: ["Je suis très triste et blessé(e)", "Je m'en fiche complètement", "Je suis content(e)", "Je veux me battre"],
      best: 0,
      advice: "Il est normal de se sentir blessé(e). Tu peux en parler à un adulte de confiance ou à ton ami en privé.",
    },
    {
      situation: "Tu as beaucoup travaillé pour un examen mais tu n'as pas eu une bonne note.",
      emotion: "😤",
      question: "Quelle est la meilleure réaction ?",
      options: ["Arrêter de travailler", "Analyser mes erreurs et demander de l'aide", "Copier sur les autres", "Pleurer sans rien faire"],
      best: 1,
      advice: "Analyser ses erreurs est la clé du progrès ! Chaque erreur est une occasion d'apprendre.",
    },
    {
      situation: "Un camarade est tout seul dans la cour et semble triste.",
      emotion: "🤝",
      question: "Que fais-tu ?",
      options: ["Je l'ignore", "Je vais lui parler et lui demander si ça va", "Je me moque de lui", "Je raconte à tout le monde"],
      best: 1,
      advice: "Aller vers quelqu'un qui semble seul, c'est un acte de gentillesse très courageux !",
    },
  ];

  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);

  function choose(idx: number) {
    setChosen(idx);
    setShowAdvice(true);
  }

  function next() {
    setScores((prev) => [...prev, chosen === scenarios[step].best]);
    setChosen(null);
    setShowAdvice(false);
    if (step >= scenarios.length - 1) {
      const correct = scores.filter(Boolean).length + (chosen === scenarios[step].best ? 1 : 0);
      const score = Math.round((correct / scenarios.length) * 100);
      onComplete(score, score >= 80 ? 45 : 30);
    } else {
      setStep((s) => s + 1);
    }
  }

  const s = scenarios[step];

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm font-bold text-slate-500">
        <span>Situation {step + 1}/{scenarios.length}</span>
      </div>
      <div className="bg-red-50 rounded-2xl p-5">
        <div className="text-4xl text-center mb-3">{s.emotion}</div>
        <p className="text-slate-700 font-medium text-center">{s.situation}</p>
      </div>
      <p className="font-black text-slate-800">{s.question}</p>
      <div className="space-y-2">
        {s.options.map((opt, i) => (
          <button
            key={i}
            disabled={showAdvice}
            onClick={() => choose(i)}
            className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${
              !showAdvice ? "border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 text-slate-700" :
              i === s.best ? "border-green-400 bg-green-50 text-green-700" :
              i === chosen ? "border-red-400 bg-red-50 text-red-700" :
              "border-slate-100 bg-slate-50 text-slate-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showAdvice && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-600 mb-1">💡 Conseil d&apos;Elevo</p>
          <p className="text-sm text-slate-700">{s.advice}</p>
        </div>
      )}
      {showAdvice && (
        <button onClick={next} className="btn-fun w-full bg-gradient-to-r from-red-400 to-pink-500 text-white py-4">
          {step >= scenarios.length - 1 ? "Voir mon résultat 🎯" : "Situation suivante →"}
        </button>
      )}
      {child && null}
    </div>
  );
}

// ── ASSESSMENT MODULE ────────────────────────────────────────────────────────
function AssessmentModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    { id: "reading_speed", q: "📖 Quand tu lis, les lettres semblent-elles parfois bouger ou se mélanger ?", options: ["Jamais", "Parfois", "Souvent", "Toujours"] },
    { id: "writing", q: "✏️ Est-ce que tu fais beaucoup de fautes d'orthographe même sur des mots que tu connais ?", options: ["Non, rarement", "Parfois oui", "Assez souvent", "Tout le temps"] },
    { id: "math", q: "🔢 Les chiffres et calculs te semblent-ils difficiles à retenir ?", options: ["Non, j'adore les maths", "Ça dépend des jours", "Souvent difficile", "Très difficile"] },
    { id: "attention", q: "🎯 As-tu du mal à rester concentré(e) sur une tâche longtemps ?", options: ["Non, ça va bien", "Parfois", "Souvent", "Presque toujours"] },
    { id: "motor", q: "✋ Trouves-tu difficile d'écrire proprement ou de faire des gestes précis ?", options: ["Non, c'est facile", "Parfois maladroit(e)", "Souvent difficile", "Très difficile"] },
    { id: "emotional", q: "😊 Comment tu te sens à l'école en général ?", options: ["Très bien !", "Plutôt bien", "Pas très bien", "Très anxieux/se"] },
    { id: "sleep", q: "😴 Est-ce que tu dors bien la nuit (7-9h) ?", options: ["Oui, toujours", "La plupart du temps", "Pas toujours", "Rarement"] },
    { id: "social", q: "👥 Est-ce que tu as des amis avec qui tu t'entends bien ?", options: ["Oui, plein !", "Quelques-uns", "Un ou deux", "Pas vraiment"] },
  ];

  function answer(value: string) {
    const q = questions[step];
    const newAnswers = { ...answers, [q.id]: { question: q.q, answer: value, index: q.options.indexOf(value) } };
    setAnswers(newAnswers);
    if (step >= questions.length - 1) {
      submitAssessment(newAnswers);
    } else {
      setStep((s) => s + 1);
    }
  }

  async function submitAssessment(finalAnswers: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: child.id, answers: finalAnswers, assessmentType: "Bilan général" }),
      });
      const data = await res.json();
      setResult(data.riskLevel ? data : { riskLevel: "low", strengths: [], detectedChallenges: [], recommendations: [], summary: "Évaluation terminée !" });
    } catch {
      setResult({ riskLevel: "low", strengths: [], detectedChallenges: [], recommendations: [], summary: "Évaluation terminée ! Consulte le tableau de bord parent pour les détails." });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl animate-bounce mb-4">🔍</div>
        <p className="font-bold text-slate-700">Elevo analyse ton profil…</p>
        <p className="text-sm text-slate-500 mt-1">Ça prend quelques secondes</p>
      </div>
    );
  }

  if (result) {
    const typedResult = result as {
      riskLevel?: string;
      summary?: string;
      strengths?: string[];
      detectedChallenges?: string[];
      recommendations?: string[];
    };
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-6xl mb-3">📊</div>
          <h3 className="text-2xl font-black text-slate-800">Ton profil Elevo</h3>
        </div>
        {typedResult.summary && (
          <div className="bg-violet-50 rounded-2xl p-4">
            <p className="font-medium text-slate-700 text-center">{typedResult.summary}</p>
          </div>
        )}
        {typedResult.strengths && typedResult.strengths.length > 0 && (
          <div>
            <p className="text-sm font-bold text-green-600 mb-2">✨ Tes points forts</p>
            <div className="space-y-1">
              {typedResult.strengths.map((s: string) => (
                <div key={s} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 text-sm text-slate-700">
                  <span className="text-green-500">✓</span> {s}
                </div>
              ))}
            </div>
          </div>
        )}
        {typedResult.detectedChallenges && typedResult.detectedChallenges.length > 0 && (
          <div>
            <p className="text-sm font-bold text-amber-600 mb-2">💪 À travailler ensemble</p>
            <div className="space-y-1">
              {typedResult.detectedChallenges.map((c: string) => (
                <div key={c} className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 text-sm text-slate-700">
                  <span className="text-amber-500">→</span> {c}
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => onComplete(75, 100)}
          className="btn-fun w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 text-lg"
        >
          Super ! Continuer 🚀
        </button>
      </div>
    );
  }

  const q = questions[step];
  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm font-bold text-slate-500">
        <span>Question {step + 1}/{questions.length}</span>
        <span>{Math.round((step / questions.length) * 100)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full">
        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(step / questions.length) * 100}%` }} />
      </div>
      <p className="text-xl font-black text-slate-800 leading-snug">{q.q}</p>
      <div className="space-y-3">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => answer(opt)}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50 font-semibold text-slate-700 transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ORIENTATION MODULE ────────────────────────────────────────────────────────
function OrientationModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ careers: string[]; advice: string } | null>(null);

  const questions = [
    { q: "Qu'est-ce que tu préfères faire à l'école ?", options: ["Résoudre des problèmes de maths", "Écrire des histoires ou des rédactions", "Faire des expériences de sciences", "Dessiner et créer", "Aider mes camarades"] },
    { q: "Qu'est-ce qui te passionne en dehors de l'école ?", options: ["La technologie et l'informatique", "Le sport et l'activité physique", "La musique ou les arts", "Les animaux et la nature", "Les jeux de stratégie"] },
    { q: "Dans quelle situation tu te sens le mieux ?", options: ["Quand je travaille seul(e)", "Quand je travaille en équipe", "Quand j'aide quelqu'un", "Quand je crée quelque chose", "Quand je résous un problème difficile"] },
    { q: "Quelle qualité te décrit le mieux ?", options: ["Curieux/se et analytique", "Créatif/ve et imaginatif/ve", "Organisé(e) et méthodique", "Empathique et à l'écoute", "Ambitieux/se et déterminé(e)"] },
  ];

  function answer(opt: string) {
    const newAns = [...answers, opt];
    setAnswers(newAns);
    if (step >= questions.length - 1) {
      // Simple career mapping
      const careerMap: Record<string, string[]> = {
        "Résoudre des problèmes de maths": ["Ingénieur(e)", "Mathématicien(ne)", "Data Scientist"],
        "Écrire des histoires ou des rédactions": ["Auteur(e)", "Journaliste", "Avocat(e)"],
        "Faire des expériences de sciences": ["Chercheur(e)", "Médecin", "Pharmacien(ne)"],
        "Dessiner et créer": ["Designer", "Architecte", "Artiste"],
        "Aider mes camarades": ["Professeur(e)", "Psychologue", "Assistant(e) social(e)"],
        "La technologie et l'informatique": ["Développeur(se)", "Cybersécurité", "Intelligence Artificielle"],
        "Le sport et l'activité physique": ["Kinésithérapeute", "Coach sportif", "Médecin du sport"],
        "La musique ou les arts": ["Musicien(ne)", "Chef de projet culturel", "Directeur artistique"],
        "Les animaux et la nature": ["Vétérinaire", "Biologiste", "Écologue"],
        "Les jeux de stratégie": ["Entrepreneur(e)", "Consultant(e)", "Manager"],
      };
      const suggested = new Set<string>();
      newAns.forEach((a) => {
        (careerMap[a] || []).forEach((c) => suggested.add(c));
      });
      setResult({
        careers: Array.from(suggested).slice(0, 5),
        advice: "Ces pistes correspondent à tes réponses. Explore-les et n'hésite pas à en discuter avec tes parents ou un conseiller d'orientation !",
      });
    } else {
      setStep((s) => s + 1);
    }
  }

  if (result) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-6xl mb-3">🚀</div>
          <h3 className="text-2xl font-black text-slate-800">Tes pistes métiers !</h3>
        </div>
        <div className="space-y-2">
          {result.careers.map((c) => (
            <div key={c} className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 font-bold text-indigo-700 flex items-center gap-2">
              <span>🎯</span> {c}
            </div>
          ))}
        </div>
        <div className="bg-amber-50 rounded-2xl p-4">
          <p className="text-sm text-slate-700">{result.advice}</p>
        </div>
        <button
          onClick={() => onComplete(90, 60)}
          className="btn-fun w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-4 text-lg"
        >
          Super ! 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm font-bold text-slate-500">
        <span>Question {step + 1}/{questions.length}</span>
      </div>
      <p className="text-xl font-black text-slate-800">{questions[step].q}</p>
      <div className="space-y-3">
        {questions[step].options.map((opt) => (
          <button
            key={opt}
            onClick={() => answer(opt)}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 border-indigo-100 bg-white hover:border-indigo-400 hover:bg-indigo-50 font-semibold text-slate-700 transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
      {child && null}
    </div>
  );
}

// ── WRITING MODULE ────────────────────────────────────────────────────────────
function WritingModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [activity, setActivity] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");

  // ── Dictée ──
  const dictees: Record<string, { sentence: string; blanks: { word: string; hint: string }[] }[]> = {
    maternelle: [
      { sentence: "Le ___ est rouge.", blanks: [{ word: "ballon", hint: "b_ll_n" }] },
      { sentence: "La ___ mange.", blanks: [{ word: "poule", hint: "p_ul_" }] },
      { sentence: "Il fait ___.", blanks: [{ word: "beau", hint: "b__u" }] },
    ],
    primaire: [
      { sentence: "Les enfants ___ dans la cour.", blanks: [{ word: "jouent", hint: "j___nt" }] },
      { sentence: "Elle ___ un livre intéressant.", blanks: [{ word: "lit", hint: "l_t" }] },
      { sentence: "Nous ___ notre travail.", blanks: [{ word: "finissons", hint: "f_n_ss_ns" }] },
    ],
    "college-lycee": [
      { sentence: "Le résultat est ___ à nos attentes.", blanks: [{ word: "conforme", hint: "c_nf_rm_" }] },
      { sentence: "Elle a fait preuve d'une grande ___.", blanks: [{ word: "persévérance", hint: "p_rs_v_r_nc_" }] },
      { sentence: "Ce phénomène est parfaitement ___.", blanks: [{ word: "explicable", hint: "expl_c_bl_" }] },
    ],
  };

  // ── Orthographe ──
  const orthoQuiz: Record<string, { q: string; options: string[]; correct: number }[]> = {
    maternelle: [
      { q: "Comment écrit-on l'animal qui dit 'miaou' ?", options: ["sha", "chat", "cha", "shat"], correct: 1 },
      { q: "Comment écrit-on le chiffre après 2 ?", options: ["troi", "trois", "troa", "troix"], correct: 1 },
      { q: "Comment dit-on quand le ciel est bleu ?", options: ["beau", "bo", "baux", "beaux"], correct: 0 },
    ],
    primaire: [
      { q: "Laquelle est correcte ?", options: ["il manges", "il mange", "il mangent", "il manget"], correct: 1 },
      { q: "Le pluriel de 'cheval' est :", options: ["chevals", "chevaux", "chevales", "cheval"], correct: 1 },
      { q: "Laquelle est correcte ?", options: ["nous avons", "nous avont", "nous avons", "nous ont"], correct: 0 },
    ],
    "college-lycee": [
      { q: "Accord correct ?", options: ["des travaux énormes", "des travails énormes", "des travaux énorme", "des travail énormes"], correct: 0 },
      { q: "Conjugaison correcte au subjonctif ?", options: ["que je sois", "que je soit", "que je suis", "que je soix"], correct: 0 },
      { q: "Laquelle est correcte ?", options: ["quoiqu'il arrive", "quoi qu'il arrive", "quoiqu'il arrivent", "quoi qu'ils arrive"], correct: 1 },
    ],
  };

  // ── Rédaction ──
  const redactions: Record<string, { prompt: string; keyWords: string[]; minWords: number }> = {
    maternelle: { prompt: "Décris ton animal préféré en 2 ou 3 phrases.", keyWords: ["animal", "il", "elle", "aime", "mange", "joue"], minWords: 5 },
    primaire: { prompt: "Raconte ce que tu fais le week-end en 4-5 phrases.", keyWords: ["je", "nous", "famille", "joue", "mange", "aime", "fait"], minWords: 15 },
    "college-lycee": { prompt: "Donne ton opinion sur l'importance du sport dans la vie d'un adolescent (5-6 phrases).", keyWords: ["sport", "santé", "important", "permet", "développe", "car", "parce"], minWords: 30 },
  };

  const ageGroup = child.ageGroup as keyof typeof dictees;

  function ResultCard({ correct, total, xp, color }: { correct: number; total: number; xp: number; color: string }) {
    const score = Math.round((correct / total) * 100);
    return (
      <div className="text-center space-y-5">
        <div className="text-6xl">{score >= 80 ? "🏆" : score >= 50 ? "⭐" : "💪"}</div>
        <h3 className="text-2xl font-black text-slate-800">{correct}/{total} correctes !</h3>
        <div className={`bg-gradient-to-r ${color} rounded-2xl p-4`}>
          <p className="text-2xl font-black text-white">+{xp} XP ✨</p>
        </div>
        <button onClick={() => onComplete(score, xp)} className={`btn-fun w-full bg-gradient-to-r ${color} text-white py-4 text-lg`}>
          Continuer 🚀
        </button>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-center text-white">
          <div className="text-5xl mb-2">✏️</div>
          <h3 className="text-xl font-black">Écriture & Expression</h3>
          <p className="text-white/80 text-sm mt-1">Améliore ton orthographe et ton expression écrite !</p>
        </div>
        <p className="font-bold text-slate-700">Choisis une activité :</p>
        {[
          { id: "dictee", label: "✍️ Mots à compléter", desc: "Trouve le bon mot manquant" },
          { id: "ortho", label: "🔤 Orthographe", desc: "Choisis la bonne orthographe" },
          { id: "redaction", label: "📝 Rédaction libre", desc: "Exprime-toi avec tes mots" },
        ].map((a) => (
          <button key={a.id} onClick={() => { setActivity(a.id); setStep(0); setAnswers([]); }}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 border-purple-100 bg-white hover:border-purple-400 hover:bg-purple-50 transition-all">
            <p className="font-bold text-slate-700">{a.label}</p>
            <p className="text-xs text-slate-500">{a.desc}</p>
          </button>
        ))}
      </div>
    );
  }

  // ── Activité: Mots à compléter ──
  if (activity === "dictee") {
    const items = dictees[ageGroup] || dictees.primaire;
    if (step >= items.length) {
      const correct = answers.filter(Boolean).length;
      return <ResultCard correct={correct} total={items.length} xp={correct === items.length ? 50 : 30} color="from-purple-500 to-violet-600" />;
    }
    const item = items[step];
    function checkDictee(e: React.FormEvent) {
      e.preventDefault();
      const isOk = input.trim().toLowerCase() === item.blanks[0].word.toLowerCase();
      setFeedback(isOk ? "correct" : "wrong");
      setTimeout(() => {
        setAnswers((a) => [...a, isOk]);
        setInput(""); setFeedback("");
        setStep((s) => s + 1);
      }, 900);
    }
    return (
      <div className="space-y-5">
        <div className="flex justify-between text-sm font-bold text-slate-500">
          <span>Mot {step + 1}/{items.length}</span>
          <span className="text-purple-500">Indice : {item.blanks[0].hint}</span>
        </div>
        <div className={`bg-purple-50 rounded-2xl p-6 text-center transition-colors ${feedback === "correct" ? "bg-green-50" : feedback === "wrong" ? "bg-red-50" : ""}`}>
          <p className="text-2xl font-bold text-slate-700">{item.sentence}</p>
          {feedback === "correct" && <p className="text-green-600 font-bold mt-2">✓ Correct : &quot;{item.blanks[0].word}&quot;</p>}
          {feedback === "wrong" && <p className="text-red-600 font-bold mt-2">✗ C&apos;était : &quot;{item.blanks[0].word}&quot;</p>}
        </div>
        <form onSubmit={checkDictee} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Écris le mot manquant…" autoFocus disabled={!!feedback}
            className="flex-1 border-2 border-purple-200 rounded-2xl px-4 py-3 text-slate-800 text-lg font-bold focus:outline-none focus:border-purple-400" />
          <button type="submit" disabled={!input.trim() || !!feedback}
            className="btn-fun bg-gradient-to-r from-purple-500 to-violet-600 text-white px-5 disabled:opacity-50">✓</button>
        </form>
      </div>
    );
  }

  // ── Activité: Orthographe ──
  if (activity === "ortho") {
    const items = orthoQuiz[ageGroup] || orthoQuiz.primaire;
    if (step >= items.length) {
      const correct = answers.filter(Boolean).length;
      return <ResultCard correct={correct} total={items.length} xp={correct === items.length ? 50 : correct >= 2 ? 30 : 15} color="from-purple-500 to-violet-600" />;
    }
    const item = items[step];
    function pickOrtho(idx: number) {
      const isOk = idx === item.correct;
      setFeedback(isOk ? "correct" : "wrong");
      setTimeout(() => { setAnswers((a) => [...a, isOk]); setFeedback(""); setStep((s) => s + 1); }, 700);
    }
    return (
      <div className="space-y-5">
        <div className="flex justify-between text-sm font-bold text-slate-500"><span>Question {step + 1}/{items.length}</span></div>
        <p className="text-xl font-black text-slate-800">{item.q}</p>
        <div className="grid grid-cols-2 gap-3">
          {item.options.map((opt, i) => (
            <button key={i} onClick={() => !feedback && pickOrtho(i)}
              className={`px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                !feedback ? "border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50 text-slate-700"
                  : i === item.correct ? "border-green-400 bg-green-50 text-green-700"
                  : feedback && i !== item.correct ? "border-slate-100 bg-slate-50 text-slate-400" : ""
              }`}>{opt}</button>
          ))}
        </div>
      </div>
    );
  }

  // ── Activité: Rédaction ──
  const redac = redactions[ageGroup] || redactions.primaire;
  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
  const hasEnough = wordCount >= redac.minWords;
  function submitRedac() {
    const keyFound = redac.keyWords.filter((w) => input.toLowerCase().includes(w)).length;
    const score = Math.min(100, Math.round((wordCount / redac.minWords) * 70 + (keyFound / redac.keyWords.length) * 30));
    onComplete(score, score >= 70 ? 55 : 35);
  }
  return (
    <div className="space-y-5">
      <div className="bg-purple-50 rounded-2xl p-4">
        <p className="text-xs font-bold text-purple-600 mb-1">✍️ Sujet</p>
        <p className="font-semibold text-slate-700">{redac.prompt}</p>
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={7}
        placeholder="Commence à écrire ici…"
        className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-slate-700 resize-none focus:outline-none focus:border-purple-400" />
      <div className="flex items-center justify-between">
        <span className={`text-sm font-bold ${hasEnough ? "text-green-600" : "text-slate-400"}`}>
          {wordCount} mot{wordCount > 1 ? "s" : ""} {hasEnough ? "✓" : `(min. ${redac.minWords})`}
        </span>
        <button onClick={submitRedac} disabled={!hasEnough}
          className="btn-fun bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 disabled:opacity-50">
          Valider ✓
        </button>
      </div>
    </div>
  );
}

// ── SOCIAL MODULE ─────────────────────────────────────────────────────────────
function SocialModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [activity, setActivity] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  const rolePlay: { situation: string; emoji: string; options: string[]; best: number; feedback: string }[] = [
    { situation: "Ton camarade te demande de l'aide pour un exercice que tu n'as pas fini.", emoji: "📚",
      options: ["Je refuse, j'ai pas le temps", "Je lui explique ce que je comprends, on cherche ensemble", "Je lui donne mes réponses directement", "J'ignore sa demande"],
      best: 1, feedback: "Travailler ensemble permet d'apprendre mieux et renforce l'amitié !" },
    { situation: "Un élève plus jeune est seul dans la cour, il a l'air triste.", emoji: "😢",
      options: ["Je fais semblant de ne pas le voir", "Je vais lui parler et lui propose de jouer", "Je lui crie dessus pour qu'il arrête", "Je raconte à tout le monde qu'il pleure"],
      best: 1, feedback: "Un simple 'ça va ?' peut changer toute la journée de quelqu'un !" },
    { situation: "Deux amis se disputent et te demandent de prendre parti.", emoji: "⚖️",
      options: ["Je prends le parti de mon meilleur ami sans réfléchir", "Je dis que les deux ont tort", "J'écoute les deux côtés avant de répondre calmement", "Je me sauve en courant"],
      best: 2, feedback: "Écouter les deux parties avant de juger est le signe d'une grande maturité !" },
    { situation: "Tu as dit quelque chose de blessant à un ami par accident.", emoji: "💬",
      options: ["Je fais comme si de rien n'était", "Je m'excuse sincèrement et j'explique que ce n'était pas intentionnel", "Je lui dis que c'est sa faute s'il est blessé", "Je l'évite pendant une semaine"],
      best: 1, feedback: "Les excuses sincères réparent les relations. Ça demande du courage !" },
  ];

  const conflictQuiz: { q: string; options: string[]; correct: number; explanation: string }[] = [
    { q: "Le meilleur moyen de résoudre un conflit est :", options: ["Crier plus fort que l'autre", "Partir sans parler", "Écouter et expliquer ses sentiments calmement", "Demander à quelqu'un d'autre de décider"],
      correct: 2, explanation: "La communication calme résout 90% des conflits !" },
    { q: "Quand quelqu'un me parle, la meilleure attitude est :", options: ["Regarder mon téléphone", "Le regarder dans les yeux et hocher la tête", "Penser à ce que je vais dire ensuite", "L'interrompre dès que j'ai une idée"],
      correct: 1, explanation: "L'écoute active montre du respect et aide à vraiment comprendre." },
    { q: "Si un ami me fait quelque chose qui me dérange, je dois :", options: ["Lui en parler directement avec calme", "Me venger discrètement", "Tout raconter à d'autres amis d'abord", "Garder ça pour moi indéfiniment"],
      correct: 0, explanation: "Parler directement évite les malentendus et préserve l'amitié." },
    { q: "Qu'est-ce que l'empathie ?", options: ["Se mettre en colère pour quelqu'un", "Comprendre et ressentir ce que l'autre ressent", "Être d'accord avec tout le monde", "Ignorer les émotions des autres"],
      correct: 1, explanation: "L'empathie est la clé de toutes les bonnes relations !" },
  ];

  const ecoute: { q: string; options: string[]; correct: number; tip: string }[] = [
    { q: "Tu parles avec un ami. Il s'arrête au milieu d'une phrase. Tu :", options: ["Finis sa phrase à sa place", "Attends patiemment qu'il continue", "Changes de sujet", "Regardes ailleurs"],
      correct: 1, tip: "Respecter les silences montre que tu écoutes vraiment." },
    { q: "Ton ami raconte un problème. La meilleure réponse est :", options: ["'Moi j'ai eu pire !'", "'T'inquiète, ça va aller'", "'Je comprends que tu te sentes comme ça'", "'Arrête de te plaindre'"],
      correct: 2, tip: "Valider les émotions de l'autre est plus important que donner des solutions." },
    { q: "Pour montrer que tu écoutes, tu peux :", options: ["Faire autre chose en même temps", "Hocher la tête et reformuler ce qu'il a dit", "Vérifier ton téléphone entre les phrases", "Penser à ton repas de ce soir"],
      correct: 1, tip: "Reformuler prouve que tu as bien compris et valorise la personne." },
  ];

  if (!activity) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-6 text-center text-white">
          <div className="text-5xl mb-2">🤝</div>
          <h3 className="text-xl font-black">Relations & Amitié</h3>
          <p className="text-white/80 text-sm mt-1">Apprends à mieux communiquer et t&apos;entraider !</p>
        </div>
        {[
          { id: "roleplay", label: "🎭 Jeux de rôle", desc: "Que ferais-tu dans ces situations ?" },
          { id: "conflict", label: "⚖️ Gestion des conflits", desc: "Apprends à résoudre les désaccords" },
          { id: "ecoute", label: "👂 L'art de l'écoute", desc: "Deviens un super ami attentionné" },
        ].map((a) => (
          <button key={a.id} onClick={() => { setActivity(a.id); setStep(0); setScores([]); setShowFeedback(false); setChosen(null); }}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 border-orange-100 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all">
            <p className="font-bold text-slate-700">{a.label}</p>
            <p className="text-xs text-slate-500">{a.desc}</p>
          </button>
        ))}
        {child && null}
      </div>
    );
  }

  const data = activity === "roleplay" ? rolePlay : activity === "conflict" ? conflictQuiz : ecoute;

  function pickAnswer(idx: number) {
    if (showFeedback) return;
    setChosen(idx);
    setShowFeedback(true);
  }

  function nextStep() {
    const item = data[step] as { best?: number; correct?: number };
    const correctIdx = item.best ?? item.correct ?? 0;
    setScores((s) => [...s, chosen === correctIdx]);
    setChosen(null); setShowFeedback(false);
    if (step >= data.length - 1) {
      const ok = scores.filter(Boolean).length + (chosen === correctIdx ? 1 : 0);
      const score = Math.round((ok / data.length) * 100);
      onComplete(score, score >= 80 ? 50 : 35);
    } else {
      setStep((s) => s + 1);
    }
  }

  const item = data[step] as { situation?: string; q?: string; emoji?: string; options: string[]; best?: number; correct?: number; feedback?: string; explanation?: string; tip?: string };
  const correctIdx = item.best ?? item.correct ?? 0;
  const advice = item.feedback || item.explanation || item.tip || "";

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm font-bold text-slate-500">
        <span>Situation {step + 1}/{data.length}</span>
        <span>{Math.round((step / data.length) * 100)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full">
        <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${(step / data.length) * 100}%` }} />
      </div>
      <div className="bg-orange-50 rounded-2xl p-5">
        {item.emoji && <div className="text-4xl text-center mb-2">{item.emoji}</div>}
        <p className="font-semibold text-slate-700 text-center">{item.situation || item.q}</p>
      </div>
      <div className="space-y-2">
        {item.options.map((opt, i) => (
          <button key={i} onClick={() => pickAnswer(i)}
            className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${
              !showFeedback ? "border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50 text-slate-700"
                : i === correctIdx ? "border-green-400 bg-green-50 text-green-700"
                : i === chosen ? "border-red-300 bg-red-50 text-red-600"
                : "border-slate-100 bg-slate-50 text-slate-400"
            }`}>{opt}</button>
        ))}
      </div>
      {showFeedback && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-600 mb-1">💡 À retenir</p>
            <p className="text-sm text-slate-700">{advice}</p>
          </div>
          <button onClick={nextStep} className="btn-fun w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white py-4">
            {step >= data.length - 1 ? "Voir mon résultat 🎯" : "Continuer →"}
          </button>
        </>
      )}
    </div>
  );
}

// ── PHYSICAL MODULE ───────────────────────────────────────────────────────────
function PhysicalModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [activity, setActivity] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showTip, setShowTip] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const sommeilQuiz: { q: string; options: string[]; correct: number; tip: string }[] = [
    { q: "Combien d'heures de sommeil un enfant de 10 ans devrait-il dormir ?", options: ["5-6h", "7-8h", "9-11h", "12-14h"], correct: 2, tip: "Les enfants ont besoin de plus de sommeil que les adultes pour grandir et apprendre !" },
    { q: "Quelle habitude aide à mieux dormir ?", options: ["Regarder un écran jusqu'à s'endormir", "Faire du sport juste avant de dormir", "Avoir une heure de coucher régulière", "Boire du café le soir"], correct: 2, tip: "Un rythme régulier programme ton cerveau à s'endormir plus facilement." },
    { q: "Que se passe-t-il pendant le sommeil ?", options: ["Rien, le cerveau s'arrête", "Le cerveau mémorise ce qu'on a appris", "On grossit automatiquement", "Le corps ne récupère pas"], correct: 1, tip: "Le sommeil est essentiel pour mémoriser les leçons apprises dans la journée !" },
    { q: "Quelle lumière perturbe le sommeil ?", options: ["La lumière de la lune", "La lumière bleue des écrans", "La lumière d'une veilleuse rouge", "L'obscurité complète"], correct: 1, tip: "Les écrans émettent une lumière bleue qui trompe ton cerveau et retarde l'endormissement." },
  ];

  const nutritionQuiz: { q: string; options: string[]; correct: number; tip: string }[] = [
    { q: "Combien de fruits et légumes devrait-on manger par jour ?", options: ["1 portion", "2-3 portions", "5 portions ou plus", "Aucun si on n'aime pas"], correct: 2, tip: "5 fruits et légumes par jour apportent toutes les vitamines dont ton corps a besoin !" },
    { q: "Quelle est la boisson la plus importante pour le corps ?", options: ["Les jus de fruits", "Les sodas", "L'eau", "Le lait"], correct: 2, tip: "Boire 1,5L d'eau par jour aide à te concentrer et à rester en forme !" },
    { q: "Quel repas est considéré le plus important ?", options: ["Le dîner", "Le déjeuner", "Le petit-déjeuner", "Le goûter"], correct: 2, tip: "Le petit-déjeuner donne l'énergie pour bien démarrer et se concentrer en classe !" },
    { q: "Pour avoir de l'énergie durable, il vaut mieux manger :", options: ["Des bonbons et sucreries", "Des céréales complètes et des protéines", "Rien du tout avant le sport", "Beaucoup de sel"], correct: 1, tip: "Les protéines et céréales complètes libèrent l'énergie lentement, sans pic ni chute !" },
  ];

  const exercises: { name: string; emoji: string; description: string; duration: number; benefit: string }[] = [
    { name: "Respiration profonde", emoji: "🌬️", description: "Inspire lentement par le nez (4 secondes), retiens (4 secondes), expire par la bouche (4 secondes). Répète 5 fois.", duration: 40, benefit: "Réduit le stress et améliore la concentration !" },
    { name: "Jumping jacks", emoji: "⭐", description: "Écarte les bras et les jambes en sautant, puis reviens en position initiale. 20 répétitions !", duration: 30, benefit: "Active la circulation et booste l'énergie !" },
    { name: "Étirements du cou", emoji: "🦒", description: "Incline doucement la tête à droite, maintiens 10 secondes. Puis à gauche. Puis en avant. Puis en arrière.", duration: 40, benefit: "Libère les tensions après une longue journée assis !" },
    { name: "Gainage", emoji: "🏋️", description: "Allonge-toi face au sol, appuie-toi sur les coudes et les orteils. Tiens le dos bien droit pendant 20 secondes !", duration: 25, benefit: "Renforce les muscles du dos et améliore la posture !" },
  ];

  const todayExercise = exercises[new Date().getDay() % exercises.length];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerCount < todayExercise.duration) {
      interval = setInterval(() => setTimerCount((c) => c + 1), 1000);
    } else if (timerCount >= todayExercise.duration) {
      setTimerActive(false);
      setExerciseDone(true);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerCount, todayExercise.duration]);

  if (!activity) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl p-6 text-center text-white">
          <div className="text-5xl mb-2">💪</div>
          <h3 className="text-xl font-black">Bien-être & Corps</h3>
          <p className="text-white/80 text-sm mt-1">Prends soin de ton corps pour apprendre mieux !</p>
        </div>
        {[
          { id: "sommeil", label: "😴 Hygiène du sommeil", desc: "Teste tes connaissances sur le sommeil" },
          { id: "nutrition", label: "🥗 Nutrition santé", desc: "Apprends à bien manger pour bien vivre" },
          { id: "exercice", label: "🏃 Exercice du jour", desc: "Un mini-entraînement guidé" },
        ].map((a) => (
          <button key={a.id} onClick={() => { setActivity(a.id); setStep(0); setAnswers([]); setShowTip(false); setChosen(null); }}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 border-teal-100 bg-white hover:border-teal-400 hover:bg-teal-50 transition-all">
            <p className="font-bold text-slate-700">{a.label}</p>
            <p className="text-xs text-slate-500">{a.desc}</p>
          </button>
        ))}
        {child && null}
      </div>
    );
  }

  // ── Exercice du jour ──
  if (activity === "exercice") {
    if (exerciseDone) {
      return (
        <div className="text-center space-y-5">
          <div className="text-7xl">💪</div>
          <h3 className="text-2xl font-black text-slate-800">Exercice terminé !</h3>
          <div className="bg-teal-50 rounded-2xl p-4">
            <p className="font-semibold text-teal-700">✨ {todayExercise.benefit}</p>
          </div>
          <button onClick={() => onComplete(100, 45)} className="btn-fun w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-4 text-lg">
            Super ! +45 XP 🚀
          </button>
        </div>
      );
    }
    const pct = Math.round((timerCount / todayExercise.duration) * 100);
    return (
      <div className="space-y-6">
        <div className="bg-teal-50 rounded-2xl p-6 text-center">
          <div className="text-6xl mb-3">{todayExercise.emoji}</div>
          <h3 className="text-xl font-black text-slate-800">{todayExercise.name}</h3>
          <p className="text-slate-600 mt-2 leading-relaxed">{todayExercise.description}</p>
        </div>
        <div>
          <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
            <span>Progression</span>
            <span>{timerCount}s / {todayExercise.duration}s</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-400 to-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button onClick={() => setTimerActive((v) => !v)}
          className={`btn-fun w-full py-4 text-lg text-white ${timerActive ? "bg-red-400" : "bg-gradient-to-r from-teal-500 to-green-500"}`}>
          {timerActive ? "⏸ Pause" : timerCount === 0 ? "▶ Démarrer l'exercice" : "▶ Reprendre"}
        </button>
      </div>
    );
  }

  // ── Quiz sommeil / nutrition ──
  const quizData = activity === "sommeil" ? sommeilQuiz : nutritionQuiz;
  if (step >= quizData.length) {
    const correct = answers.filter(Boolean).length;
    const score = Math.round((correct / quizData.length) * 100);
    return (
      <div className="text-center space-y-5">
        <div className="text-6xl">{score >= 80 ? "🌟" : score >= 50 ? "⭐" : "💪"}</div>
        <h3 className="text-2xl font-black text-slate-800">{correct}/{quizData.length} bonnes réponses !</h3>
        <div className="bg-teal-50 rounded-2xl p-4">
          <p className="text-2xl font-black text-teal-600">+{score >= 80 ? 50 : 30} XP ✨</p>
        </div>
        <button onClick={() => onComplete(score, score >= 80 ? 50 : 30)}
          className="btn-fun w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-4 text-lg">
          Continuer 🚀
        </button>
      </div>
    );
  }

  const qItem = quizData[step];
  function pickPhysical(idx: number) {
    if (showTip) return;
    setChosen(idx); setShowTip(true);
    setAnswers((a) => [...a, idx === qItem.correct]);
  }
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm font-bold text-slate-500">
        <span>Question {step + 1}/{quizData.length}</span>
      </div>
      <p className="text-xl font-black text-slate-800">{qItem.q}</p>
      <div className="space-y-2">
        {qItem.options.map((opt, i) => (
          <button key={i} onClick={() => pickPhysical(i)}
            className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${
              !showTip ? "border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 text-slate-700"
                : i === qItem.correct ? "border-green-400 bg-green-50 text-green-700"
                : i === chosen ? "border-red-300 bg-red-50 text-red-600"
                : "border-slate-100 bg-slate-50 text-slate-400"
            }`}>{opt}</button>
        ))}
      </div>
      {showTip && (
        <>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-teal-600 mb-1">💡 Le saviez-vous ?</p>
            <p className="text-sm text-slate-700">{qItem.tip}</p>
          </div>
          <button onClick={() => { setShowTip(false); setChosen(null); setStep((s) => s + 1); }}
            className="btn-fun w-full bg-gradient-to-r from-teal-500 to-green-500 text-white py-3">
            {step >= quizData.length - 1 ? "Voir mon résultat 🎯" : "Question suivante →"}
          </button>
        </>
      )}
    </div>
  );
}

// ── CREATIVITY MODULE ─────────────────────────────────────────────────────────
function CreativityModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [activity, setActivity] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [input, setInput] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  const defisCreatifs: Record<string, { prompt: string; emoji: string; ideas: string[] }[]> = {
    maternelle: [
      { prompt: "Invente un animal imaginaire. Décris à quoi il ressemble.", emoji: "🦄", ideas: ["Il a des ailes et des rayures colorées", "Il vit sous l'eau mais peut voler", "Il brille la nuit"] },
      { prompt: "Si tu pouvais avoir un super-pouvoir, lequel serait-ce et pourquoi ?", emoji: "⚡", ideas: ["Voler pour voir toute la ville", "Parler aux animaux", "Devenir invisible"] },
    ],
    primaire: [
      { prompt: "Invente une solution pour qu'on pollue moins dans ta ville.", emoji: "🌍", ideas: ["Des bus qui roulent à l'eau", "Des jardins sur les toits", "Des robots qui nettoient la rivière"] },
      { prompt: "Imagine un métier qui n'existe pas encore et décris ce qu'il fait.", emoji: "🚀", ideas: ["Architecte de planètes", "Professeur de langues d'animaux", "Designer de rêves"] },
    ],
    "college-lycee": [
      { prompt: "Propose une invention technologique qui résoudrait un problème réel.", emoji: "💡", ideas: ["Une app qui traduit les émotions", "Des lunettes qui détectent le mensonge", "Un bracelet qui prédit les maladies"] },
      { prompt: "Écris le début d'une histoire courte (5-6 lignes) qui commence par : 'Il était une fois un robot qui voulait apprendre à rêver…'", emoji: "🤖", ideas: ["Développe les émotions du robot", "Ajoute un obstacle surprenant", "Crée un personnage inattendu"] },
    ],
  };

  const cultureQuiz: { q: string; options: string[]; correct: number; fun: string }[] = [
    { q: "Quel est l'animal le plus rapide du monde ?", options: ["Le lion", "Le guépard", "Le faucon pèlerin", "Le dauphin"], correct: 2, fun: "Le faucon pèlerin peut atteindre 390 km/h en piqué ! 🦅" },
    { q: "Combien y a-t-il d'étoiles dans la Voie Lactée ?", options: ["1 million", "100 millions", "200 à 400 milliards", "1 trillion"], correct: 2, fun: "Notre galaxie contient entre 200 et 400 milliards d'étoiles ! 🌌" },
    { q: "Quelle est la plus grande forêt du monde ?", options: ["La forêt Amazonienne", "La forêt de Sibérie (Taïga)", "La forêt du Congo", "La forêt de Scandinavie"], correct: 1, fun: "La Taïga sibérienne couvre 13 millions de km² — plus grand que l'Australie ! 🌲" },
    { q: "Qui a peint la Joconde ?", options: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli"], correct: 2, fun: "Léonard de Vinci était aussi ingénieur, musicien et scientifique — un vrai génie !" },
    { q: "En quelle année a eu lieu la Révolution Française ?", options: ["1689", "1789", "1889", "1689"], correct: 1, fun: "1789 : la prise de la Bastille le 14 juillet, devenu notre fête nationale !" },
  ];

  const inventions: { enigme: string; emoji: string; indices: string[]; reponse: string; explication: string }[] = [
    { enigme: "Je suis inventé en 1876. Je permets à deux personnes de se parler à distance. Sans moi, les smartphones n'existeraient pas. Qu'est-ce que je suis ?", emoji: "📞", indices: ["J'utilise les ondes sonores", "Alexander Graham Bell m'a inventé", "Je servais à appeler ses amis"], reponse: "Le téléphone", explication: "Le téléphone d'Alexander Graham Bell est l'ancêtre de tous nos smartphones !" },
    { enigme: "Je suis une machine qui peut tout calculer, mais je n'ai pas de cerveau. Je suis partout : dans ta poche, sur ton bureau, dans les voitures. Qu'est-ce que je suis ?", emoji: "💻", indices: ["Je stocke des données", "J'utilise de l'électricité", "Tu utilises peut-être un de mes cousins pour lire ceci"], reponse: "L'ordinateur", explication: "Le premier ordinateur pesait 30 tonnes ! Les puces d'aujourd'hui sont des millions de fois plus puissantes !" },
    { enigme: "En 1928, un médecin oublie une boîte de bactéries avant ses vacances. À son retour, il découvre que des moisissures ont tué toutes les bactéries. Cette erreur a sauvé des millions de vies. De quoi s'agit-il ?", emoji: "💊", indices: ["C'est un médicament", "Ça combat les infections", "Alexander Fleming l'a découvert par accident"], reponse: "La pénicilline", explication: "La pénicilline, premier antibiotique, a été découverte par accident par Alexander Fleming en 1928 !" },
  ];

  const [showAnswer, setShowAnswer] = useState(false);

  const ageGroup = child.ageGroup as keyof typeof defisCreatifs;

  if (!activity) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-6 text-center text-white">
          <div className="text-5xl mb-2">🎨</div>
          <h3 className="text-xl font-black">Créativité & Culture</h3>
          <p className="text-white/80 text-sm mt-1">Explore, invente et découvre le monde !</p>
        </div>
        {[
          { id: "defi", label: "💡 Défi créatif", desc: "Laisse ton imagination s'exprimer !" },
          { id: "culture", label: "🌍 Culture générale", desc: "Teste tes connaissances sur le monde" },
          { id: "invention", label: "🔬 Mystère & Inventions", desc: "Découvre des histoires fascinantes" },
        ].map((a) => (
          <button key={a.id} onClick={() => { setActivity(a.id); setStep(0); setAnswers([]); setInput(""); setShowTip(false); setChosen(null); }}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 border-yellow-100 bg-white hover:border-yellow-400 hover:bg-yellow-50 transition-all">
            <p className="font-bold text-slate-700">{a.label}</p>
            <p className="text-xs text-slate-500">{a.desc}</p>
          </button>
        ))}
        {child && null}
      </div>
    );
  }

  // ── Défi créatif ──
  if (activity === "defi") {
    const defis = defisCreatifs[ageGroup] || defisCreatifs.primaire;
    const defi = defis[step % defis.length];
    const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 10 || (step > 0 && input)) {
      return (
        <div className="text-center space-y-5">
          <div className="text-6xl">🎨</div>
          <h3 className="text-2xl font-black text-slate-800">Bravo pour ta créativité !</h3>
          <div className="bg-yellow-50 rounded-2xl p-4 text-left">
            <p className="text-xs font-bold text-yellow-600 mb-1">Tu as écrit :</p>
            <p className="text-slate-700 italic text-sm">{input}</p>
          </div>
          <button onClick={() => onComplete(90, 55)} className="btn-fun w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-4 text-lg">
            Super ! +55 XP 🚀
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <div className="bg-yellow-50 rounded-2xl p-5 text-center">
          <div className="text-5xl mb-2">{defi.emoji}</div>
          <p className="font-bold text-slate-700">{defi.prompt}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs font-bold text-slate-400 mb-1">💡 Idées pour t&apos;inspirer</p>
          {defi.ideas.map((idea) => (
            <p key={idea} className="text-xs text-slate-500">• {idea}</p>
          ))}
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5}
          placeholder="Écris ta réponse créative ici…"
          className="w-full border-2 border-yellow-200 rounded-2xl px-4 py-3 text-slate-700 resize-none focus:outline-none focus:border-yellow-400" />
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold ${wordCount >= 10 ? "text-green-600" : "text-slate-400"}`}>
            {wordCount} mot{wordCount > 1 ? "s" : ""} {wordCount >= 10 ? "✓" : "(min. 10)"}
          </span>
          <button onClick={() => onComplete(90, 55)} disabled={wordCount < 5}
            className="btn-fun bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 disabled:opacity-50">
            Valider ✓
          </button>
        </div>
      </div>
    );
  }

  // ── Culture générale ──
  if (activity === "culture") {
    if (step >= cultureQuiz.length) {
      const correct = answers.filter(Boolean).length;
      const score = Math.round((correct / cultureQuiz.length) * 100);
      return (
        <div className="text-center space-y-5">
          <div className="text-6xl">{score >= 80 ? "🏆" : "⭐"}</div>
          <h3 className="text-2xl font-black text-slate-800">{correct}/{cultureQuiz.length} correctes !</h3>
          <div className="bg-yellow-50 rounded-2xl p-4">
            <p className="text-2xl font-black text-yellow-600">+{score >= 80 ? 55 : 35} XP ✨</p>
          </div>
          <button onClick={() => onComplete(score, score >= 80 ? 55 : 35)}
            className="btn-fun w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-4 text-lg">Continuer 🚀</button>
        </div>
      );
    }
    const q = cultureQuiz[step];
    function pickCulture(idx: number) {
      if (showTip) return;
      setChosen(idx); setShowTip(true);
      setAnswers((a) => [...a, idx === q.correct]);
    }
    return (
      <div className="space-y-5">
        <div className="flex justify-between text-sm font-bold text-slate-500"><span>Question {step + 1}/{cultureQuiz.length}</span></div>
        <p className="text-xl font-black text-slate-800">{q.q}</p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => pickCulture(i)}
              className={`px-3 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
                !showTip ? "border-slate-200 bg-white hover:border-yellow-400 hover:bg-yellow-50 text-slate-700"
                  : i === q.correct ? "border-green-400 bg-green-50 text-green-700"
                  : i === chosen ? "border-red-300 bg-red-50 text-red-600"
                  : "border-slate-100 bg-slate-50 text-slate-400"
              }`}>{opt}</button>
          ))}
        </div>
        {showTip && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-yellow-600 mb-1">🤩 Le saviez-vous ?</p>
              <p className="text-sm text-slate-700">{q.fun}</p>
            </div>
            <button onClick={() => { setShowTip(false); setChosen(null); setStep((s) => s + 1); }}
              className="btn-fun w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3">
              {step >= cultureQuiz.length - 1 ? "Voir mon résultat 🎯" : "Question suivante →"}
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Mystère & Inventions ──
  const inv = inventions[step % inventions.length];
  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-3">{inv.emoji}</div>
        <p className="text-white font-semibold leading-relaxed">{inv.enigme}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400">🔍 Indices :</p>
        {inv.indices.map((ind) => <p key={ind} className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2">• {ind}</p>)}
      </div>
      {!showAnswer ? (
        <button onClick={() => setShowAnswer(true)}
          className="btn-fun w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-4 text-lg">
          Révéler la réponse ! 🔓
        </button>
      ) : (
        <>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-2xl font-black text-green-700 mb-2">✓ {inv.reponse}</p>
            <p className="text-sm text-slate-700">{inv.explication}</p>
          </div>
          <button onClick={() => onComplete(100, 50)}
            className="btn-fun w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-4 text-lg">
            Fascinant ! +50 XP 🚀
          </button>
        </>
      )}
    </div>
  );
}

// ── MODULE META ────────────────────────────────────────────────────────────────
const moduleMeta: Record<string, { name: string; emoji: string; color: string; bg: string }> = {
  assessment: { name: "Mon évaluation", emoji: "🔍", color: "from-violet-500 to-purple-600", bg: "bg-violet-50" },
  reading: { name: "Lecture & Langage", emoji: "📖", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
  math: { name: "Maths & Logique", emoji: "🔢", color: "from-green-500 to-emerald-500", bg: "bg-green-50" },
  memory: { name: "Mémoire & Attention", emoji: "🧠", color: "from-pink-500 to-rose-500", bg: "bg-pink-50" },
  emotional: { name: "Mes émotions", emoji: "❤️", color: "from-red-400 to-pink-500", bg: "bg-red-50" },
  social: { name: "Relations & Amitié", emoji: "🤝", color: "from-orange-400 to-amber-500", bg: "bg-orange-50" },
  physical: { name: "Bien-être & Corps", emoji: "💪", color: "from-teal-500 to-green-500", bg: "bg-teal-50" },
  creativity: { name: "Créativité & Culture", emoji: "🎨", color: "from-yellow-400 to-orange-400", bg: "bg-yellow-50" },
  orientation: { name: "Mon avenir", emoji: "🚀", color: "from-indigo-500 to-blue-600", bg: "bg-indigo-50" },
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ModulePage({ params }: { params: { id: string; module: string } }) {
  const { id, module: moduleId } = params;
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalXp, setFinalXp] = useState(0);

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => { if (!r.ok) { router.push("/parent"); return null; } return r.json(); })
      .then((data) => { if (data) setChild(data); });
  }, [id, router]);

  async function handleComplete(score: number, xp: number) {
    setFinalScore(score);
    setFinalXp(xp);
    setCompleted(true);
    // Save session
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: id,
        module: moduleId,
        activity: moduleMeta[moduleId]?.name || moduleId,
        score,
        duration: 10,
        xpEarned: xp,
      }),
    });
  }

  const meta = moduleMeta[moduleId] || { name: "Module", emoji: "📚", color: "from-violet-500 to-purple-600", bg: "bg-violet-50" };

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="text-5xl animate-bounce">⏳</div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center p-6">
        <div className="card-bubble bg-white max-w-md w-full p-10 text-center">
          <div className="text-7xl mb-4 star-pop">🏆</div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Bravo {child.name} !</h2>
          <p className="text-slate-500 mb-6">Tu as terminé &quot;{meta.name}&quot;</p>
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 mb-6">
            <p className="text-4xl font-black text-white">+{finalXp} XP</p>
            <p className="text-white/80 text-sm mt-1">Score : {finalScore}%</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setCompleted(false); }}
              className="btn-fun flex-1 bg-slate-100 text-slate-700 py-3"
            >
              🔄 Rejouer
            </button>
            <Link
              href={`/child/${id}`}
              className="btn-fun flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 text-center"
            >
              🏠 Accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-700">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3">
        <Link href={`/child/${id}`} className="text-white/80 hover:text-white p-2">←</Link>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl shadow-lg`}>
          {meta.emoji}
        </div>
        <div>
          <h1 className="font-black text-white">{meta.name}</h1>
          <p className="text-white/70 text-xs">{child.name} · Niveau {child.level}</p>
        </div>
      </header>

      {/* Content */}
      <main className="bg-slate-50 rounded-t-[2rem] min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {moduleId === "reading" && <ReadingModule child={child} onComplete={handleComplete} />}
          {moduleId === "math" && <MathModule child={child} onComplete={handleComplete} />}
          {moduleId === "memory" && <MemoryModule onComplete={handleComplete} />}
          {moduleId === "emotional" && <EmotionalModule child={child} onComplete={handleComplete} />}
          {moduleId === "assessment" && <AssessmentModule child={child} onComplete={handleComplete} />}
          {moduleId === "orientation" && <OrientationModule child={child} onComplete={handleComplete} />}
          {moduleId === "writing" && <WritingModule child={child} onComplete={handleComplete} />}
          {moduleId === "social" && <SocialModule child={child} onComplete={handleComplete} />}
          {moduleId === "physical" && <PhysicalModule child={child} onComplete={handleComplete} />}
          {moduleId === "creativity" && <CreativityModule child={child} onComplete={handleComplete} />}
        </div>
      </main>
    </div>
  );
}
