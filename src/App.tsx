import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NightSky } from "./components/background/NightSky";
import { FloatingElements } from "./components/background/FloatingElements";
import { PointerFX } from "./components/background/PointerFX";
import { MusicToggle } from "./components/ui/MusicToggle";
import { IntroScene } from "./components/scenes/IntroScene";
import { LoadingScene } from "./components/scenes/LoadingScene";
import { ExperienceScene } from "./components/scenes/ExperienceScene";
import { useAudio } from "./hooks/useAudio";
import { cannons, fireworks, popConfetti } from "./animations/celebrations";
import { MEDIA } from "./config/content";

type Scene = "intro" | "loading" | "experience";

export default function App() {
  const audio = useAudio(MEDIA.music);
  const [scene, setScene] = useState<Scene>("intro");
  const [flashKey, setFlashKey] = useState(0);

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
      <AnimatePresence mode="wait">
        {scene === "intro" && <IntroScene key="intro" onEnter={handleEnter} />}
        {scene === "loading" && <LoadingScene key="loading" onComplete={handleLoaded} />}
        {scene === "experience" && (
          <ExperienceScene key="experience" audio={audio} onReplay={handleReplay} />
        )}
      </AnimatePresence>

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
