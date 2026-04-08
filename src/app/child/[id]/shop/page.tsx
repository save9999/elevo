"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ShopItemCard from "@/components/ShopItemCard";

interface ShopItem {
  id: string;
  name: string;
  type: string;
  description: string;
  cost: number;
  currency: string;
  rarity: string;
}

const TABS = [
  { id: "all", label: "Tout", emoji: "🛍️" },
  { id: "avatar_skin", label: "Avatar", emoji: "👤" },
  { id: "lumo_skin", label: "Lumo", emoji: "✨" },
  { id: "frame", label: "Cadres", emoji: "🖼️" },
  { id: "title", label: "Titres", emoji: "🏷️" },
  { id: "effect", label: "Effets", emoji: "💫" },
];

export default function ShopPage() {
  const params = useParams();
  const childId = params.id as string;
  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [currency, setCurrency] = useState({ stars: 0, crystals: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([
      fetch(`/api/shop?childId=${childId}`).then((r) => r.json()),
      fetch(`/api/progress?childId=${childId}`).then((r) => r.json()),
    ]).then(([shopData, progressData]) => {
      setItems(shopData.items || []);
      setOwned(shopData.owned || []);
      if (progressData.currency) setCurrency(progressData.currency);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [childId]);

  const handleBuy = async (itemId: string) => {
    const res = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, itemId, action: "buy" }),
    });
    if (res.ok) loadData();
    else {
      const err = await res.json();
      alert(err.error || "Erreur d'achat");
    }
  };

  const filtered = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      <div className="bg-gradient-to-r from-elevo-purple to-elevo-violet text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">🛍️ Boutique</h1>
        <div className="flex gap-4 mt-3 text-lg font-bold">
          <span>⭐ {currency.stars}</span>
          <span>💎 {currency.crystals}</span>
        </div>
      </div>
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === tab.id ? "bg-elevo-purple text-white" : "bg-white text-gray-600 border"
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>
      <div className="px-4 mt-4 max-w-md mx-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-10 animate-pulse">Chargement...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                owned={owned.includes(item.id)}
                canAfford={item.currency === "crystals" ? currency.crystals >= item.cost : currency.stars >= item.cost}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
