"use client";
import { useState } from "react";

export interface AvatarConfig {
  characterType: "lumo" | "hero" | "animal" | "robot" | "fairy";
  skinTone: string;
  hairColor: string;
  clothingColor: string;
  accessory: string;
  theme: string; // favorite universe (paw-patrol, minecraft, frozen, etc.)
  favoriteColor: string;
  characterName: string;
}

interface AvatarWizardProps {
  childName: string;
  childId: string;
  onComplete: (config: AvatarConfig) => void;
  onSkip?: () => void;
}

const CARTOON_THEMES = [
  { id: "paw-patrol", label: "Pat'Patrouille", emoji: "🐾" },
  { id: "minecraft", label: "Minecraft", emoji: "⛏️" },
  { id: "pokemon", label: "Pokémon", emoji: "⚡" },
  { id: "frozen", label: "La Reine des Neiges", emoji: "❄️" },
  { id: "spiderman", label: "Spider-Man", emoji: "🕷️" },
  { id: "naruto", label: "Naruto", emoji: "🍥" },
  { id: "encanto", label: "Encanto", emoji: "🦋" },
  { id: "mario", label: "Mario", emoji: "🍄" },
  { id: "dragon-ball", label: "Dragon Ball", emoji: "🔮" },
  { id: "nature", label: "La nature", emoji: "🌿" },
  { id: "space", label: "L'espace", emoji: "🚀" },
  { id: "animals", label: "Les animaux", emoji: "🦁" },
];

const ACTIVITIES = [
  { id: "sport", label: "Le sport", emoji: "⚽" },
  { id: "drawing", label: "Dessiner", emoji: "🎨" },
  { id: "music", label: "La musique", emoji: "🎵" },
  { id: "gaming", label: "Les jeux vidéo", emoji: "🎮" },
  { id: "reading", label: "Lire des livres", emoji: "📚" },
  { id: "cooking", label: "Cuisiner", emoji: "🍕" },
  { id: "dancing", label: "Danser", emoji: "💃" },
  { id: "science", label: "Les sciences", emoji: "🔬" },
];

const COLORS = [
  { id: "purple", label: "Violet", hex: "#8B5CF6" },
  { id: "blue", label: "Bleu", hex: "#3B82F6" },
  { id: "red", label: "Rouge", hex: "#EF4444" },
  { id: "green", label: "Vert", hex: "#10B981" },
  { id: "orange", label: "Orange", hex: "#F97316" },
  { id: "pink", label: "Rose", hex: "#EC4899" },
  { id: "yellow", label: "Jaune", hex: "#F59E0B" },
  { id: "teal", label: "Turquoise", hex: "#14B8A6" },
];

const CHARACTER_TYPES = [
  { id: "lumo" as const, label: "Lumo", emoji: "🧡", desc: "Ton ami fidèle" },
  { id: "hero" as const, label: "Super-héros", emoji: "🦸", desc: "Fort et courageux" },
  { id: "animal" as const, label: "Animal magique", emoji: "🦊", desc: "Rusé et sympa" },
  { id: "robot" as const, label: "Robot futuriste", emoji: "🤖", desc: "Intelligent et drôle" },
  { id: "fairy" as const, label: "Fée / Sorcier", emoji: "🧚", desc: "Plein de magie" },
];

type Step = "welcome" | "character" | "cartoon" | "activity" | "color" | "name" | "preview";

