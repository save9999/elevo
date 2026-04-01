import { NextRequest, NextResponse } from "next/server";

// Voix OpenAI par tranche d'âge
const VOICE_MAP: Record<string, string> = {
  maternelle:    "nova",   // chaleureuse, douce — idéale pour les petits
  primaire:      "fable",  // expressive, narrative — parfaite pour les histoires
  "college-lycee": "alloy", // neutre, claire — voix adolescente
};

// Vitesse de parole par tranche d'âge
const SPEED_MAP: Record<string, number> = {
  maternelle:    0.82,
  primaire:      0.92,
  "college-lycee": 1.0,
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY manquant" }, { status: 503 });
  }

  const { text, ageGroup } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Texte vide" }, { status: 400 });
  }

  // Tronquer à 4096 chars (limite OpenAI TTS)
  const input = text.slice(0, 4096);
  const voice = VOICE_MAP[ageGroup] ?? "nova";
  const speed = SPEED_MAP[ageGroup] ?? 0.9;

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",   // HD = meilleure qualité naturelle
      input,
      voice,
      speed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenAI TTS error:", err);
    return NextResponse.json({ error: "Erreur TTS" }, { status: 500 });
  }

  const audioBuffer = await response.arrayBuffer();

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength.toString(),
      "Cache-Control": "public, max-age=3600", // cache 1h pour mêmes phrases
    },
  });
}
