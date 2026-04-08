import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  const type = req.nextUrl.searchParams.get("type");
  const inventory = req.nextUrl.searchParams.get("inventory");

  // If inventory=true, return child's inventory with item details
  if (inventory === "true" && childId) {
    const items = await prisma.childInventory.findMany({
      where: { childId },
      include: { item: true },
      orderBy: { acquiredAt: "desc" },
    });
    return NextResponse.json({ inventory: items });
  }

  const items = await prisma.shopItem.findMany({
    where: type ? { type } : undefined,
    orderBy: [{ rarity: "asc" }, { cost: "asc" }],
  });

  let owned: string[] = [];
  if (childId) {
    const inv = await prisma.childInventory.findMany({ where: { childId }, select: { itemId: true } });
    owned = inv.map((i) => i.itemId);
  }

  return NextResponse.json({ items, owned });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { childId, itemId, action } = await req.json();

  if (action === "buy") {
    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item introuvé" }, { status: 404 });

    const existing = await prisma.childInventory.findUnique({ where: { childId_itemId: { childId, itemId } } });
    if (existing) return NextResponse.json({ error: "Déjà possédé" }, { status: 400 });

    const currency = await prisma.childCurrency.findUnique({ where: { childId } });
    if (!currency) return NextResponse.json({ error: "Pas de portefeuille" }, { status: 400 });

    const balance = item.currency === "crystals" ? currency.crystals : currency.stars;
    if (balance < item.cost) return NextResponse.json({ error: "Pas assez de fonds" }, { status: 400 });

    await prisma.$transaction([
      prisma.childCurrency.update({
        where: { childId },
        data: item.currency === "crystals" ? { crystals: { decrement: item.cost } } : { stars: { decrement: item.cost } },
      }),
      prisma.childInventory.create({ data: { childId, itemId } }),
    ]);

    return NextResponse.json({ success: true, item: item.name });
  }

  if (action === "equip") {
    const inv = await prisma.childInventory.findUnique({ where: { childId_itemId: { childId, itemId } } });
    if (!inv) return NextResponse.json({ error: "Item non possédé" }, { status: 400 });

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item introuvé" }, { status: 404 });

    await prisma.childInventory.updateMany({
      where: { childId, item: { type: item.type }, equippedAt: { not: null } },
      data: { equippedAt: null },
    });

    await prisma.childInventory.update({
      where: { childId_itemId: { childId, itemId } },
      data: { equippedAt: new Date() },
    });

    return NextResponse.json({ success: true, equipped: item.name });
  }

  if (action === "unequip") {
    await prisma.childInventory.update({
      where: { childId_itemId: { childId, itemId } },
      data: { equippedAt: null },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
