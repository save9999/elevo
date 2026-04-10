"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import ExerciseShell from "../ExerciseShell";
import ConfettiBlast from "../ConfettiBlast";

// ── Recipes by difficulty ────────────────────────────────────────────────────
interface Recipe {
  id: string;
  name: string;
  emoji: string;
  needs: { ingredient: string; emoji: string; count: number }[];
  lumoMsg: string;
}

const RECIPES_BY_AGE: Record<string, Recipe[]> = {
  maternelle: [
    {
      id: "soup",
      name: "Soupe de légumes",
      emoji: "🍲",
      needs: [
        { ingredient: "Carotte", emoji: "🥕", count: 3 },
        { ingredient: "Tomate", emoji: "🍅", count: 2 },
      ],
      lumoMsg: "J'ai faim ! Tu me prépares une soupe ?",
    },
    {
      id: "fruit_salad",
      name: "Salade de fruits",
      emoji: "🥗",
      needs: [
        { ingredient: "Pomme", emoji: "🍎", count: 2 },
        { ingredient: "Banane", emoji: "🍌", count: 2 },
        { ingredient: "Fraise", emoji: "🍓", count: 3 },
      ],
      lumoMsg: "Une salade de fruits, ça te dit ?",
    },
    {
      id: "pizza",
      name: "Mini pizza",
      emoji: "🍕",
      needs: [
        { ingredient: "Fromage", emoji: "🧀", count: 1 },
        { ingredient: "Tomate", emoji: "🍅", count: 3 },
      ],
      lumoMsg: "Pizza time ! 🎉",
    },
  ],
  primaire: [
    {
      id: "cake",
      name: "Gâteau au chocolat",
      emoji: "🎂",
      needs: [
        { ingredient: "Œuf", emoji: "🥚", count: 4 },
        { ingredient: "Farine", emoji: "🌾", count: 3 },
        { ingredient: "Chocolat", emoji: "🍫", count: 5 },
      ],
      lumoMsg: "C'est mon anniversaire ! Un gâteau ?",
    },
    {
      id: "burger",
      name: "Burger de légumes",
      emoji: "🍔",
      needs: [
        { ingredient: "Salade", emoji: "🥬", count: 2 },
        { ingredient: "Tomate", emoji: "🍅", count: 3 },
        { ingredient: "Fromage", emoji: "🧀", count: 2 },
      ],
      lumoMsg: "Un vrai burger maison !",
    },
    {
      id: "smoothie",
      name: "Smoothie vitaminé",
      emoji: "🥤",
      needs: [
        { ingredient: "Fraise", emoji: "🍓", count: 6 },
        { ingredient: "Banane", emoji: "🍌", count: 2 },
        { ingredient: "Kiwi", emoji: "🥝", count: 1 },
      ],
      lumoMsg: "Boost vitamines !",
    },
  ],
  "college-lycee": [
    {
      id: "paella",
      name: "Paella",
      emoji: "🥘",
      needs: [
        { ingredient: "Crevette", emoji: "🦐", count: 8 },
        { ingredient: "Riz", emoji: "🍚", count: 5 },
        { ingredient: "Poivron", emoji: "🫑", count: 3 },
      ],
      lumoMsg: "Une paella, comme en Espagne !",
    },
    {
      id: "sushi",
      name: "Plateau de sushis",
      emoji: "🍣",
      needs: [
        { ingredient: "Poisson", emoji: "🐟", count: 6 },
        { ingredient: "Riz", emoji: "🍚", count: 10 },
        { ingredient: "Algue", emoji: "🌿", count: 4 },
      ],
      lumoMsg: "Sushi night 🎌",
    },
  ],
};

interface CuisineGameProps {
  ageGroup: string;
  onComplete: (score: number, xp: number) => void;
}

interface IngredientSlot {
  id: string;
  emoji: string;
  label: string;
}

// Generate pool of available ingredients (mix of needed and decoys)
function generatePool(recipe: Recipe): IngredientSlot[] {
  const decoys = ["🍋", "🍇", "🥒", "🌽", "🥦", "🍄", "🧅", "🥔", "🥭", "🍐"];
  const pool: IngredientSlot[] = [];

  // Add needed ingredients (with extras so it's a choice)
  recipe.needs.forEach((need, i) => {
    const extra = need.count + 2;
    for (let j = 0; j < extra; j++) {
      pool.push({ id: `${need.ingredient}-${i}-${j}`, emoji: need.emoji, label: need.ingredient });
    }
  });

  // Add some decoys for challenge
  const usedEmojis = new Set(recipe.needs.map((n) => n.emoji));
  const available = decoys.filter((d) => !usedEmojis.has(d));
  for (let i = 0; i < 4; i++) {
    const d = available[Math.floor(Math.random() * available.length)];
    pool.push({ id: `decoy-${i}`, emoji: d, label: "?" });
  }

  // Shuffle
  return pool.sort(() => Math.random() - 0.5);
}

