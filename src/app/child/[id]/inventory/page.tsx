"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ITEM_RARITIES } from "@/lib/gamification";

interface InventoryItem {
  id: string;
  itemId: string;
  equippedAt: string | null;
  acquiredAt: string;
  item: { id: string; name: string; type: string; description: string; rarity: string };
}

export default function InventoryPage() {
  const params = useParams();
  const childId = params.id as string;
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = () => {
    fetch(`/api/shop?childId=${childId}&inventory=true`)
      .then((r) => r.json())
      .then((d) => { setInventory(d.inventory || []); setLoading(false); });
  };

  useEffect(() => { loadInventory(); }, [childId]);

  const handleEquip = async (itemId: string, isEquipped: boolean) => {
    await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, itemId, action: isEquipped ? "unequip" : "equip" }),
    });
    loadInventory();
  };

  const equipped = inventory.filter((i) => i.equippedAt);
  const unequipped = inventory.filter((i) => !i.equippedAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg">
        <Link href={`/child/${childId}`} className="text-white/70 text-sm">← Carte</Link>
        <h1 className="text-2xl font-black mt-2">🎒 Sac à Dos</h1>
        <p className="text-white/80 text-sm mt-1">{inventory.length} objet(s)</p>
      </div>
      <div className="px-4 mt-6 max-w-md mx-auto space-y-6">
        {equipped.length > 0 && (
          <div>
            <h2 className="font-black text-gray-800 mb-3">⚔️ Équipé</h2>
            <div className="space-y-2">
              {equipped.map((inv) => {
                const rarity = ITEM_RARITIES[inv.item.rarity as keyof typeof ITEM_RARITIES] || ITEM_RARITIES.common;
                return (
                  <div key={inv.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border-2" style={{ borderColor: rarity.color }}>
                    <span className="text-2xl">{inv.item.type === "avatar_skin" ? "👤" : inv.item.type === "lumo_skin" ? "✨" : inv.item.type === "frame" ? "🖼️" : inv.item.type === "title" ? "🏷️" : "💫"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{inv.item.name}</p>
                      <p className="text-xs" style={{ color: rarity.color }}>{rarity.label}</p>
                    </div>
                    <button onClick={() => handleEquip(inv.itemId, true)} className="text-xs text-red-500 font-bold">Retirer</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <h2 className="font-black text-gray-800 mb-3">📦 Inventaire</h2>
          {loading ? (
            <p className="text-gray-400 animate-pulse">Chargement...</p>
          ) : unequipped.length === 0 && equipped.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">🎒</p>
              <p className="text-gray-500">Ton sac est vide ! Visite la boutique.</p>
              <Link href={`/child/${childId}/shop`} className="text-elevo-purple font-bold text-sm mt-2 inline-block">Aller à la boutique →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {unequipped.map((inv) => {
                const rarity = ITEM_RARITIES[inv.item.rarity as keyof typeof ITEM_RARITIES] || ITEM_RARITIES.common;
                return (
                  <div key={inv.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100">
                    <span className="text-2xl">{inv.item.type === "avatar_skin" ? "👤" : inv.item.type === "lumo_skin" ? "✨" : inv.item.type === "frame" ? "🖼️" : inv.item.type === "title" ? "🏷️" : "💫"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{inv.item.name}</p>
                      <p className="text-xs" style={{ color: rarity.color }}>{rarity.label}</p>
                    </div>
                    <button onClick={() => handleEquip(inv.itemId, false)} className="text-xs bg-elevo-purple text-white px-3 py-1 rounded-full font-bold">Équiper</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
