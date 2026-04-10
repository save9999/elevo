"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LumoCharacter from "@/components/LumoCharacter";
import FunQuiz from "@/components/FunQuiz";
import MathChallenge from "@/components/MathChallenge";
import ExerciseShell from "@/components/ExerciseShell";
import ConfettiBlast from "@/components/ConfettiBlast";
import CuisineGame from "@/components/games/CuisineGame";
import LetterFishingGame from "@/components/games/LetterFishingGame";
import TracingGame from "@/components/games/TracingGame";
import MemorySimonGame from "@/components/games/MemorySimonGame";
import { rewardLumoStats } from "@/components/LumoStats";
import { useNarration } from "@/hooks/useNarration";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// ── EXERCISE TRACKER (localStorage) ───────────────────────────────────────────
function getExerciseIdx(childId: string, module: string): number {
  if (typeof window === "undefined") return 0;
  const key = `elevo_ex_${childId}_${module}`;
  return parseInt(localStorage.getItem(key) || "0", 10);
}
function advanceExerciseIdx(childId: string, module: string): void {
  if (typeof window === "undefined") return;
  const key = `elevo_ex_${childId}_${module}`;
  const cur = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(cur + 1));
}

interface Child {
  id: string; name: string; avatar: string; ageGroup: string; level: number; xp: number;
}