export default function AvatarWizard({ childName, childId, onComplete, onSkip }: AvatarWizardProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [config, setConfig] = useState<Partial<AvatarConfig>>({
    characterType: "lumo",
    favoriteColor: "purple",
    theme: "animals",
    accessory: "none",
    characterName: "",
  });
  const [saving, setSaving] = useState(false);

  // Génère un nom de personnage basé sur les préférences
  function suggestName() {
    const names: Record<string, string[]> = {
      "paw-patrol": ["Rocky", "Chase", "Stella"],
      minecraft: ["Steve", "Alex", "Creeper"],
      pokemon: ["Pikachu", "Bulbi", "Salamèche"],
      frozen: ["Elsa", "Anna", "Olaf"],
      spiderman: ["Miles", "Peter", "Gwen"],
      naruto: ["Naruto", "Sasuke", "Sakura"],
      nature: ["Forêt", "Soleil", "Terre"],
      space: ["Nova", "Cosmos", "Étoile"],
      animals: ["Renard", "Lynx", "Panda"],
      mario: ["Mario", "Luigi", "Yoshi"],
      encanto: ["Luisa", "Mirabel", "Isabela"],
      "dragon-ball": ["Goku", "Vegeta", "Broly"],
    };
    const themeNames = names[config.theme || "animals"] || ["Lumo", "Étoile", "Nova"];
    return themeNames[Math.floor(Math.random() * themeNames.length)];
  }

  async function handleFinish(finalConfig: AvatarConfig) {
    setSaving(true);
    try {
      await fetch(`/api/children/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarConfig: JSON.stringify(finalConfig) }),
      });
    } catch {
      // Continue even if save fails
    }
    setSaving(false);
    onComplete(finalConfig);
  }

  const selectedColor = COLORS.find((c) => c.id === config.favoriteColor) || COLORS[0];
  const selectedChar = CHARACTER_TYPES.find((c) => c.id === config.characterType) || CHARACTER_TYPES[0];
  const selectedTheme = CARTOON_THEMES.find((t) => t.id === config.theme) || CARTOON_THEMES[11];

  // STEP: WELCOME
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-8xl mb-6 animate-bounce">🎨</div>
          <h1 className="text-3xl font-black text-white mb-3">
            Créons ton compagnon, {childName} !
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Réponds à quelques questions et on va créer un personnage rien que pour toi !
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setStep("character")}
              className="w-full bg-white text-purple-700 font-black py-5 rounded-3xl text-xl hover:scale-105 transition-transform shadow-xl"
            >
              Allons-y ! 🚀
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full text-white/60 text-sm py-2 hover:text-white/80 transition-colors"
              >
                Passer pour l&apos;instant
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // STEP: CHARACTER TYPE
  if (step === "character") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm font-bold mb-1">Question 1/5</p>
            <div className="h-2 bg-white/20 rounded-full mb-4">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: "20%" }} />
            </div>
            <h2 className="text-2xl font-black text-white">
              Quel type de compagnon veux-tu ?
            </h2>
          </div>
          <div className="space-y-3">
            {CHARACTER_TYPES.map((char) => (
              <button
                key={char.id}
                onClick={() => {
                  setConfig({ ...config, characterType: char.id });
                  setStep("cartoon");
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${
                  config.characterType === char.id
                    ? "bg-white shadow-xl scale-105"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                <span className="text-4xl">{char.emoji}</span>
                <div className="text-left">
                  <p className={`font-black text-lg ${config.characterType === char.id ? "text-blue-700" : "text-white"}`}>
                    {char.label}
                  </p>
                  <p className={`text-sm ${config.characterType === char.id ? "text-blue-500" : "text-white/70"}`}>
                    {char.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP: CARTOON / UNIVERSE
  if (step === "cartoon") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm font-bold mb-1">Question 2/5</p>
            <div className="h-2 bg-white/20 rounded-full mb-4">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: "40%" }} />
            </div>
            <h2 className="text-2xl font-black text-white">
              Ton univers préféré ?
            </h2>
            <p className="text-white/70 text-sm mt-1">Dessin animé, jeu, film…</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CARTOON_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setConfig({ ...config, theme: theme.id });
                  setStep("activity");
                }}
                className={`flex flex-col items-center p-4 rounded-3xl transition-all ${
                  config.theme === theme.id
                    ? "bg-white shadow-xl scale-105"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                <span className="text-3xl mb-1">{theme.emoji}</span>
                <span className={`text-xs font-bold text-center leading-tight ${
                  config.theme === theme.id ? "text-amber-700" : "text-white"
                }`}>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP: ACTIVITY
  if (step === "activity") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm font-bold mb-1">Question 3/5</p>
            <div className="h-2 bg-white/20 rounded-full mb-4">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: "60%" }} />
            </div>
            <h2 className="text-2xl font-black text-white">
              Ton activité préférée ?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ACTIVITIES.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  setConfig({ ...config, accessory: act.id });
                  setStep("color");
                }}
                className={`flex items-center gap-3 p-4 rounded-3xl transition-all ${
                  config.accessory === act.id
                    ? "bg-white shadow-xl scale-105"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                <span className="text-3xl">{act.emoji}</span>
                <span className={`font-bold text-sm ${
                  config.accessory === act.id ? "text-emerald-700" : "text-white"
                }`}>{act.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP: FAVORITE COLOR
  if (step === "color") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm font-bold mb-1">Question 4/5</p>
            <div className="h-2 bg-white/20 rounded-full mb-4">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: "80%" }} />
            </div>
            <h2 className="text-2xl font-black text-white">
              Ta couleur magique préférée ?
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  setConfig({ ...config, favoriteColor: color.id });
                  const suggested = suggestName();
                  setConfig((prev) => ({ ...prev, favoriteColor: color.id, characterName: suggested }));
                  setStep("name");
                }}
                className={`flex flex-col items-center p-3 rounded-3xl transition-all ${
                  config.favoriteColor === color.id ? "bg-white shadow-xl scale-110" : "bg-white/20 hover:bg-white/30"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full shadow-inner mb-1"
                  style={{ backgroundColor: color.hex }}
                />
                <span className={`text-xs font-bold ${
                  config.favoriteColor === color.id ? "text-pink-700" : "text-white"
                }`}>{color.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP: NAME YOUR CHARACTER
  if (step === "name") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <p className="text-white/80 text-sm font-bold mb-1">Question 5/5</p>
            <div className="h-2 bg-white/20 rounded-full mb-4">
              <div className="h-full bg-white rounded-full" style={{ width: "100%" }} />
            </div>
            <h2 className="text-2xl font-black text-white">
              Donne un nom à ton compagnon !
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {selectedChar.emoji} {selectedChar.label} · {selectedTheme.emoji} {selectedTheme.label}
            </p>
          </div>
          <div className="bg-white/10 rounded-3xl p-6 space-y-4">
            <input
              type="text"
              value={config.characterName || ""}
              onChange={(e) => setConfig({ ...config, characterName: e.target.value })}
              placeholder="Écris un prénom…"
              maxLength={20}
              className="w-full bg-white rounded-2xl px-5 py-4 text-xl font-black text-indigo-700 placeholder-indigo-200 focus:outline-none shadow-lg"
              autoFocus
            />
            <button
              onClick={() => setConfig({ ...config, characterName: suggestName() })}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-2xl transition-all text-sm"
            >
              🎲 Générer un nom aléatoire
            </button>
            <button
              disabled={!config.characterName?.trim() || saving}
              onClick={() => setStep("preview")}
              className="w-full bg-white text-indigo-700 font-black py-5 rounded-3xl text-xl hover:scale-105 transition-transform shadow-xl disabled:opacity-50"
            >
              Voir mon personnage ! ✨
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP: PREVIEW
  const finalConfig: AvatarConfig = {
    characterType: (config.characterType || "lumo") as AvatarConfig["characterType"],
    favoriteColor: config.favoriteColor || "purple",
    theme: config.theme || "animals",
    accessory: config.accessory || "none",
    skinTone: "#FBBF24",
    hairColor: selectedColor.hex,
    clothingColor: selectedColor.hex,
    characterName: config.characterName || "Lumo",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: `linear-gradient(135deg, ${selectedColor.hex}aa, ${selectedColor.hex}44)` }}
    >
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl">
          {/* Big character emoji */}
          <div
            className="w-40 h-40 rounded-[3rem] mx-auto mb-6 flex items-center justify-center text-8xl shadow-xl"
            style={{ backgroundColor: selectedColor.hex + "22", border: `4px solid ${selectedColor.hex}` }}
          >
            {selectedChar.emoji}
          </div>

          <h2 className="text-3xl font-black mb-1" style={{ color: selectedColor.hex }}>
            {finalConfig.characterName}
          </h2>
          <p className="text-slate-500 text-sm mb-2">{childName}&apos;s best friend ✨</p>

          {/* Config summary */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedChar.emoji}</span>
              <div>
                <p className="text-xs text-slate-400 font-bold">Type</p>
                <p className="font-bold text-slate-700">{selectedChar.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedTheme.emoji}</span>
              <div>
                <p className="text-xs text-slate-400 font-bold">Univers</p>
                <p className="font-bold text-slate-700">{selectedTheme.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
              <div>
                <p className="text-xs text-slate-400 font-bold">Couleur magique</p>
                <p className="font-bold text-slate-700">{selectedColor.label}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleFinish(finalConfig)}
            disabled={saving}
            className="w-full font-black py-5 rounded-3xl text-xl text-white hover:scale-105 transition-transform shadow-xl disabled:opacity-70"
            style={{ backgroundColor: selectedColor.hex }}
          >
            {saving ? "Sauvegarde…" : `${finalConfig.characterName} est prêt(e) ! 🎉`}
          </button>

          <button
            onClick={() => setStep("character")}
            className="mt-3 text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            ← Recommencer
          </button>
        </div>
      </div>
    </div>
  );
}
