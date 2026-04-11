import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

/**
 * POST /api/tts
 * Body: { text: string, voice?: 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer' }
 *
 * Retourne un audio/mpeg généré par OpenAI TTS. Fallback : 503 si pas de clé.
 *
 * Cache en mémoire (Map) par hash SHA-256 du couple (voice, text).
 * Coût OpenAI TTS : ~$0.015 / 1000 chars → une phrase type "Bienvenue à bord, Léa" = 28 chars
 * = ~$0.0004 par appel, et chaque phrase est réutilisée après cache.
 */

export const runtime = 'nodejs';
export const maxDuration = 15;

// Cache mémoire (persisté tant que le lambda vit)
const cache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 200;

interface TTSRequest {
  text?: string;
  voice?: 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
}

export async function POST(req: Request) {
  let body: TTSRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const text = body.text?.trim();
  const voice = body.voice ?? 'nova';

  if (!text || text.length === 0) {
    return NextResponse.json({ error: 'missing_text' }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: 'text_too_long' }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    // Pas de clé → 503, le client sait qu'il doit fallback sur Web Speech.
    return NextResponse.json({ error: 'no_openai_key' }, { status: 503 });
  }

  // Cache lookup
  const cacheKey = createHash('sha256').update(`${voice}:${text}`).digest('hex');
  const cached = cache.get(cacheKey);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Cache': 'HIT',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // Appel OpenAI
  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        input: text,
        speed: 1.0,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[tts] OpenAI error', res.status, errBody);
      return NextResponse.json(
        { error: 'openai_failed', detail: errBody.slice(0, 200) },
        { status: 502 },
      );
    }

    const audio = Buffer.from(await res.arrayBuffer());

    // Store in cache (LRU: drop oldest if full)
    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(cacheKey, audio);

    return new Response(new Uint8Array(audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[tts] unexpected error', err);
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
