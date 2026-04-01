import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// ── Microsoft Edge TTS — voix neurales gratuites ──────────────────────────────
const EDGE_VOICES: Record<string, string> = {
  maternelle:      "fr-FR-EloiseNeural",   // douce, enfantine, chaleureuse
  primaire:        "fr-FR-DeniseNeural",   // claire, expressive
  "college-lycee": "fr-FR-HenriNeural",   // naturelle, légèrement grave
};
const EDGE_RATE: Record<string, string> = {
  maternelle:      "-15%",
  primaire:        "-8%",
  "college-lycee": "+0%",
};

// ── ElevenLabs — voix les plus naturelles disponibles ────────────────────────
const ELEVEN_VOICES: Record<string, string> = {
  maternelle:      "EXAVITQu4vr4xnSDxMaL",
  primaire:        "21m00Tcm4TlvDq8ikWAM",
  "college-lycee": "pNInz6obpgDQGcFmaJgB",
};

// ── OpenAI TTS — troisième choix ──────────────────────────────────────────────
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

  const cleaned = text
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/[✦★☆•→←↑↓]/g, "")
    .trim()
    .slice(0, 4096);

  if (!cleaned) return NextResponse.json({ error: "Texte vide" }, { status: 400 });

  // ── 1. ElevenLabs (si clé présente) ─────────────────────────────────────────
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
            voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.30, use_speaker_boost: true },
          }),
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

  // ── 2. OpenAI TTS (si clé présente) ─────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const voice = OPENAI_VOICES[ageGroup] ?? "nova";
    const speed = OPENAI_SPEED[ageGroup] ?? 0.9;
    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tts-1-hd", input: cleaned, voice, speed, response_format: "mp3" }),
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", "X-Voice-Engine": "openai" },
        });
      }
    } catch { /* fallback */ }
  }

  // ── 3. Microsoft Edge TTS — gratuit, voix neurales ───────────────────────────
  try {
    const tts = new MsEdgeTTS();
    const voice = EDGE_VOICES[ageGroup] ?? EDGE_VOICES.primaire;
    const rate  = EDGE_RATE[ageGroup]  ?? "+0%";

    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const safeText = cleaned.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR">
      <voice name="${voice}">
        <prosody rate="${rate}" pitch="+0Hz">${safeText}</prosody>
      </voice>
    </speak>`;

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const { audioStream } = tts.toStream(ssml);
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", resolve);
      audioStream.on("error", reject);
      setTimeout(() => reject(new Error("timeout")), 10000);
    });

    const buf = Buffer.concat(chunks);
    if (buf.length > 1000) {
      return new NextResponse(buf, {
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", "X-Voice-Engine": "edge-tts" },
      });
    }
  } catch { /* fallback navigateur */ }

  return NextResponse.json({ error: "TTS indisponible" }, { status: 503 });
}
