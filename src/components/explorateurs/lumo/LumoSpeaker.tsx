'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { LumoSphere, type LumoSize } from './LumoSphere';
import { useLumoVoice } from './useLumoVoice';

/**
 * Composant flottant de LUMO qui parle.
 *
 * Si `autoPlay` est vrai, la phrase est lue au mount (après un geste
 * utilisateur requis par les navigateurs pour l'autoplay audio — voir note).
 *
 * Pour contourner la politique autoplay, on affiche un bouton "Parler à LUMO"
 * qui déclenche la parole au premier clic, puis disparaît.
 */
export function LumoSpeaker({
  text,
  size = 'md',
  className,
  autoPlay = true,
}: {
  text: string;
  size?: LumoSize;
  className?: string;
  autoPlay?: boolean;
}) {
  const { mood, speak, stop } = useLumoVoice();
  const [hasSpoken, setHasSpoken] = useState(false);

  // Autoplay : la plupart des navigateurs ne permettent pas speechSynthesis
  // au premier paint sans geste utilisateur. On tente quand même (certains
  // navigateurs l'autorisent) mais on garde un bouton de secours.
  useEffect(() => {
    if (autoPlay && !hasSpoken) {
      speak(text).then(() => setHasSpoken(true));
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const handleClick = async () => {
    if (!hasSpoken) {
      await speak(text);
      setHasSpoken(true);
    } else {
      await speak(text);
    }
  };

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleClick}
        className="group flex flex-col items-center gap-2 rounded-2xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Parler à LUMO"
      >
        <LumoSphere mood={mood} size={size} />
      </button>
      {mood === 'speaking' && (
        <p className="max-w-xs text-center text-xs text-indigo-300 animate-fade-in">
          LUMO parle…
        </p>
      )}
      {!hasSpoken && mood === 'idle' && (
        <p className="max-w-xs text-center text-xs text-slate-400">
          Clique sur LUMO pour l&apos;écouter
        </p>
      )}
    </div>
  );
}
