import { useCallback, useEffect, useRef, useState } from "react";

const FULL_VOLUME = 0.55;
const DUCKED_VOLUME = 0.12;
const FADE_STEP = 0.04;
const FADE_INTERVAL_MS = 40;

/**
 * Background-music controller.
 *
 * - Tries to autoplay; browsers usually block audio with sound, so we also
 *   expose `unlock()` which the first user gesture (the intro button) calls.
 * - `toggle()` powers the 🎵 ON/OFF button.
 * - `duck()` smoothly lowers the volume while the video plays, `restore()`
 *   fades it back — so the two audio sources never fight.
 */
export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Create the audio element once.
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = FULL_VOLUME;
    // "metadata", not "auto": the track weighs several MB and downloading it
    // eagerly starved the first paint on mobile data. The browser streams it
    // as soon as play() is called, which is all we need.
    audio.preload = "metadata";
    audioRef.current = audio;

    const onCanPlay = () => setIsReady(true);
    audio.addEventListener("loadedmetadata", onCanPlay);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onCanPlay);
      audio.removeEventListener("canplay", onCanPlay);
      audio.pause();
      audioRef.current = null;
      if (fadeRef.current) window.clearInterval(fadeRef.current);
    };
  }, [src]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    try {
      await audio.play();
      setIsPlaying(true);
      return true;
    } catch {
      // Autoplay blocked — will start on the next user gesture.
      setIsPlaying(false);
      return false;
    }
  }, []);

  /**
   * Aggressive autostart. Try to play immediately; if the browser blocks
   * autoplay (Chrome Android, Safari iOS…), start the music on the very first
   * interaction of any kind — tap, click, key, scroll or pointer move — without
   * needing a dedicated button. Listeners remove themselves once it starts.
   */
  useEffect(() => {
    let started = false;
    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "touchstart",
      "keydown",
      "click",
      "scroll",
      "mousemove",
      "wheel",
    ];
    const cleanup = () =>
      events.forEach((e) => window.removeEventListener(e, onFirst));
    const onFirst = () => {
      if (started) return;
      const audio = audioRef.current;
      if (!audio) return;
      audio
        .play()
        .then(() => {
          started = true;
          setIsPlaying(true);
          cleanup();
        })
        .catch(() => {
          /* still blocked — wait for the next interaction */
        });
    };

    // Attempt straight away (works where the browser allows it)…
    onFirst();
    // …otherwise catch the first real interaction.
    events.forEach((e) => window.addEventListener(e, onFirst, { passive: true }));
    return cleanup;
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  /** Called by the first real user interaction to satisfy autoplay policies. */
  const unlock = useCallback(() => {
    if (!isPlaying) void play();
  }, [isPlaying, play]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else void play();
  }, [isPlaying, pause, play]);

  /** Smoothly fade the volume toward a target. */
  const fadeTo = useCallback((target: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) window.clearInterval(fadeRef.current);
    fadeRef.current = window.setInterval(() => {
      const current = audio.volume;
      const delta = target - current;
      if (Math.abs(delta) <= FADE_STEP) {
        audio.volume = target;
        if (fadeRef.current) window.clearInterval(fadeRef.current);
        fadeRef.current = null;
        return;
      }
      audio.volume = current + Math.sign(delta) * FADE_STEP;
    }, FADE_INTERVAL_MS);
  }, []);

  const duck = useCallback(() => fadeTo(DUCKED_VOLUME), [fadeTo]);
  const restore = useCallback(() => fadeTo(FULL_VOLUME), [fadeTo]);
  /** A gentle lift for the finale. */
  const intensify = useCallback(() => fadeTo(0.8), [fadeTo]);

  return { isPlaying, isReady, play, pause, unlock, toggle, duck, restore, intensify };
}

export type AudioController = ReturnType<typeof useAudio>;
