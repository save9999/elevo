import { NextRequest, NextResponse } from "next/server";

// ── ElevenLabs — voix les plus naturelles disponibles ────────────────────────
// Voix multilingues qui excellent en français
const ELEVEN_VOICES: Record<string, string> = {
  maternelle:      "EXAVITQu4vr4xnSDxMaL", // Sarah — douce, chaleureuse, parfaite pour enfants
  primaire:        "21m00Tcm4TlvDq8ikWAM",  // Rachel — claire, expressive, narrative
  "college-lycee": "pNInz6obpgDQGcFmaJgB",  // Adam — naturelle, légèrement grave, ado
};

// ── OpenAI TTS — second choix ─────────────────────────────────────────────────
const OPENAI_VOICES: Record<string, string> = {
  maternelle:      "nova",
  primaire:        "fable",
  "college-lycee": "alloy",
};
const OPENAI_SPEED: Record<string, number> = {
  maternelle:      0.82,
  primaire:        0.92,
  "college-lycee": 1.0,
};

export async function POST(req: NextRequest) {
  const { text, ageGroup } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Texte vide" }, { status: 400 });

  // Nettoyer emojis et caractères spéciaux
  const cleaned = text
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/[✦★☆•→←↑↓]/g, "")
    .trim()
    .slice(0, 4096);

  // ── Tentative ElevenLabs ─────────────────────────────────────────────────
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (elevenKey) {
    const voiceId = ELEVEN_VOICES[ageGroup] ?? ELEVEN_VOICES.primaire;
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: cleaned,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.80,
              style: 0.30,
              use_speaker_boost: true,
            },
          }),
        }
      );
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
            "X-Voice-Engine": "elevenlabs",
          },
        });
      }
    } catch { /* fallback */ }
  }

  // ── Tentative OpenAI TTS ─────────────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const voice = OPENAI_VOICES[ageGroup] ?? "nova";
    const speed = OPENAI_SPEED[ageGroup] ?? 0.9;
    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "tts-1-hd", input: cleaned, voice, speed, response_format: "mp3" }),
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
            "X-Voice-Engine": "openai",
          },
        });
      }
    } catch { /* fallback */ }
  }

  // Aucune clé API configurée
  return NextResponse.json({ error: "Aucune clé TTS configurée" }, { status: 503 });
}
