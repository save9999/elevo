import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const runtime = 'nodejs';
export const maxDuration = 15;

const cache = new Map<string, Buffer>();
const MAX_CACHE = 200;
const EDGE_VOICE = 'fr-FR-VivienneMultilingualNeural';

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text || text.length === 0 || text.length > 500) {
    return NextResponse.json({ error: 'invalid_text' }, { status: 400 });
  }

  const cacheKey = createHash('sha256').update(text).digest('hex');
  const cached = cache.get(cacheKey);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: { 'Content-Type': 'audio/mpeg', 'X-Cache': 'HIT' },
    });
  }

  // Edge TTS (gratuit, voix Vivienne — même que Contes Magiques)
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(EDGE_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const result = tts.toStream(text);
    const audioStream = result.audioStream ?? result;
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = audioStream as NodeJS.ReadableStream;
      stream.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      stream.on('end', () => resolve());
      stream.on('error', (e: Error) => reject(e));
      setTimeout(() => reject(new Error('timeout')), 12000);
    });

    const audio = Buffer.concat(chunks);
    if (audio.length > 100) {
      if (cache.size >= MAX_CACHE) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }
      cache.set(cacheKey, audio);
      return new Response(new Uint8Array(audio), {
        headers: { 'Content-Type': 'audio/mpeg', 'X-Cache': 'MISS', 'X-Provider': 'edge-tts' },
      });
    }
  } catch (err) {
    console.warn('[tts] Edge TTS failed:', (err as Error).message);
  }

  // Fallback OpenAI si clé dispo
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'tts-1', voice: 'nova', input: text }),
      });
      if (res.ok) {
        const audio = Buffer.from(await res.arrayBuffer());
        if (cache.size >= MAX_CACHE) {
          const oldest = cache.keys().next().value;
          if (oldest) cache.delete(oldest);
        }
        cache.set(cacheKey, audio);
        return new Response(new Uint8Array(audio), {
          headers: { 'Content-Type': 'audio/mpeg', 'X-Cache': 'MISS', 'X-Provider': 'openai' },
        });
      }
    } catch {
      // silencieux
    }
  }

  return NextResponse.json({ error: 'tts_unavailable' }, { status: 503 });
}
