"use client";

interface Quest {
  id: string;
  title: string;
  description: string;
  exerciseType: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  reward: { stars?: number; xp?: number };
}

interface QuestCardProps {
  quest: Quest;
}

const TYPE_EMOJIS: Record<string, string> = {
  reading: "📖", math: "🔢", emotional: "💜", memory: "🧠",
  social: "🤝", creativity: "🎨", physical: "🏃", any: "⚡",
};

export default function QuestCard({ quest }: QuestCardProps) {
  const progress = Math.min((quest.progress / quest.targetCount) * 100, 100);

  return (
    <div className={`rounded-2xl p-4 shadow-md transition-all ${quest.completed ? "bg-green-50 border-2 border-green-300" : "bg-white border border-gray-100"}`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{TYPE_EMOJIS[quest.exerciseType] || "📜"}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm">{quest.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{quest.description}</p>
          <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${quest.completed ? "bg-green-400" : "bg-elevo-purple"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] text-gray-400">{quest.progress}/{quest.targetCount}</span>
            <div className="flex gap-2 text-xs">
              {quest.reward.stars && <span>⭐ +{quest.reward.stars}</span>}
              {quest.reward.xp && <span className="text-elevo-purple">+{quest.reward.xp} XP</span>}
            </div>
          </div>
        </div>
        {quest.completed && <span className="text-2xl">✅</span>}
      </div>
    </div>
  );
}
