"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export type RoomId = "chambre" | "bureau" | "atelier" | "jardin" | "salon" | "cour" | "grenier" | "classe" | "labo" | "maison";

// ── Vraie musique royalty-free (MP3 via URL ou fichier local) ────────────
// Priorité:
// 1. Fichier local /public/music/{roomId}.mp3 (que l'utilisateur peut déposer)
// 2. Fallback CDN public (Internet Archive / Free Music Archive) — CC0 / CC-BY
// 3. Silence si rien ne charge (vaut mieux que la musique procédurale pourrie)
//
// Pour ajouter ta propre musique: dépose un fichier MP3 dans /public/music/
// avec le nom de la pièce (ex: /public/music/chambre.mp3) et il sera chargé
// automatiquement.

// Pas d'URL externe: le CORS bloque la plupart des CDN publics (FreePD, etc.)
// La seule solution fiable = fichiers locaux dans /public/music/
// Si aucun fichier n'est présent, l'app reste silencieuse (mieux que du bruit)

const LOCAL_TRACKS: Record<RoomId, string> = {
  maison: "/music/maison.mp3",
  chambre: "/music/chambre.mp3",
  bureau: "/music/bureau.mp3",
  atelier: "/music/atelier.mp3",
  jardin: "/music/jardin.mp3",
  salon: "/music/salon.mp3",
  cour: "/music/cour.mp3",
  grenier: "/music/grenier.mp3",
  classe: "/music/classe.mp3",
  labo: "/music/labo.mp3",
};

async function sourceExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export function useRoomMusic(roomId: RoomId, enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSource, setHasSource] = useState(false);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startMusic = useCallback(async () => {
    if (isPlaying) return;

    // Only try local file
    const localUrl = LOCAL_TRACKS[roomId];
    if (!(await sourceExists(localUrl))) {
      // No file present — stay silent (no more CORS / 404 errors in console)
      setHasSource(false);
      return;
    }

    try {
      const audio = new Audio(localUrl);
      audio.loop = true;
      audio.volume = 0.4;

      audio.addEventListener("canplay", () => setHasSource(true));
      audio.addEventListener("error", () => setHasSource(false));

      await audio.play().catch(() => {
        // Autoplay blocked — that's fine, user will press play
      });
      audioRef.current = audio;
      setIsPlaying(true);
    } catch {
      // Silent fallback
    }
  }, [roomId, isPlaying]);

  // Auto stop on room change or disable
  useEffect(() => {
    if (!enabled) {
      stopMusic();
    }
    return () => stopMusic();
  }, [enabled, stopMusic, roomId]);

  return { isPlaying, startMusic, stopMusic, hasSource };
}