export default function CuisineGame({ ageGroup, onComplete }: CuisineGameProps) {
  const recipes = RECIPES_BY_AGE[ageGroup] || RECIPES_BY_AGE.primaire;
  const [recipeIdx, setRecipeIdx] = useState(() => Math.floor(Math.random() * recipes.length));
  const recipe = recipes[recipeIdx];
  const { play } = useSoundEffects();
  const [pool, setPool] = useState<IngredientSlot[]>(() => generatePool(recipe));
  const [pot, setPot] = useState<IngredientSlot[]>([]);
  const [phase, setPhase] = useState<"playing" | "checking" | "done">("playing");
  const [dragged, setDragged] = useState<IngredientSlot | null>(null);
  const [shakePool, setShakePool] = useState(false);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [potGlow, setPotGlow] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recipesCompleted, setRecipesCompleted] = useState(0);
  const totalRecipes = 3;
  const potRef = useRef<HTMLDivElement>(null);

  // Handle dropping ingredient in pot
  const handleDrop = useCallback((item: IngredientSlot) => {
    if (phase !== "playing") return;

    const inRecipe = recipe.needs.find((n) => n.emoji === item.emoji);
    if (!inRecipe) {
      // Wrong ingredient!
      play("wrong");
      setWrongFeedback(`${item.emoji} ce n'est pas dans la recette !`);
      setTimeout(() => setWrongFeedback(null), 2000);
      setShakePool(true);
      setTimeout(() => setShakePool(false), 500);
      return;
    }

    // Check if we already have enough of this
    const currentCount = pot.filter((p) => p.emoji === item.emoji).length;
    if (currentCount >= inRecipe.count) {
      play("wrong");
      setWrongFeedback(`Il y a déjà assez de ${inRecipe.ingredient.toLowerCase()}s !`);
      setTimeout(() => setWrongFeedback(null), 2000);
      return;
    }

    play("pop");
    setPotGlow(true);
    setTimeout(() => setPotGlow(false), 300);

    // Add to pot, remove from pool
    setPot((prev) => [...prev, item]);
    setPool((prev) => prev.filter((p) => p.id !== item.id));
  }, [phase, pot, recipe, play]);

  // Check if recipe is complete
  useEffect(() => {
    const needsMet = recipe.needs.every((need) => {
      const count = pot.filter((p) => p.emoji === need.emoji).length;
      return count === need.count;
    });

    if (needsMet && phase === "playing") {
      setPhase("checking");
      play("correct");
      setTimeout(() => {
        play("victory");
        setShowConfetti(true);
        setScore((s) => s + 100);
        const newCount = recipesCompleted + 1;
        setRecipesCompleted(newCount);

        if (newCount >= totalRecipes) {
          setTimeout(() => {
            setPhase("done");
            const finalScore = 100; // All recipes done
            const xp = 50;
            onComplete(finalScore, xp);
          }, 2500);
        } else {
          // Next recipe
          setTimeout(() => {
            setShowConfetti(false);
            const nextIdx = (recipeIdx + 1) % recipes.length;
            setRecipeIdx(nextIdx);
            setPool(generatePool(recipes[nextIdx]));
            setPot([]);
            setPhase("playing");
          }, 2500);
        }
      }, 500);
    }
  }, [pot, recipe, phase, play, recipesCompleted, recipeIdx, recipes, onComplete]);

  // Remove item from pot (click to remove)
  const handleRemoveFromPot = (item: IngredientSlot, idx: number) => {
    if (phase !== "playing") return;
    play("click");
    setPot((prev) => prev.filter((_, i) => i !== idx));
    setPool((prev) => [...prev, { ...item, id: `${item.id}-back` }]);
  };

  return (
    <ExerciseShell
      title="Cuisine de Lumo"
      icon="🍳"
      currentStep={recipesCompleted}
      totalSteps={totalRecipes}
      streak={recipesCompleted}
      lumoMood={phase === "checking" ? "excited" : "happy"}
      lumoMessage={wrongFeedback || recipe.lumoMsg}
      showConfetti={showConfetti}
      accentColor="amber"
    >
      <ConfettiBlast active={showConfetti} />

      <style>{`
        @keyframes shake-pool {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .shake-pool { animation: shake-pool 0.4s ease-in-out; }

        @keyframes pot-glow {
          0%,100% { box-shadow: 0 0 0 rgba(251,191,36,0); }
          50% { box-shadow: 0 0 30px rgba(251,191,36,0.8); }
        }
        .pot-glow { animation: pot-glow 0.5s ease-out; }

        @keyframes ingredient-drop {
          0% { transform: translateY(-50px) scale(1.3) rotate(-20deg); opacity: 0; }
          100% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
        }
        .drop-anim { animation: ingredient-drop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

        @keyframes float-idle {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .float-idle { animation: float-idle 2s ease-in-out infinite; }

        .draggable {
          cursor: grab;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .draggable:active { cursor: grabbing; }
      `}</style>

      {/* Recipe card */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4 mb-4 border-2 border-amber-200 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-5xl">{recipe.emoji}</div>
          <div className="flex-1">
            <h3 className="font-black text-slate-800 text-lg">{recipe.name}</h3>
            <p className="text-xs text-slate-500 font-semibold">Recette {recipesCompleted + 1}/{totalRecipes}</p>
          </div>
        </div>

        {/* Recipe checklist */}
        <div className="flex flex-wrap gap-2">
          {recipe.needs.map((need) => {
            const have = pot.filter((p) => p.emoji === need.emoji).length;
            const done = have >= need.count;
            return (
              <div
                key={need.ingredient}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all ${
                  done ? "bg-green-100 border-green-400" : "bg-white border-amber-200"
                }`}
              >
                <span className="text-xl">{need.emoji}</span>
                <span className={`text-sm font-black ${done ? "text-green-700 line-through" : "text-slate-700"}`}>
                  {have}/{need.count}
                </span>
                {done && <span className="text-green-500 text-sm">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pot (drop zone) */}
      <div
        ref={potRef}
        className={`bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-full aspect-[3/1.5] mb-4 relative shadow-xl border-4 border-slate-600 flex items-center justify-center overflow-hidden ${potGlow ? "pot-glow" : ""}`}
        style={{ minHeight: "100px" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (dragged) handleDrop(dragged);
          setDragged(null);
        }}
      >
        {/* Pot handles */}
        <div className="absolute left-0 top-1/2 w-4 h-6 bg-slate-700 rounded-l-full -translate-x-2 -translate-y-1/2" />
        <div className="absolute right-0 top-1/2 w-4 h-6 bg-slate-700 rounded-r-full translate-x-2 -translate-y-1/2" />

        {/* Steam effect when cooking */}
        {pot.length > 0 && (
          <>
            <div className="absolute top-0 left-1/4 text-2xl opacity-60 float-idle">💨</div>
            <div className="absolute top-0 left-1/2 text-xl opacity-50 float-idle" style={{ animationDelay: "0.5s" }}>💨</div>
            <div className="absolute top-0 right-1/4 text-2xl opacity-60 float-idle" style={{ animationDelay: "1s" }}>💨</div>
          </>
        )}

        {/* Ingredients in pot */}
        <div className="flex flex-wrap gap-1 justify-center items-center p-4 max-w-full">
          {pot.length === 0 ? (
            <span className="text-slate-400 text-sm font-semibold">↓ Dépose ici ↓</span>
          ) : (
            pot.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => handleRemoveFromPot(item, idx)}
                className="text-3xl hover:scale-110 transition-transform drop-anim active:scale-90"
                aria-label={`Retirer ${item.label}`}
              >
                {item.emoji}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ingredient pool */}
      <div className={`bg-white rounded-2xl p-4 border-2 border-slate-100 shadow-sm ${shakePool ? "shake-pool" : ""}`}>
        <p className="text-xs font-black text-slate-500 uppercase mb-2">🧺 Ingrédients disponibles</p>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
          {pool.map((item) => (
            <button
              key={item.id}
              draggable
              onDragStart={() => setDragged(item)}
              onDragEnd={() => setDragged(null)}
              onClick={() => handleDrop(item)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDrop(item);
              }}
              className="draggable text-3xl p-2 bg-slate-50 hover:bg-amber-100 active:scale-90 rounded-xl transition-all border-2 border-transparent hover:border-amber-300 float-idle"
              style={{ animationDelay: `${Math.random() * 2}s` }}
            >
              {item.emoji}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 font-bold text-center mt-3">
          💡 Touche ou glisse les ingrédients vers la casserole
        </p>
      </div>
    </ExerciseShell>
  );
}
