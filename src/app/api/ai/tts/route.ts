import { NextRequest, NextResponse } from "next/server";

// ── ElevenLabs — voix les plus naturelles (si clé dispo) ─────────────────────
const ELEVEN_VOICES: Record<string, string> = {
  maternelle:      "EXAVITQu4vr4xnSDxMaL",
  primaire:        "21m00Tcm4TlvDq8ikWAM",
  "college-lycee": "pNInz6obpgDQGcFmaJgB",
};

// ── OpenAI TTS (si clé dispo) ─────────────────────────────────────────────────
const OPENAI_VOICES: Record<string, string> = {
  maternelle:      "nova",
  primaire:        "fable",
  "college-lycee": "alloy",
};
const OPENAI_SPEED: Record<string, number> = {
  maternelle: 0.82, primaire: 0.92, "college-lycee": 1.0,
};

// ── Découpe un texte en phrases ≤ N caractères ────────────────────────────────
function splitSentences(text: string, maxLen = 180): string[] {
  const chunks: string[] = [];
  // Sépare sur . ! ? ou sur les virgules si la phrase est trop longue
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    if (sentence.length <= maxLen) {
      if (sentence.trim()) chunks.push(sentence.trim());
    } else {
      // Découpe sur virgule/point-virgule
      const sub = sentence.split(/[,;]\s*/);
      let current = "";
      for (const part of sub) {
        if ((current + part).length > maxLen && current) {
          chunks.push(current.trim());
          current = part + ", ";
        } else {
          current += part + ", ";
        }
      }
      if (current.trim()) chunks.push(current.trim().replace(/,\s*$/, ""));
    }
  }
  return chunks.filter(Boolean);
}

// ── Google Translate TTS — HTTP, gratuit, sans clé ───────────────────────────
async function googleTTS(text: string): Promise<ArrayBuffer | null> {
  const sentences = splitSentences(text, 180);
  const buffers: ArrayBuffer[] = [];

  for (const sentence of sentences) {
    const url =
      `https://translate.google.com/translate_tts?ie=UTF-8` +
      `&q=${encodeURIComponent(sentence)}&tl=fr&client=tw-ob`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      buffers.push(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  if (!buffers.length) return null;

  // Concatène les frames MP3
  const total = buffers.reduce((acc, b) => acc + b.byteLength, 0);
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    combined.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return combined.buffer;
}

export async function POST(req: NextRequest) {
  const { text, ageGroup } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Texte vide" }, { status: 400 });

  const cleaned = text
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/[✦★☆•→←↑↓]/g, "")
    .trim()
    .slice(0, 4096);

  if (!cleaned) return NextResponse.json({ error: "Texte vide" }, { status: 400 });

  // ── 1. ElevenLabs ────────────────────────────────────────────────────────────
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (elevenKey) {
    const voiceId = ELEVEN_VOICES[ageGroup] ?? ELEVEN_VOICES.primaire;
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
          method: "POST",
          headers: { "xi-api-key": elevenKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({
            text: cleaned,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.30, use_speaker_boost: true },
          }),
          signal: AbortSignal.timeout(8000),
        }
      );
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", "X-Voice-Engine": "elevenlabs" },
        });
      }
    } catch { /* fallback */ }
  }

  // ── 2. OpenAI TTS ────────────────────────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const voice = OPENAI_VOICES[ageGroup] ?? "nova";
    const speed = OPENAI_SPEED[ageGroup] ?? 0.9;
    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tts-1-hd", input: cleaned, voice, speed, response_format: "mp3" }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", "X-Voice-Engine": "openai" },
        });
      }
    } catch { /* fallback */ }
  }

  // ── 3. Google Translate TTS — gratuit, sans clé ──────────────────────────────
  try {
    const buf = await googleTTS(cleaned.slice(0, 1000));
    if (buf && buf.byteLength > 500) {
      return new NextResponse(buf, {
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", "X-Voice-Engine": "google-translate" },
      });
    }
  } catch { /* fallback navigateur */ }

  return NextResponse.json({ error: "TTS indisponible" }, { status: 503 });
}
