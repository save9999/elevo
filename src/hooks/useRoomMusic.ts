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

// URLs publiques CC0 hot-linkables depuis freepd.com (domaine public)
// https://freepd.com — Musique libre de droits par Kevin MacLeod
const EXTERNAL_TRACKS: Record<RoomId, string> = {
  // Accueil chaleureux et familier
  maison: "https://freepd.com/music/Happy%20Bee.mp3",
  // Berceuse douce pour la chambre
  chambre: "https://freepd.com/music/Life%20Full%20of%20Wonder.mp3",
  // Rythmé, focus pour le bureau
  bureau: "https://freepd.com/music/The%20Path.mp3",
  // Créatif pour l'atelier
  atelier: "https://freepd.com/music/Fluffing%20a%20Duck.mp3",
  // Nature pour le jardin
  jardin: "https://freepd.com/music/Deliberate%20Thought.mp3",
  // Cosy pour le salon
  salon: "https://freepd.com/music/Peaceful%20Mind.mp3",
  // Joyeux rythmé pour la cour
  cour: "https://freepd.com/music/Monkeys%20Spinning%20Monkeys.mp3",
  // Mystérieux pour le grenier
  grenier: "https://freepd.com/music/Investigations.mp3",
  // Classique pour la classe
  classe: "https://freepd.com/music/Sincerely.mp3",
  // Intrigant sci-fi pour le labo
  labo: "https://freepd.com/music/Bit%20Shift.mp3",
};

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

    // Try local file first
    const localUrl = LOCAL_TRACKS[roomId];
    let source = "";
    if (await sourceExists(localUrl)) {
      source = localUrl;
    } else {
      // Try external CDN
      source = EXTERNAL_TRACKS[roomId];
    }

    try {
      const audio = new Audio(source);
      audio.loop = true;
      audio.volume = 0.4;
      audio.crossOrigin = "anonymous";

      audio.addEventListener("canplay", () => setHasSource(true));
      audio.addEventListener("error", () => {
        setHasSource(false);
        // Silence is better than bad audio
        console.info(`[Music] No audio available for room "${roomId}". Drop a file at ${localUrl} to enable.`);
      });

      await audio.play().catch((err) => {
        console.info(`[Music] Autoplay blocked or source unavailable: ${err.message}`);
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
