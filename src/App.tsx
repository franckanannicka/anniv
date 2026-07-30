import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NightSky } from "./components/background/NightSky";
import { FloatingElements } from "./components/background/FloatingElements";
import { PointerFX } from "./components/background/PointerFX";
import { MusicToggle } from "./components/ui/MusicToggle";
import { IntroScene } from "./components/scenes/IntroScene";
import { useAudio } from "./hooks/useAudio";
import { cannons, fireworks, popConfetti, warmConfetti } from "./animations/celebrations";
import { onIdle } from "./utils/idle";
import { MEDIA } from "./config/content";

// Only the intro is needed for the first paint. The loader and the (heavy)
// experience — video card, typewriter, runaway button — are fetched during
// idle time while she is still looking at the intro, so the transition stays
// instant while the initial bundle stays small.
const LoadingScene = lazy(() =>
  import("./components/scenes/LoadingScene").then((m) => ({ default: m.LoadingScene })),
);
const ExperienceScene = lazy(() =>
  import("./components/scenes/ExperienceScene").then((m) => ({
    default: m.ExperienceScene,
  })),
);

type Scene = "intro" | "loading" | "experience";

export default function App() {
  const audio = useAudio(MEDIA.music);
  const [scene, setScene] = useState<Scene>("intro");
  const [flashKey, setFlashKey] = useState(0);

  // Warm everything the next beats will need, without delaying the first paint.
  useEffect(
    () =>
      onIdle(() => {
        warmConfetti();
        void import("./components/scenes/LoadingScene");
        void import("./components/scenes/ExperienceScene");
      }),
    [],
  );

  /** Fire a quick white flash (remount by bumping the key). */
  const flash = useCallback(() => setFlashKey((k) => k + 1), []);

  // Intro → Loading: the button "explodes", confetti bursts, screen flashes.
  const handleEnter = useCallback(() => {
    audio.unlock(); // first user gesture — start the music
    popConfetti(0.5, 0.55, 160);
    cannons();
    flash();
    window.setTimeout(() => setScene("loading"), 350);
  }, [audio, flash]);

  // Loading → Experience: the cinematic reveal.
  const handleLoaded = useCallback(() => {
    cannons();
    fireworks(2600);
    flash();
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      setScene("experience");
    }, 250);
  }, [flash]);

  // Restart the whole experience.
  const handleReplay = useCallback(() => {
    flash();
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      setScene("intro");
    }, 250);
  }, [flash]);

  return (
    <div className="app-shell">
      {/* Persistent living background */}
      <NightSky />
      <FloatingElements />
      <PointerFX />

      {/* Music control (always available) */}
      <MusicToggle audio={audio} />

      {/* Scene switcher */}
      <Suspense fallback={<div className="min-h-[100dvh] w-full" />}>
        <AnimatePresence mode="wait">
          {scene === "intro" && <IntroScene key="intro" onEnter={handleEnter} />}
          {scene === "loading" && <LoadingScene key="loading" onComplete={handleLoaded} />}
          {scene === "experience" && (
            <ExperienceScene key="experience" audio={audio} onReplay={handleReplay} />
          )}
        </AnimatePresence>
      </Suspense>

      {/* White flash overlay for cinematic transitions */}
      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={flashKey}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[90] bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
