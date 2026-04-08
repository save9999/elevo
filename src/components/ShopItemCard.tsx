"use client";
import { ITEM_RARITIES, CURRENCIES } from "@/lib/gamification";

interface ShopItem {
  id: string;
  name: string;
  type: string;
  description: string;
  cost: number;
  currency: string;
  rarity: string;
}

interface ShopItemCardProps {
  item: ShopItem;
  owned: boolean;
  canAfford: boolean;
  onBuy: (itemId: string) => void;
}

export default function ShopItemCard({ item, owned, canAfford, onBuy }: ShopItemCardProps) {
  const rarity = ITEM_RARITIES[item.rarity as keyof typeof ITEM_RARITIES] || ITEM_RARITIES.common;
  const currencyInfo = CURRENCIES[item.currency as keyof typeof CURRENCIES] || CURRENCIES.stars;

  return (
    <div className="rounded-2xl border-2 p-3 transition-all hover:scale-105" style={{ borderColor: rarity.color + "40" }}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: rarity.color + "20", color: rarity.color }}>
          {rarity.label}
        </span>
        {owned && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">Possédé</span>}
      </div>
      <div className="w-full h-20 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
        <span className="text-4xl">{item.type === "avatar_skin" ? "👤" : item.type === "lumo_skin" ? "✨" : item.type === "frame" ? "🖼️" : item.type === "title" ? "🏷️" : "💫"}</span>
      </div>
      <h3 className="font-bold text-sm text-gray-800 truncate">{item.name}</h3>
      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
      {owned ? (
        <div className="mt-2 text-center text-xs text-green-600 font-bold">✅ Dans ton sac</div>
      ) : (
        <button
          onClick={() => onBuy(item.id)}
          disabled={!canAfford}
          className={`mt-2 w-full py-1.5 rounded-xl text-sm font-bold transition-all ${
            canAfford ? "bg-elevo-purple text-white hover:bg-elevo-violet active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {currencyInfo.emoji} {item.cost}
        </button>
      )}
    </div>
  );
}