// ── READING MODULE ─────────────────────────────────────────────────────────────
const ALL_STORIES: Record<string, { text: string; questions: { q: string; options: string[]; correct: number }[] }[]> = {
  maternelle: [
    { text: "🐱 Le chat s'appelle Mimi. Mimi aime jouer avec une pelote de laine rouge. Aujourd'hui, il fait beau et Mimi joue dans le jardin.", questions: [{ q: "Comment s'appelle le chat ?", options: ["Tom", "Mimi", "Felix", "Luna"], correct: 1 }, { q: "Avec quoi Mimi joue-t-il ?", options: ["Une balle", "Une pelote de laine", "Un os", "Un poisson"], correct: 1 }, { q: "Où joue-t-il ?", options: ["Dans la maison", "À l'école", "Dans le jardin", "Dans la rue"], correct: 2 }] },
    { text: "🐶 Léo est un petit chien très joyeux. Il a des poils tout dorés et une grande queue. Léo adore courir avec les enfants et attraper les balles rouges.", questions: [{ q: "Comment s'appelle le chien ?", options: ["Max", "Rex", "Léo", "Fido"], correct: 2 }, { q: "De quelle couleur sont ses poils ?", options: ["Blancs", "Noirs", "Dorés", "Gris"], correct: 2 }, { q: "Qu'est-ce que Léo adore faire ?", options: ["Dormir", "Courir et attraper les balles", "Manger", "Nager"], correct: 1 }] },
    { text: "🌧️ Aujourd'hui il pleut. Tom reste à la maison. Il dessine un arc-en-ciel avec ses crayons de couleur. Sa maman dit que c'est très beau.", questions: [{ q: "Quel temps fait-il ?", options: ["Il fait beau", "Il neige", "Il pleut", "Il y a du vent"], correct: 2 }, { q: "Que fait Tom ?", options: ["Il joue dehors", "Il dessine", "Il mange", "Il dort"], correct: 1 }, { q: "Qu'est-ce que Tom dessine ?", options: ["Une maison", "Un chien", "Un arc-en-ciel", "Un arbre"], correct: 2 }] },
    { text: "🍎 La maîtresse apporte des pommes pour toute la classe. Il y a des pommes rouges et des pommes vertes. Chaque enfant choisit sa pomme préférée.", questions: [{ q: "Qui apporte les pommes ?", options: ["La maman", "La maîtresse", "Le directeur", "Le facteur"], correct: 1 }, { q: "De quelles couleurs sont les pommes ?", options: ["Jaunes et rouges", "Vertes et jaunes", "Rouges et vertes", "Bleues et rouges"], correct: 2 }, { q: "Que font les enfants ?", options: ["Ils jouent", "Ils choisissent leur pomme", "Ils dorment", "Ils chantent"], correct: 1 }] },
    { text: "🌈 Après la pluie, un bel arc-en-ciel apparaît dans le ciel. Emma montre l'arc-en-ciel à son petit frère. Ils comptent sept couleurs ensemble.", questions: [{ q: "Quand apparaît l'arc-en-ciel ?", options: ["Avant la pluie", "Pendant la pluie", "Après la pluie", "La nuit"], correct: 2 }, { q: "Que fait Emma ?", options: ["Elle pleure", "Elle montre l'arc-en-ciel", "Elle court", "Elle chante"], correct: 1 }, { q: "Combien de couleurs ont-ils compté ?", options: ["5", "6", "7", "8"], correct: 2 }] },
    { text: "🐸 Grenouille vit au bord d'un étang. Elle aime sauter de feuille en feuille. Ce matin, elle a trouvé un nouveau copain : un escargot qui marchait lentement.", questions: [{ q: "Où vit Grenouille ?", options: ["Dans la forêt", "Au bord d'un étang", "Dans une maison", "Dans les montagnes"], correct: 1 }, { q: "Qu'aime faire Grenouille ?", options: ["Nager", "Sauter de feuille en feuille", "Manger des insectes", "Dormir"], correct: 1 }, { q: "Qui a-t-elle rencontré ?", options: ["Un papillon", "Un chat", "Un escargot", "Une abeille"], correct: 2 }] },
  ],
  primaire: [
    { text: "🌍 La déforestation est un problème majeur pour notre planète. Chaque année, des millions d'arbres sont abattus pour faire place à des cultures ou des villes. Sans arbres, les animaux perdent leur habitat et l'air devient moins pur.", questions: [{ q: "Qu'est-ce que la déforestation ?", options: ["Planter des arbres", "Couper des arbres", "Arroser les plantes", "Observer les oiseaux"], correct: 1 }, { q: "Quelles sont les conséquences ?", options: ["Plus d'animaux", "Moins de pollution", "Les animaux perdent leur habitat", "L'air devient plus pur"], correct: 2 }, { q: "Pourquoi coupe-t-on des arbres ?", options: ["Pour les vendre comme jouets", "Pour faire place à des cultures ou des villes", "Pour les replanter ailleurs", "Pour fabriquer des livres"], correct: 1 }] },
    { text: "🦋 La métamorphose du papillon est l'un des phénomènes les plus fascinants de la nature. Une chenille tisse un cocon autour d'elle et, après plusieurs semaines, elle en sort transformée en magnifique papillon aux ailes colorées.", questions: [{ q: "Qu'est-ce qu'une métamorphose ?", options: ["Un voyage", "Une transformation complète", "Une maladie", "Un jeu"], correct: 1 }, { q: "Où la chenille se transforme-t-elle ?", options: ["Dans l'eau", "Dans un cocon", "Sous la terre", "Dans un arbre"], correct: 1 }, { q: "En quoi se transforme la chenille ?", options: ["En abeille", "En araignée", "En papillon", "En fourmi"], correct: 2 }] },
    { text: "🚀 Le système solaire est composé du Soleil et de tous les astres qui gravitent autour de lui. Il comprend huit planètes principales. La Terre est la seule planète connue où la vie existe.", questions: [{ q: "Combien y a-t-il de planètes ?", options: ["6", "7", "8", "9"], correct: 2 }, { q: "Quelle planète abrite la vie ?", options: ["Mars", "Venus", "La Terre", "Jupiter"], correct: 2 }, { q: "Autour de quoi gravitent les planètes ?", options: ["La Lune", "Le Soleil", "La Terre", "Une étoile lointaine"], correct: 1 }] },
    { text: "🐋 Les baleines sont les plus grands animaux de la planète. Elles vivent dans tous les océans du monde et se nourrissent principalement de minuscules crevettes appelées krill. Malgré leur taille immense, ce sont des animaux très doux.", questions: [{ q: "Qu'est-ce que les baleines ?", options: ["Les poissons les plus grands", "Les plus grands animaux", "Des créatures dangereuses", "Des poissons rares"], correct: 1 }, { q: "De quoi se nourrissent-elles ?", options: ["De poissons géants", "De krill", "D'algues", "De méduses"], correct: 1 }, { q: "Comment sont les baleines malgré leur taille ?", options: ["Très agressives", "Très lentes", "Très douces", "Très bruyantes"], correct: 2 }] },
    { text: "⚡ L'électricité est une forme d'énergie utilisée partout dans notre vie quotidienne. Elle alimente les lampes, les appareils ménagers et les transports. Benjamin Franklin a découvert que la foudre est une forme d'électricité.", questions: [{ q: "Qu'est-ce que l'électricité ?", options: ["Un liquide", "Une forme d'énergie", "Un métal", "Un gaz"], correct: 1 }, { q: "Qui a découvert le lien entre foudre et électricité ?", options: ["Einstein", "Newton", "Benjamin Franklin", "Edison"], correct: 2 }, { q: "Que fait l'électricité dans notre vie ?", options: ["Elle pollue uniquement", "Elle n'est pas utile", "Elle alimente lampes et appareils", "Elle crée du froid"], correct: 2 }] },
    { text: "🏔️ Les montagnes se forment sur des millions d'années à cause du mouvement des plaques tectoniques. Les sommets les plus hauts du monde se trouvent dans l'Himalaya, notamment l'Everest, culminant à 8 849 mètres.", questions: [{ q: "Comment se forment les montagnes ?", options: ["En quelques années", "Par la pluie", "Sur des millions d'années", "Par le vent"], correct: 2 }, { q: "Où se trouvent les sommets les plus hauts ?", options: ["Dans les Alpes", "Dans l'Himalaya", "Dans les Pyrénées", "Dans les Andes"], correct: 1 }, { q: "Quelle est l'altitude de l'Everest ?", options: ["7 000 m", "8 000 m", "8 849 m", "9 000 m"], correct: 2 }] },
  ],
  "college-lycee": [
    { text: "🧬 La mitose est le processus par lequel une cellule se divise pour donner deux cellules filles identiques. Ce mécanisme est fondamental pour la croissance et la réparation des tissus. Il comprend quatre phases principales : la prophase, la métaphase, l'anaphase et la télophase.", questions: [{ q: "Combien de cellules produit la mitose ?", options: ["1", "2", "4", "8"], correct: 1 }, { q: "À quoi sert la mitose ?", options: ["À produire des gamètes", "À la croissance et réparation des tissus", "À la digestion", "À la respiration"], correct: 1 }, { q: "Quelle est la première phase ?", options: ["Anaphase", "Métaphase", "Prophase", "Télophase"], correct: 2 }] },
    { text: "📜 La Révolution française de 1789 marque une rupture majeure dans l'histoire de France. Elle aboutit à l'abolition des privilèges, à la Déclaration des droits de l'homme et du citoyen, et à la fin de la monarchie absolue.", questions: [{ q: "En quelle année ?", options: ["1689", "1789", "1869", "1889"], correct: 1 }, { q: "Qu'a-t-elle aboli ?", options: ["Le commerce", "Les privilèges", "L'agriculture", "La religion"], correct: 1 }, { q: "Quel document a été rédigé ?", options: ["La Constitution américaine", "Le Manifeste communiste", "La Déclaration des droits de l'homme", "La Charte de l'ONU"], correct: 2 }] },
    { text: "🌡️ Le réchauffement climatique désigne l'augmentation de la température moyenne à la surface de la Terre. Il est principalement causé par les émissions de gaz à effet de serre. Ses conséquences incluent la montée des eaux et la disparition de nombreuses espèces.", questions: [{ q: "Quelle est la principale cause ?", options: ["Les volcans", "Les activités humaines", "Les marées", "Le soleil"], correct: 1 }, { q: "Quelle est une conséquence ?", options: ["Plus de biodiversité", "Baisse des températures", "Montée des eaux", "Moins de tempêtes"], correct: 2 }, { q: "Par quoi est-il mesuré ?", options: ["La pression atmosphérique", "La température moyenne", "Le niveau des océans", "Le nombre d'ouragans"], correct: 1 }] },
    { text: "🤖 L'intelligence artificielle (IA) est une branche de l'informatique qui vise à créer des systèmes capables d'effectuer des tâches nécessitant normalement l'intelligence humaine. Elle trouve des applications dans la médecine, l'éducation et la création artistique.", questions: [{ q: "Qu'est-ce que l'IA ?", options: ["Un robot physique", "Une branche de l'informatique", "Un langage de programmation", "Une console de jeux"], correct: 1 }, { q: "Quelles tâches effectue-t-elle ?", options: ["Uniquement calculer", "Tâches nécessitant l'intelligence humaine", "Seulement écrire du texte", "Uniquement jouer aux échecs"], correct: 1 }, { q: "Dans quel domaine est-elle utilisée ?", options: ["Uniquement la guerre", "La médecine, l'éducation et les arts", "Uniquement le sport", "Uniquement l'agriculture"], correct: 1 }] },
    { text: "⚗️ La photosynthèse est le processus par lequel les plantes utilisent la lumière du soleil pour transformer le dioxyde de carbone et l'eau en glucose et en oxygène. Ce mécanisme est à la base de toute vie sur Terre.", questions: [{ q: "Qu'est-ce que la photosynthèse ?", options: ["Un type de digestion", "Un mécanisme des plantes pour produire de l'énergie", "Un processus chimique industriel", "Une réaction nucléaire"], correct: 1 }, { q: "Quels éléments sont transformés ?", options: ["Glucose et eau", "CO2 et eau", "Oxygène et glucose", "Azote et eau"], correct: 1 }, { q: "Qu'est-ce qui est produit ?", options: ["CO2 et eau", "Azote et glucose", "Glucose et oxygène", "Eau et azote"], correct: 2 }] },
    { text: "🌐 La mondialisation désigne l'interdépendance croissante des économies, des sociétés et des cultures à l'échelle mondiale. Elle est facilitée par les nouvelles technologies de communication et les échanges commerciaux internationaux.", questions: [{ q: "Que désigne la mondialisation ?", options: ["L'uniformisation des cultures", "L'interdépendance croissante à l'échelle mondiale", "La domination d'un pays", "La fin des États-nations"], correct: 1 }, { q: "Qu'est-ce qui facilite la mondialisation ?", options: ["Les guerres", "Les nouvelles technologies et les échanges commerciaux", "L'isolationnisme", "Les frontières fermées"], correct: 1 }, { q: "Quels domaines sont concernés ?", options: ["Seulement l'économie", "Seulement la culture", "Les économies, sociétés et cultures", "Seulement la politique"], correct: 2 }] },
  ],
};

function ReadingModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const { narrate, stop: stopNarration, speaking } = useNarration();
  const storyList = ALL_STORIES[child.ageGroup] || ALL_STORIES.primaire;
  const [mode, setMode] = useState<"library" | "ai">("library");
  const [storyIdx] = useState(() => getExerciseIdx(child.id, "reading") % storyList.length);
  const [aiStory, setAiStory] = useState<typeof storyList[0] | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  function fetchAiStory() {
    setLoadingAI(true);
    setAiStory(null);
    fetch("/api/ai/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: "reading",
        ageGroup: child.ageGroup,
        level: child.level,
        sessionCount: getExerciseIdx(child.id, "reading"),
        childName: child.name,
        heroMode: true, // enfant = protagoniste
      }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.data) setAiStory(data.data); setLoadingAI(false); })
      .catch(() => setLoadingAI(false));
  }

  useEffect(() => {
    if (mode === "ai" && !aiStory && !loadingAI) fetchAiStory();
  }, [mode]); // eslint-disable-line

  const staticStory = storyList[storyIdx];
  const story = mode === "ai" && aiStory ? aiStory : staticStory;
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

  if (loadingAI) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl animate-bounce-slow">✨</div>
        <p className="font-black text-slate-700 text-xl">Lumo prépare une histoire pour {child.name}…</p>
        <p className="text-sm text-slate-500">Une aventure unique rien que pour toi !</p>
        <div className="flex justify-center gap-1">
          {[0,1,2].map((i) => (
            <div key={i} className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (step === "read") {
    return (
      <div className="space-y-5">

        {/* Sélecteur de mode */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => { setMode("library"); stopNarration(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${mode === "library" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}
          >
            📚 Bibliothèque
          </button>
          <button
            onClick={() => { setMode("ai"); stopNarration(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${mode === "ai" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}
          >
            ✨ Histoire pour {child.name}
          </button>
        </div>

        {/* Lumo narrateur */}
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
            {mode === "ai"
              ? <p className="text-sm font-black text-blue-700">✨ Histoire créée spécialement pour {child.name} !</p>
              : <p className="text-sm font-black text-blue-700">Lumo te raconte l&apos;histoire !</p>
            }
          </div>
        </div>

        {/* Texte de l'histoire */}
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 text-slate-700 text-base leading-relaxed font-medium shadow-sm">
          {story.text}
        </div>

        {/* Bouton narration */}
        <button
          onClick={() => speaking ? stopNarration() : narrate(story.text)}
          className={`w-full py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${speaking ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white" : "bg-blue-50 text-blue-700 border-2 border-blue-200"}`}
        >
          {speaking ? "⏸ Pause narration" : "🔊 Écouter l'histoire"}
        </button>

        {/* Mode IA : bouton nouvelle histoire */}
        {mode === "ai" && (
          <button
            onClick={() => { stopNarration(); fetchAiStory(); }}
            className="w-full py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-95 bg-violet-50 text-violet-700 border-2 border-violet-200"
          >
            🎲 Nouvelle histoire pour {child.name}
          </button>
        )}

        <button
          onClick={() => { stopNarration(); setStep("quiz"); }}
          className="btn-fun w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 text-lg"
        >
          J&apos;ai compris ! Quiz 🧠
        </button>
      </div>
    );
  }

  if (step === "quiz") {
    return (
      <FunQuiz
        title="Compréhension"
        icon="📖"
        questions={story.questions}
        accentColor="blue"
        onComplete={(score, xp) => onComplete(score, xp)}
      />
    );
  }

  // Fallback (shouldn't reach here)
  return null;
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
    { q: "🐢🐢 + 🐢🐢🐢🐢 = ?", answer: "6" },
    { q: "10 - 3 = ?", answer: "7" },
    { q: "1 + 6 = ?", answer: "7" },
    { q: "🌸🌸🌸🌸 - 🌸 = ?", answer: "3" },
    { q: "8 + 2 = ?", answer: "10" },
    { q: "6 - 4 = ?", answer: "2" },
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
    { q: "33 × 3 = ?", answer: "99" },
    { q: "72 ÷ 9 = ?", answer: "8" },
    { q: "10% de 350 = ?", answer: "35" },
    { q: "√81 = ?", answer: "9" },
    { q: "56 ÷ 8 = ?", answer: "7" },
    { q: "Périmètre d'un carré de côté 6 = ?", answer: "24" },
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
    { q: "Périmètre d'un cercle de rayon 5 : 2π × ?", answer: "5" },
    { q: "Résoudre : 5x + 10 = 35, x = ?", answer: "5" },
    { q: "Résoudre : x² - 9 = 0, x = ?", answer: "3" },
    { q: "cos(60°) = ?", answer: "0.5" },
    { q: "Dériver f(x) = 2x³ : f'(x) = ?", answer: "6x²" },
    { q: "log₁₀(100) = ?", answer: "2" },
    { q: "Résoudre : 4x - 3 = 17, x = ?", answer: "5" },
    { q: "sin(30°) = ?", answer: "0.5" },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function MathModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  // Rotate between math challenge and cuisine game
  const rotationIdx = getExerciseIdx(child.id, "math");
  const useCuisine = rotationIdx % 2 === 0;

  const [problems] = useState(() => {
    const pool = MATH_POOLS[child.ageGroup] || MATH_POOLS.primaire;
    const offset = rotationIdx % Math.max(1, pool.length - 5);
    const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
    return shuffle(rotated).slice(0, 5);
  });

  if (useCuisine) {
    return <CuisineGame ageGroup={child.ageGroup} onComplete={onComplete} />;
  }

  return (
    <MathChallenge
      problems={problems}
      ageGroup={child.ageGroup}
      onComplete={(score, xp) => onComplete(score, xp)}
    />
  );
}

// ── MEMORY MODULE ────────────────────────────────────────────────────────────
const MEMORY_POOLS = [
  ["🦊", "🐼", "🦁", "🐬", "🦋", "🐙", "🦄", "🐧"],
  ["🚀", "🌈", "⭐", "🎸", "🍕", "🎯", "💎", "🌺"],
  ["🏆", "🎮", "🍦", "🎨", "🌊", "🦅", "🍀", "🎭"],
  ["🌙", "☀️", "⚡", "🔮", "🎪", "🎡", "🎠", "🎢"],
  ["🦖", "🐲", "🦄", "🐳", "🦋", "🦚", "🦩", "🦜"],
];

function MemoryModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const rotationIdx = getExerciseIdx(child.id, "memory");
  // Alternate between Simon game and cards game
  const useSimon = rotationIdx % 2 === 1;

  const poolIdx = rotationIdx % MEMORY_POOLS.length;
  const emojis = MEMORY_POOLS[poolIdx];
  const pairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  const [cards, setCards] = useState(pairs.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [done, setDone] = useState(false);
  const { play } = useSoundEffects();

  function flip(id: number) {
    if (selected.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;
    play("pop");
    const next = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(next);
    const newSel = [...selected, id];
    setSelected(newSel);
    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSel;
      if (next[a].emoji === next[b].emoji) {
        play("correct");
        const matched = next.map((c) => newSel.includes(c.id) ? { ...c, matched: true } : c);
        setCards(matched);
        setSelected([]);
        const newCount = matchedCount + 1;
        setMatchedCount(newCount);
        if (newCount >= 3) play("streak");
        if (matched.every((c) => c.matched)) {
          play("victory");
          setDone(true);
        }
      } else {
        play("wrong");
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
      <ExerciseShell title="Mémoire" icon="🧠" currentStep={emojis.length} totalSteps={emojis.length} showConfetti accentColor="pink">
        <div className="text-center space-y-6 py-4">
          <div className="text-8xl animate-bounce" style={{ animationDuration: "1.5s" }}>🧠</div>
          <h3 className="text-3xl font-black text-slate-800">Toutes les paires trouvées !</h3>
          <p className="text-slate-500 font-semibold">{moves} coups — {score >= 80 ? "Incroyable !" : score >= 50 ? "Bien joué !" : "Tu feras mieux !"}</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg shadow-lg">
            +{xp} XP ✨
          </div>
          <button onClick={() => onComplete(score, xp)} className="btn-fun w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 text-lg">
            Continuer 🚀
          </button>
        </div>
      </ExerciseShell>
    );
  }

  // Switch to Simon game on alternate sessions
  if (useSimon) {
    return <MemorySimonGame ageGroup={child.ageGroup} onComplete={onComplete} />;
  }

  return (
    <ExerciseShell title="Mémoire" icon="🧠" currentStep={matchedCount} totalSteps={emojis.length} accentColor="pink"
      lumoMessage={matchedCount === 0 ? "Retourne les cartes et trouve les paires !" : matchedCount >= 5 ? "Tu es un champion de la mémoire ! 🔥" : undefined}
      lumoMood={matchedCount >= 3 ? "excited" : "happy"}>
      <style>{`
        @keyframes card-flip { 0% { transform: rotateY(0); } 50% { transform: rotateY(90deg); } 100% { transform: rotateY(0); } }
        .card-appear { animation: card-flip 0.4s ease-out; }
        @keyframes card-match { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(0.95); } }
        .card-matched { animation: card-match 0.4s ease-out; }
      `}</style>
      <div className="flex justify-between text-sm font-bold text-slate-500 mb-3">
        <span>🃏 {matchedCount}/{emojis.length} paires</span>
        <span>Coups : {moves}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flip(card.id)}
            className={`h-18 aspect-square rounded-2xl text-3xl flex items-center justify-center font-bold transition-all duration-300 shadow-sm ${
              card.matched ? "bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 scale-95 card-matched" :
              card.flipped ? "bg-gradient-to-br from-pink-100 to-violet-100 border-2 border-violet-300 card-appear" :
              "bg-gradient-to-br from-violet-200 to-purple-200 hover:from-violet-300 hover:to-purple-300 border-2 border-violet-300/50 active:scale-90"
            }`}
          >
            {card.flipped || card.matched ? card.emoji : <span className="text-violet-400 text-2xl">?</span>}
          </button>
        ))}
      </div>
    </ExerciseShell>
  );
}

// ── EMOTIONAL MODULE ─────────────────────────────────────────────────────────
const ALL_EMOTIONAL_SCENARIOS = [
  { situation: "Ton ami a dit quelque chose de blessant devant toute la classe.", emotion: "😢", question: "Comment tu te sens ?", options: ["Je suis très triste et blessé(e)", "Je m'en fiche complètement", "Je suis content(e)", "Je veux me battre"], best: 0, advice: "Il est normal de se sentir blessé(e). Tu peux en parler à un adulte de confiance ou à ton ami en privé." },
  { situation: "Tu as beaucoup travaillé pour un examen mais tu n'as pas eu une bonne note.", emotion: "😤", question: "Quelle est la meilleure réaction ?", options: ["Arrêter de travailler", "Analyser mes erreurs et demander de l'aide", "Copier sur les autres", "Pleurer sans rien faire"], best: 1, advice: "Analyser ses erreurs est la clé du progrès ! Chaque erreur est une occasion d'apprendre." },
  { situation: "Un camarade est tout seul dans la cour et semble triste.", emotion: "🤝", question: "Que fais-tu ?", options: ["Je l'ignore", "Je vais lui parler et lui demander si ça va", "Je me moque de lui", "Je raconte à tout le monde"], best: 1, advice: "Aller vers quelqu'un qui semble seul, c'est un acte de gentillesse très courageux !" },
  { situation: "Tu as perdu ton jouet préféré et tu es très triste.", emotion: "😭", question: "Comment gérer cette tristesse ?", options: ["Crier et me mettre en colère contre tout le monde", "Pleurer un peu, puis chercher une solution ou demander de l'aide", "Prétendre que ça ne m'embête pas", "Ne plus jamais jouer avec quoi que ce soit"], best: 1, advice: "Exprimer sa tristesse est sain, puis chercher une solution est courageux !" },
  { situation: "Tu es jaloux(se) du cadeau reçu par ton frère/ta sœur.", emotion: "😒", question: "Que fais-tu ?", options: ["Je lui prends son cadeau", "J'exprime que je me sens jaloux(se) mais je suis content(e) pour lui/elle", "Je boude toute la journée", "Je casse son cadeau"], best: 1, advice: "Reconnaître la jalousie est mature ! L'important c'est de ne pas la laisser guider nos actions." },
  { situation: "Un ami te propose de faire quelque chose que tu trouves injuste.", emotion: "😟", question: "Quelle est la bonne réaction ?", options: ["Je fais ce qu'il dit pour ne pas perdre son amitié", "J'explique calmement que ça ne me semble pas juste", "Je l'insulte", "J'obéis en me sentant mal"], best: 1, advice: "Savoir dire non avec respect, c'est un signe de courage et de confiance en soi !" },
];

function EmotionalModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const offset = getExerciseIdx(child.id, "emotional") % (ALL_EMOTIONAL_SCENARIOS.length - 2);
  const scenarios = ALL_EMOTIONAL_SCENARIOS.slice(offset, offset + 3);

  const questions = scenarios.map((s) => ({
    q: `${s.emotion} ${s.situation}\n\n${s.question}`,
    options: s.options,
    correct: s.best,
    explanation: s.advice,
  }));

  return (
    <FunQuiz
      title="Mes émotions"
      icon="💖"
      questions={questions}
      accentColor="pink"
      onComplete={(score, xp) => onComplete(score, xp)}
    />
  );
}

// ── ASSESSMENT MODULE — Détection Dys enrichie ───────────────────────────────
const DYS_QUESTIONS = [
  // Dyslexie — lecture
  {
    id: "dyslexia_letters",
    category: "dyslexie",
    q: "📖 Est-ce que certaines lettres se ressemblent et tu les confonds parfois ? (b/d, p/q, m/n…)",
    options: ["Non, je les distingue bien", "Parfois oui", "Souvent", "Presque tout le temps"],
    weights: [0, 1, 2, 3],
    emoji: "🔤",
  },
  {
    id: "dyslexia_reading",
    category: "dyslexie",
    q: "📚 Quand tu lis à voix haute, est-ce que les mots te semblent difficiles à déchiffrer ?",
    options: ["Non, je lis facilement", "Parfois c'est lent", "Souvent difficile", "Très difficile"],
    weights: [0, 1, 2, 3],
    emoji: "📖",
  },
  {
    id: "dyslexia_order",
    category: "dyslexie",
    q: "🔄 Est-ce que tu inverses parfois l'ordre des lettres dans les mots quand tu écris ? (ex: 'por' au lieu de 'pro')",
    options: ["Non, jamais", "Rarement", "Assez souvent", "Très souvent"],
    weights: [0, 1, 2, 3],
    emoji: "↔️",
  },
  // Dysorthographie — écriture
  {
    id: "dysortho_spelling",
    category: "dysorthographie",
    q: "✏️ Fais-tu des fautes d'orthographe même sur des mots simples que tu connais ?",
    options: ["Non, rarement", "Parfois oui", "Assez souvent", "Tout le temps"],
    weights: [0, 1, 2, 3],
    emoji: "📝",
  },
  {
    id: "dysortho_sounds",
    category: "dysorthographie",
    q: "🔊 Est-ce qu'il t'arrive d'écrire les mots comme ils sonnent, pas comme ils s'écrivent ? (ex: 'sou' au lieu de 'sous')",
    options: ["Non, jamais", "Rarement", "Parfois", "Souvent"],
    weights: [0, 1, 2, 3],
    emoji: "🎵",
  },
  // Dyspraxie — motricité
  {
    id: "dyspraxia_writing",
    category: "dyspraxie",
    q: "✍️ Est-ce que tu trouves difficile d'écrire de façon lisible et régulière ?",
    options: ["Non, mon écriture est claire", "Parfois brouillonne", "Souvent difficile à lire", "Très difficile"],
    weights: [0, 1, 2, 3],
    emoji: "🖊️",
  },
  {
    id: "dyspraxia_coordination",
    category: "dyspraxie",
    q: "⚽ As-tu du mal à coordonner tes gestes ? (attraper une balle, découper avec des ciseaux, lacer tes chaussures…)",
    options: ["Non, pas de problème", "Parfois maladroit(e)", "Souvent difficile", "Très difficile"],
    weights: [0, 1, 2, 3],
    emoji: "🤸",
  },
  // Dyscalculie — maths
  {
    id: "dyscalculia_numbers",
    category: "dyscalculie",
    q: "🔢 As-tu du mal à te souvenir des tables de multiplication même après beaucoup de pratique ?",
    options: ["Non, je les connais", "Quelques-unes m'échappent", "Souvent difficile", "Très difficile"],
    weights: [0, 1, 2, 3],
    emoji: "🧮",
  },
  // TDA/H — attention
  {
    id: "adhd_attention",
    category: "attention",
    q: "🎯 As-tu du mal à rester concentré(e) sur une tâche sans te laisser distraire ?",
    options: ["Non, ça va bien", "Parfois", "Souvent", "Presque toujours"],
    weights: [0, 1, 2, 3],
    emoji: "🧠",
  },
  {
    id: "adhd_hyperactivity",
    category: "attention",
    q: "💨 As-tu du mal à rester tranquille, as-tu souvent besoin de bouger ?",
    options: ["Non, je peux rester calme", "Parfois agité(e)", "Souvent difficile", "Impossible de rester immobile"],
    weights: [0, 1, 2, 3],
    emoji: "⚡",
  },
  // Bien-être général
  {
    id: "emotional",
    category: "bien-être",
    q: "😊 Comment tu te sens à l'école en général ?",
    options: ["Très bien !", "Plutôt bien", "Pas très bien", "Très anxieux/se"],
    weights: [0, 0, 1, 2],
    emoji: "🏫",
  },
  {
    id: "sleep",
    category: "bien-être",
    q: "😴 Est-ce que tu dors bien la nuit (7-9h) ?",
    options: ["Oui, toujours", "La plupart du temps", "Pas toujours", "Rarement"],
    weights: [0, 0, 1, 2],
    emoji: "🌙",
  },
];

function AssessmentModule({ child, onComplete }: { child: Child; onComplete: (score: number, xp: number) => void }) {
  const [phase, setPhase] = useState<"intro" | "questions" | "loading" | "result">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { question: string; answer: string; index: number; weight: number }>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [selectedAnim, setSelectedAnim] = useState<number | null>(null);
  const { play } = useSoundEffects();

  // Select questions appropriate for age
  const questions = child.ageGroup === "maternelle"
    ? DYS_QUESTIONS.filter((q) => !["dyslexia_order", "dysortho_sounds", "dyscalculia_numbers"].includes(q.id))
    : DYS_QUESTIONS;

  function answer(value: string, optionIndex: number) {
    play("pop");
    setSelectedAnim(optionIndex);
    const q = questions[step];
    const weight = q.weights[optionIndex] ?? 0;
    const newAnswers = {
      ...answers,
      [q.id]: { question: q.q, answer: value, index: optionIndex, weight },
    };
    setTimeout(() => {
      setSelectedAnim(null);
      setAnswers(newAnswers);
      if (step >= questions.length - 1) {
        submitAssessment(newAnswers);
      } else {
        setStep((s) => s + 1);
      }
    }, 500);
  }

  async function submitAssessment(finalAnswers: typeof answers) {
    setPhase("loading");
    // Compute dys risk scores locally
    const scores: Record<string, number[]> = {};
    for (const [id, data] of Object.entries(finalAnswers)) {
      const q = questions.find((q) => q.id === id);
      if (!q) continue;
      if (!scores[q.category]) scores[q.category] = [];
      scores[q.category].push(data.weight);
    }

    const avgScores: Record<string, number> = {};
    for (const [cat, ws] of Object.entries(scores)) {
      avgScores[cat] = ws.reduce((a, b) => a + b, 0) / ws.length;
    }

    try {
      const res = await fetch("/api/ai/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: child.id,
          answers: finalAnswers,
          assessmentType: "Bilan dys et apprentissage",
          dysScores: avgScores,
        }),
      });
      const data = await res.json();
      setResult({ ...data, dysScores: avgScores });
    } catch {
      // Fallback: compute locally
      const challenges = Object.entries(avgScores)
        .filter(([, score]) => score >= 1.5)
        .map(([cat]) => {
          const labels: Record<string, string> = {
            dyslexie: "Difficultés de lecture (indicateurs de dyslexie)",
            dysorthographie: "Difficultés d'orthographe",
            dyspraxie: "Difficultés motrices (indicateurs de dyspraxie)",
            dyscalculie: "Difficultés en calcul",
            attention: "Difficultés de concentration (indicateurs de TDA/H)",
          };
          return labels[cat] || cat;
        });
      setResult({
        riskLevel: challenges.length > 0 ? "medium" : "low",
        detectedChallenges: challenges,
        strengths: Object.entries(avgScores).filter(([, s]) => s < 1).map(([c]) => c),
        summary: challenges.length > 0
          ? "Des indicateurs ont été détectés. Consulte le tableau de bord parent pour les recommandations."
          : "Très beau profil ! Continue comme ça !",
        dysScores: avgScores,
      });
    }
    setPhase("result");
  }

  // INTRO
  if (phase === "intro") {
    return (
      <div className="space-y-6 text-center">
        <div className="text-7xl animate-bounce">🔍</div>
        <h3 className="text-2xl font-black text-slate-800">Bilan personnalisé</h3>
        <p className="text-slate-600 leading-relaxed">
          Ce bilan va m&apos;aider à mieux te connaître pour t&apos;accompagner au mieux.
          Il n&apos;y a pas de bonne ou mauvaise réponse — sois honnête !
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: "📖", label: "Lecture", color: "bg-blue-50 border-blue-200" },
            { emoji: "✏️", label: "Écriture", color: "bg-purple-50 border-purple-200" },
            { emoji: "🎯", label: "Attention", color: "bg-amber-50 border-amber-200" },
            { emoji: "😊", label: "Bien-être", color: "bg-green-50 border-green-200" },
          ].map((item) => (
            <div key={item.label} className={`${item.color} border-2 rounded-2xl p-4 flex flex-col items-center gap-2`}>
              <span className="text-3xl">{item.emoji}</span>
              <span className="font-bold text-slate-700 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setPhase("questions")}
          className="btn-fun w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 text-lg"
        >
          C&apos;est parti ! 🚀
        </button>
      </div>
    );
  }

  // LOADING
  if (phase === "loading") {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl animate-spin">⚙️</div>
        <p className="font-black text-slate-700 text-xl">Analyse en cours…</p>
        <p className="text-sm text-slate-500">Je prépare ton bilan personnalisé</p>
        <div className="flex justify-center gap-1 mt-4">
          {[0,1,2].map((i) => (
            <div key={i} className="w-3 h-3 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  // RESULT
  if (phase === "result" && result) {
    const r = result as {
      riskLevel?: string; summary?: string; strengths?: string[];
      detectedChallenges?: string[]; dysScores?: Record<string, number>;
    };

    const dysCategories = [
      { key: "dyslexie", label: "Dyslexie", emoji: "📖", color: "bg-blue-100 text-blue-700" },
      { key: "dysorthographie", label: "Dysorthographie", emoji: "✏️", color: "bg-purple-100 text-purple-700" },
      { key: "dyspraxie", label: "Dyspraxie", emoji: "✋", color: "bg-orange-100 text-orange-700" },
      { key: "dyscalculie", label: "Dyscalculie", emoji: "🔢", color: "bg-green-100 text-green-700" },
      { key: "attention", label: "Attention / TDA-H", emoji: "🎯", color: "bg-amber-100 text-amber-700" },
    ];

    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-6xl mb-3">📊</div>
          <h3 className="text-2xl font-black text-slate-800">Ton profil</h3>
          {r.riskLevel === "high" && (
            <span className="inline-block mt-2 bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full">
              ⚠️ Consulte le tableau de bord parent
            </span>
          )}
        </div>

        {/* Dys indicators */}
        {r.dysScores && (
          <div>
            <p className="text-sm font-bold text-slate-600 mb-3">Indicateurs détectés</p>
            <div className="space-y-2">
              {dysCategories.map((cat) => {
                const score = r.dysScores![cat.key] ?? 0;
                const level = score < 0.5 ? "✅ Pas d'indicateur" : score < 1.5 ? "⚡ Léger" : "⚠️ À surveiller";
                const barColor = score < 0.5 ? "bg-green-400" : score < 1.5 ? "bg-amber-400" : "bg-red-400";
                return (
                  <div key={cat.key} className={`${cat.color} rounded-2xl p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="font-bold text-sm">{cat.label}</span>
                      </div>
                      <span className="text-xs font-bold">{level}</span>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${(score / 3) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {r.summary && (
          <div className="bg-violet-50 rounded-2xl p-4">
            <p className="font-medium text-slate-700 text-center text-sm">{r.summary}</p>
          </div>
        )}

        {r.detectedChallenges && r.detectedChallenges.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-amber-700 mb-2">💡 Points à travailler</p>
            {r.detectedChallenges.map((c: string) => (
              <p key={c} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">→</span> {c}
              </p>
            ))}
          </div>
        )}

        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-600 mb-1">ℹ️ Important</p>
          <p className="text-xs text-slate-600">
            Ce bilan est indicatif. Pour un diagnostic officiel, consultez un orthophoniste ou un neuropédiatre.
            Les résultats détaillés sont visibles dans le tableau de bord parent.
          </p>
        </div>

        <button
          onClick={() => onComplete(75, 100)}
          className="btn-fun w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 text-lg"
        >
          Super ! Continuer 🚀
        </button>
      </div>
    );
  }

  // QUESTIONS
  const q = questions[step];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm font-bold text-slate-500">
        <span>Question {step + 1}/{questions.length}</span>
        <span className="bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full text-xs">{q.category}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>
      <div className="bg-violet-50 rounded-2xl p-5 text-center">
        <div className="text-4xl mb-3">{q.emoji}</div>
        <p className="text-lg font-black text-slate-800 leading-snug">{q.q}</p>
      </div>
      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => answer(opt, i)}
            disabled={selectedAnim !== null}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-slate-700 transition-all ${
              selectedAnim === i
                ? "bg-violet-100 border-violet-400 scale-95"
                : "border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50 hover:scale-[1.02]"
            }`}
          >
            <span className="inline-block w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-black text-center leading-6 mr-2">
              {String.fromCharCode(65 + i)}
            </span>
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
  const { play: playSound } = useSoundEffects();

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
      playSound(isOk ? "correct" : "wrong");
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

  // ── Activité: Orthographe (FunQuiz) ──
  if (activity === "ortho") {
    const items = orthoQuiz[ageGroup] || orthoQuiz.primaire;
    return (
      <FunQuiz
        title="Orthographe"
        icon="🔤"
        questions={items}
        accentColor="violet"
        onComplete={(score, xp) => onComplete(score, xp)}
      />
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

  // Convert selected activity data to FunQuiz format
  const data = activity === "roleplay" ? rolePlay : activity === "conflict" ? conflictQuiz : ecoute;
  const questions = data.map((item: any) => ({
    q: item.situation || item.q || "",
    options: item.options,
    correct: item.best ?? item.correct ?? 0,
    explanation: item.feedback || item.explanation || item.tip || "",
  }));

  return (
    <FunQuiz
      title={activity === "roleplay" ? "Jeux de rôle" : activity === "conflict" ? "Gestion des conflits" : "L'art de l'écoute"}
      icon={activity === "roleplay" ? "🎭" : activity === "conflict" ? "⚖️" : "👂"}
      questions={questions}
      accentColor="amber"
      onComplete={(score, xp) => onComplete(score, xp)}
    />
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

  // ── Quiz sommeil / nutrition (FunQuiz) ──
  const quizData = activity === "sommeil" ? sommeilQuiz : nutritionQuiz;
  const quizQuestions = quizData.map((q: any) => ({
    q: q.q,
    options: q.options,
    correct: q.correct,
    explanation: q.tip,
  }));

  return (
    <FunQuiz
      title={activity === "sommeil" ? "Sommeil" : "Nutrition"}
      icon={activity === "sommeil" ? "😴" : "🥗"}
      questions={quizQuestions}
      accentColor="green"
      onComplete={(score, xp) => onComplete(score, xp)}
    />
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

  // ── Culture générale (FunQuiz) ──
  if (activity === "culture") {
    const quizQuestions = cultureQuiz.map((q: any) => ({
      q: q.q,
      options: q.options,
      correct: q.correct,
      explanation: q.fun,
    }));
    return (
      <FunQuiz
        title="Culture générale"
        icon="🌍"
        questions={quizQuestions}
        accentColor="amber"
        onComplete={(score, xp) => onComplete(score, xp)}
      />
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
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => { if (!r.ok) { router.push("/parent"); return null; } return r.json(); })
      .then((data) => { if (data) setChild(data); })
      .catch(() => router.push("/parent"));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(async (score: number, xp: number) => {
    setFinalScore(score);
    setFinalXp(xp);
    setCompleted(true);
    if (score >= 50) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    // Reward Lumo's stats based on module + score
    const rewards: Record<string, { faim?: number; joie?: number; energie?: number }> = {
      reading: { joie: 8, energie: 3 },
      math: { energie: 10, joie: 3 },
      memory: { energie: 8, joie: 5 },
      emotional: { joie: 15 },
      social: { joie: 12, energie: 3 },
      physical: { energie: 15, faim: 5 },
      creativity: { joie: 10, energie: 5 },
      writing: { joie: 6, energie: 5 },
      orientation: { joie: 5, energie: 5 },
      assessment: { joie: 5 },
    };
    const baseReward = rewards[moduleId] || { joie: 5 };
    const multiplier = score >= 80 ? 1.5 : score >= 50 ? 1 : 0.5;
    rewardLumoStats(id, {
      faim: (baseReward.faim || 0) * multiplier + (score >= 50 ? 5 : 0),  // eating always gives food
      joie: (baseReward.joie || 0) * multiplier,
      energie: (baseReward.energie || 0) * multiplier,
    });
    // Advance exercise rotation index
    advanceExerciseIdx(id, moduleId);
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
  }, [id, moduleId]);

  const meta = moduleMeta[moduleId] || { name: "Module", emoji: "📚", color: "from-violet-500 to-purple-600", bg: "bg-violet-50" };

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="text-5xl animate-bounce">⏳</div>
      </div>
    );
  }

  if (completed) {
    const perfEmoji = finalScore >= 80 ? "🏆" : finalScore >= 50 ? "⭐" : "💪";
    const perfMsg = finalScore >= 80 ? "Excellent travail !" : finalScore >= 50 ? "Bien joué !" : "Continue, tu progresses !";
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center p-6">
        {showConfetti && <ConfettiBlast active={showConfetti} />}
        <div className="card-bubble bg-white max-w-md w-full p-10 text-center">
          <div className="text-8xl mb-4 star-pop animate-bounce">{perfEmoji}</div>
          <h2 className="text-3xl font-black text-slate-800 mb-1">Bravo {child.name} !</h2>
          <p className="text-slate-500 mb-2">{perfMsg}</p>
          <p className="text-slate-400 text-sm mb-6">Tu as terminé &quot;{meta.name}&quot;</p>
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 mb-6">
            <p className="text-5xl font-black text-white">+{finalXp} XP</p>
            <p className="text-white/80 text-sm mt-1">Score : {finalScore}%</p>
          </div>
          {/* Score bar */}
          <div className="mb-6">
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  finalScore >= 80 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                  finalScore >= 50 ? "bg-gradient-to-r from-amber-400 to-yellow-500" :
                  "bg-gradient-to-r from-red-400 to-pink-500"
                }`}
                style={{ width: `${finalScore}%` }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setCompleted(false); setShowConfetti(false); }}
              className="btn-fun flex-1 bg-slate-100 text-slate-700 py-3"
            >
              🔄 Réessayer
            </button>
            <Link
              href={`/child/${id}`}
              className="btn-fun flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 text-center"
            >
              🏠 Accueil
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Prochain exercice : différent ! 🎲
          </p>
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
          {/* Reading: alternate between reading module and letter fishing game */}
          {moduleId === "reading" && (
            getExerciseIdx(id, "reading") % 2 === 0
              ? <ReadingModule child={child} onComplete={handleComplete} />
              : <LetterFishingGame ageGroup={child.ageGroup} onComplete={handleComplete} />
          )}
          {moduleId === "math" && <MathModule child={child} onComplete={handleComplete} />}
          {moduleId === "memory" && <MemoryModule child={child} onComplete={handleComplete} />}
          {moduleId === "emotional" && <EmotionalModule child={child} onComplete={handleComplete} />}
          {moduleId === "assessment" && <AssessmentModule child={child} onComplete={handleComplete} />}
          {moduleId === "orientation" && <OrientationModule child={child} onComplete={handleComplete} />}
          {/* Writing: alternate between writing module and tracing game */}
          {moduleId === "writing" && (
            getExerciseIdx(id, "writing") % 2 === 0
              ? <WritingModule child={child} onComplete={handleComplete} />
              : <TracingGame ageGroup={child.ageGroup} onComplete={handleComplete} />
          )}
          {moduleId === "social" && <SocialModule child={child} onComplete={handleComplete} />}
          {moduleId === "physical" && <PhysicalModule child={child} onComplete={handleComplete} />}
          {moduleId === "creativity" && <CreativityModule child={child} onComplete={handleComplete} />}
        </div>
      </main>
    </div>
  );
}
