import { NextRequest, NextResponse } from "next/server";

// TTS Route — ElevenLabs si clé dispo, sinon Google TTS (officieux mais naturel)
export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: "Texte requis" }, { status: 400 });

  const cleaned = text
    .replace(/[✨🌟⭐💫🎯❓✅❌🔥🏆🎮📊]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000); // limite pour éviter des requêtes trop longues

  // Essai ElevenLabs si clé configurée
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
  if (ELEVEN_KEY) {
    try {
      // Voix "Charlotte" (fr-FR, très naturelle et chaleureuse)
      // Voice IDs ElevenLabs gratuits : Charlotte = XB0fDUnXU5powFXDhCwa
      const voiceId = process.env.ELEVENLABS_VOICE_ID || "XB0fDUnXU5powFXDhCwa";
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleaned,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      });
      if (res.ok) {
        const audio = await res.arrayBuffer();
        return new NextResponse(audio, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
        });
      }
    } catch {
      // fall through to Google TTS
    }
  }

  // Fallback : Google TTS via translate (qualité naturelle, gratuit)
  // Diviser en segments de 200 chars max
  const segments = splitText(cleaned, 180);
  const audioChunks: ArrayBuffer[] = [];

  for (const seg of segments) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(seg)}&tl=fr&client=tw-ob&ttsspeed=0.87`;
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (r.ok) {
        audioChunks.push(await r.arrayBuffer());
      }
    } catch {
      continue;
    }
  }

  if (audioChunks.length === 0) {
    return NextResponse.json({ error: "TTS indisponible" }, { status: 503 });
  }

  // Concaténer les segments MP3
  const total = audioChunks.reduce((s, c) => s + c.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of audioChunks) {
    merged.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }

  return new NextResponse(merged.buffer, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}

function splitText(text: string, maxLen: number): string[] {
  // Découper par phrases complètes
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}
