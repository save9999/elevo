"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Child {
  id: string; name: string; avatar: string; ageGroup: string; level: number; xp: number;
}

// ── READING MODULE ─────────────────────────────────────────────────────────────
function ReadingModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const stories: Record<string, { text: string; questions: { q: string; options: string[]; correct: number }[] }[]> = {
    maternelle: [
      {
        text: "🐱 Le chat s'appelle Mimi. Mimi aime jouer avec une pelote de laine rouge. Aujourd'hui, il fait beau et Mimi joue dans le jardin.",
        questions: [
          { q: "Comment s'appelle le chat ?", options: ["Tom", "Mimi", "Felix", "Luna"], correct: 1 },
          { q: "Avec quoi Mimi aime-t-il jouer ?", options: ["Une balle", "Une pelote de laine", "Un os", "Un poisson"], correct: 1 },
          { q: "Où Mimi joue-t-il aujourd'hui ?", options: ["Dans la maison", "À l'école", "Dans le jardin", "Dans la rue"], correct: 2 },
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
    ],
  };

  const story = stories[child.ageGroup]?.[0] || stories.primaire[0];
  const [step, setStep] = useState<"read" | "quiz" | "done">("read");
  const [answers, setAnswers] = useState<(number | null)[]>(story.questions.map(() => null));
  const [current, setCurrent] = useState(0);

  function answer(idx: number) {
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    if (current < story.questions.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 500);
    } else {
      setTimeout(() => setStep("done"), 500);
    }
  }

  if (step === "read") {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-2xl p-6 text-slate-700 text-lg leading-relaxed font-medium">
          {story.text}
        </div>
        <button
          onClick={() => setStep("quiz")}
          className="btn-fun w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 text-lg"
        >
          J&apos;ai lu ! Passer au quiz 🧠
        </button>
      </div>
    );
  }

  if (step === "quiz") {
    const q = story.questions[current];
    return (
      <div className="space-y-5">
        <div className="flex justify-between text-sm text-slate-500 font-bold">
          <span>Question {current + 1}/{story.questions.length}</span>
          <span>{Math.round(((current) / story.questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full">
          <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${(current / story.questions.length) * 100}%` }} />
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
function MathModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
  const [done, setDone] = useState(false);

  const problems = (() => {
    if (child.ageGroup === "maternelle") {
      return [
        { q: "🍎🍎🍎 + 🍎🍎 = ?", answer: "5" },
        { q: "🐣🐣🐣🐣 - 🐣🐣 = ?", answer: "2" },
        { q: "3 + 4 = ?", answer: "7" },
        { q: "6 - 2 = ?", answer: "4" },
      ];
    }
    if (child.ageGroup === "primaire") {
      return [
        { q: "24 × 3 = ?", answer: "72" },
        { q: "144 ÷ 12 = ?", answer: "12" },
        { q: "15% de 200 = ?", answer: "30" },
        { q: "√49 = ?", answer: "7" },
      ];
    }
    return [
      { q: "Résoudre : 2x + 5 = 13, x = ?", answer: "4" },
      { q: "sin(90°) = ?", answer: "1" },
      { q: "log₁₀(1000) = ?", answer: "3" },
      { q: "Dériver f(x) = x² : f'(x) = ?", answer: "2x" },
    ];
  })();

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
    const res = await fetch("/api/ai/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: child.id, answers: finalAnswers, assessmentType: "Bilan général" }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
    setLoading(false);
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

// ── GENERIC MODULE WRAPPER ────────────────────────────────────────────────────
function GenericModule({ moduleId, child, onComplete }: { moduleId: string; child: Child; onComplete: (score: number, xp: number) => void }) {
  const content: Record<string, { title: string; emoji: string; color: string; desc: string; activities: string[] }> = {
    writing: { title: "Écriture & Expression", emoji: "✏️", color: "from-purple-500 to-violet-600", desc: "Améliore ton écriture et ton expression !", activities: ["Dictée adaptée", "Rédaction guidée", "Exercice d'orthographe"] },
    social: { title: "Relations & Amitié", emoji: "🤝", color: "from-orange-400 to-amber-500", desc: "Apprends à mieux communiquer !", activities: ["Jeu de rôle", "Gestion des conflits", "L'art de l'écoute"] },
    physical: { title: "Bien-être & Corps", emoji: "💪", color: "from-teal-500 to-green-500", desc: "Prends soin de ton corps et de ta santé !", activities: ["Routine sommeil", "Nutrition santé", "Exercice du jour"] },
    creativity: { title: "Créativité & Culture", emoji: "🎨", color: "from-yellow-400 to-orange-400", desc: "Exprime ta créativité sans limites !", activities: ["Défi créatif", "Culture générale", "Invention du jour"] },
  };

  const info = content[moduleId] || { title: "Module", emoji: "📚", color: "from-slate-500 to-slate-600", desc: "Apprends et progresse !", activities: ["Exercice 1", "Exercice 2"] };

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="text-center space-y-6">
        <div className="text-7xl">🎉</div>
        <h3 className="text-2xl font-black text-slate-800">Activité terminée !</h3>
        <div className="bg-violet-50 rounded-2xl p-4">
          <p className="text-2xl font-black text-violet-600">+35 XP gagnés ! ✨</p>
        </div>
        <button onClick={() => onComplete(80, 35)} className="btn-fun w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 text-lg">
          Continuer 🚀
        </button>
      </div>
    );
  }

  if (!selectedActivity) {
    return (
      <div className="space-y-5">
        <div className={`bg-gradient-to-br ${info.color} rounded-2xl p-6 text-center text-white`}>
          <div className="text-5xl mb-2">{info.emoji}</div>
          <h3 className="text-xl font-black">{info.title}</h3>
          <p className="text-white/80 text-sm mt-1">{info.desc}</p>
        </div>
        <p className="font-bold text-slate-700">Choisis une activité :</p>
        <div className="space-y-3">
          {info.activities.map((act) => (
            <button
              key={act}
              onClick={() => setSelectedActivity(act)}
              className="w-full text-left px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50 font-semibold text-slate-700 transition-all flex items-center justify-between"
            >
              <span>{act}</span>
              <span className="text-slate-300">→</span>
            </button>
          ))}
        </div>
        {child && null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 rounded-2xl p-4 text-center">
        <p className="font-bold text-slate-700">"{selectedActivity}"</p>
        <p className="text-sm text-slate-500 mt-1">Cette activité est disponible dans la version complète d&apos;Elevo. Pour l&apos;instant, marquons-la comme terminée !</p>
      </div>
      <button onClick={() => setDone(true)} className="btn-fun w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 text-lg">
        Marquer comme terminé ✓
      </button>
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
export default function ModulePage({ params }: { params: Promise<{ id: string; module: string }> }) {
  const { id, module: moduleId } = use(params);
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
          {!["reading", "math", "memory", "emotional", "assessment", "orientation"].includes(moduleId) && (
            <GenericModule moduleId={moduleId} child={child} onComplete={handleComplete} />
          )}
        </div>
      </main>
    </div>
  );
}
