'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Protocol, ProtocolItem, ProtocolAnswer } from '@/engine/diagnostic/protocols/types';
import { LumoSphere, type LumoMood } from '../lumo/LumoSphere';
import { useLumoVoice } from '../lumo/useLumoVoice';

/**
 * Joue un protocole de bilan de manière déclarative.
 *
 * Flow :
 *   1. Intro lue par LUMO
 *   2. Boucle sur les items (MCQ, typed, recall-sequence)
 *   3. Envoi des réponses à POST /api/bilans
 *   4. Outro + redirection vers /parent ou /explorateurs
 */
export function ProtocolRunner({
  childId,
  protocol,
}: {
  childId: string;
  protocol: Protocol;
}) {
  const router = useRouter();
  const { mood, speak } = useLumoVoice();
  const [phase, setPhase] = useState<'intro' | 'running' | 'sending' | 'done' | 'error'>('intro');
  const [itemIndex, setItemIndex] = useState(0);
  const [answers, setAnswers] = useState<ProtocolAnswer[]>([]);
  const [itemStartedAt, setItemStartedAt] = useState<number>(Date.now());
  const [typedValue, setTypedValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ band: string; interpretation: string } | null>(null);

  const item = protocol.items[itemIndex];

  // Intro : lit le message puis passe en running
  useEffect(() => {
    if (phase === 'intro') {
      speak(protocol.intro);
      const t = setTimeout(() => {
        setPhase('running');
        setItemStartedAt(Date.now());
      }, 2200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const recordAnswer = (value: string | number) => {
    const answer: ProtocolAnswer = {
      itemId: item.id,
      value,
      durationMs: Date.now() - itemStartedAt,
    };
    setAnswers((prev) => [...prev, answer]);

    if (itemIndex + 1 >= protocol.items.length) {
      sendBilan([...answers, answer]);
    } else {
      setItemIndex((i) => i + 1);
      setItemStartedAt(Date.now());
      setTypedValue('');
    }
  };

  const sendBilan = async (allAnswers: ProtocolAnswer[]) => {
    setPhase('sending');
    try {
      const res = await fetch('/api/bilans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          protocolId: protocol.id,
          answers: allAnswers,
          mode: 'PARENT',
          triggeredBy: 'PARENT_REQUEST',
        }),
      });
      if (!res.ok) throw new Error('bilan_failed');
      const data = await res.json();
      setResult({ band: data.result.band, interpretation: data.result.interpretation });
      speak(protocol.outro);
      setPhase('done');
    } catch {
      setError("Impossible d'enregistrer le bilan. Réessaie plus tard.");
      setPhase('error');
    }
  };

  // Mood selon la phase
  const runnerMood: LumoMood =
    phase === 'intro' ? 'speaking' : phase === 'done' ? 'happy' : phase === 'error' ? 'gentle' : mood;

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(2px_2px_at_20%_30%,white_,transparent_50%),radial-gradient(1px_1px_at_60%_20%,white_,transparent_50%),radial-gradient(2px_2px_at_80%_60%,white_,transparent_50%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          href={`/explorateurs/${childId}/cabinet`}
          className="text-xs uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-300"
        >
          ← Cabinet
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">
          Bilan · {protocol.name}
        </p>
      </header>

      <section className="relative z-10 mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 px-6 text-center">
        <LumoSphere mood={runnerMood} size="lg" />

        {phase === 'intro' && (
          <div className="mt-4 max-w-xl rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 animate-fade-in">
            <p className="text-sm leading-relaxed text-slate-200">{protocol.intro}</p>
          </div>
        )}

        {phase === 'running' && item && (
          <div className="mt-4 w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 animate-fade-in">
            <p className="mb-5 text-xs uppercase tracking-widest text-slate-500">
              Item {itemIndex + 1} / {protocol.items.length}
            </p>
            <h2 className="mb-6 text-xl text-slate-100">{item.prompt}</h2>

            {item.type === 'mcq' && item.choices && (
              <div className="flex flex-col gap-2">
                {item.choices.map((choice, i) => (
                  <button
                    key={`${item.id}-${i}`}
                    type="button"
                    onClick={() => recordAnswer(i)}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-slate-100 transition hover:border-indigo-400 hover:bg-slate-900"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {item.type === 'typed' && (
              <TypedInput
                key={item.id}
                item={item}
                value={typedValue}
                onChange={setTypedValue}
                onSubmit={(v) => recordAnswer(v)}
              />
            )}

            {item.type === 'recall-sequence' && (
              <RecallSequence
                key={item.id}
                item={item}
                onComplete={(answer) => recordAnswer(answer)}
              />
            )}
          </div>
        )}

        {phase === 'sending' && (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-300">LUMO analyse tes réponses…</p>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="mt-4 w-full max-w-xl rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 animate-fade-in">
            <p className="mb-2 text-xs uppercase tracking-widest text-emerald-300">Bilan terminé</p>
            <p className="text-sm leading-relaxed text-slate-200">{protocol.outro}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/explorateurs/${childId}`}
                className="rounded-full bg-indigo-500 px-6 py-2 text-sm font-medium hover:bg-indigo-400"
              >
                Retour à la Station
              </Link>
              <Link
                href="/parent"
                className="text-center text-xs text-slate-500 underline hover:text-slate-300"
              >
                (Parents : voir le rapport)
              </Link>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-4 rounded-full border border-rose-400 px-4 py-2 text-sm hover:bg-rose-500/20"
            >
              Réessayer
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function TypedInput({
  item,
  value,
  onChange,
  onSubmit,
}: {
  item: ProtocolItem;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim().length > 0) onSubmit(value);
      }}
      className="flex flex-col gap-3"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Écris le mot…"
        autoFocus
        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={value.trim().length === 0}
        className="rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
      >
        Valider
      </button>
      {item.hint && <p className="text-xs text-slate-500">Indice : {item.hint}</p>}
    </form>
  );
}

function RecallSequence({
  item,
  onComplete,
}: {
  item: ProtocolItem;
  onComplete: (value: string) => void;
}) {
  const expectedSequence = String(item.correct)
    .split(',')
    .map((s) => Number(s.trim()));
  const [phase, setPhase] = useState<'showing' | 'waiting' | 'done'>('showing');
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<number[]>([]);

  useEffect(() => {
    let i = 0;
    const playNext = () => {
      if (i >= expectedSequence.length) {
        setHighlighted(null);
        setPhase('waiting');
        return;
      }
      setHighlighted(expectedSequence[i]);
      setTimeout(() => {
        setHighlighted(null);
        setTimeout(() => {
          i += 1;
          playNext();
        }, 200);
      }, 500);
    };
    setTimeout(playNext, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (idx: number) => {
    if (phase !== 'waiting') return;
    const newInput = [...userInput, idx];
    setUserInput(newInput);
    if (newInput.length === expectedSequence.length) {
      setPhase('done');
      onComplete(newInput.join(','));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-500">
        {phase === 'showing'
          ? 'Regarde la séquence…'
          : phase === 'waiting'
            ? `Clique dans le même ordre (${userInput.length} / ${expectedSequence.length})`
            : 'Validé'}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            disabled={phase !== 'waiting'}
            className={`h-16 w-16 rounded-xl transition-all ${
              highlighted === i
                ? 'scale-110 bg-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.8)]'
                : 'bg-slate-800 hover:bg-slate-700'
            } disabled:cursor-not-allowed`}
          />
        ))}
      </div>
    </div>
  );
}
