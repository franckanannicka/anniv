import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronDown, RotateCcw } from "lucide-react";
import { AnimatedTitle } from "../ui/AnimatedTitle";
import { VideoCard } from "../ui/VideoCard";
import { QuoteCard } from "../ui/QuoteCard";
import { RunawayButton } from "../ui/RunawayButton";
import { FINALE, PERSON, TITLE } from "../../config/content";
import { fireworks, heartRain } from "../../animations/celebrations";
import { riseIn } from "../../animations/variants";
import type { AudioController } from "../../hooks/useAudio";

/**
 * The heart of the card.
 *
 * The hero opens like a premium landing page: the grand title on top, then a
 * two-column panel — the video (glowing, glassmorphic) on the left and the
 * complete message on the right — both visible at once, no scrolling needed.
 * Scrolling on reveals the impossible 10 000 FCFA button, then the finale,
 * which erupts in hearts and fireworks as it enters view. "Revoir la surprise"
 * restarts everything.
 */
export function ExperienceScene({
  audio,
  onReplay,
}: {
  audio: AudioController;
  onReplay: () => void;
}) {
  const finaleRef = useRef<HTMLDivElement | null>(null);
  const finaleInView = useInView(finaleRef, { amount: 0.5, once: true });
  const firedRef = useRef(false);

  // Finale celebration when it scrolls into view.
  useEffect(() => {
    if (!finaleInView || firedRef.current) return;
    firedRef.current = true;
    audio.intensify();
    const stopHearts = heartRain(6000);
    const stopFw = fireworks(4500);
    return () => {
      stopHearts();
      stopFw();
    };
  }, [finaleInView, audio]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10 flex w-full flex-col items-center"
    >
      {/* ==================== HERO: title + video ==================== */}
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-start gap-7 px-4 pb-10 pt-20 sm:gap-8 sm:px-6 sm:pt-16 lg:justify-center lg:pt-14">
        {/* Title */}
        <div className="flex flex-col items-center text-center">
          <motion.span
            className="mb-2 text-3xl sm:text-4xl"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: [0, 1.25, 1] }}
            transition={{ duration: 0.7 }}
          >
            🎉
          </motion.span>
          <AnimatedTitle text={TITLE} />
          <motion.span
            className="mt-4 text-2xl sm:text-3xl"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: [0, 1.3, 1] }}
            transition={{ delay: 1.5, duration: 0.7 }}
          >
            ❤️
          </motion.span>
        </div>

        {/* The video — the first thing the eye lands on */}
        <VideoCard audio={audio} />

        {/* Scroll cue */}
        <motion.div
          className="flex flex-col items-center gap-1 text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
        >
          <span className="font-body" style={{ fontSize: "var(--step--1)" }}>
            Fais défiler
          </span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6 text-rose-pastel" />
          </motion.span>
        </motion.div>
      </div>

      {/* ==================== Citation (on scroll) ==================== */}
      <div className="flex w-full justify-center px-4 py-20 sm:px-6 sm:py-24">
        <QuoteCard />
      </div>

      {/* ======================= Impossible button ======================= */}
      <div className="w-full px-4 py-20 sm:px-6 sm:py-24">
        <RunawayButton />
      </div>

      {/* ============================ Finale ============================ */}
      <div
        ref={finaleRef}
        className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 py-20 text-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />

        <motion.p
          variants={riseIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="text-glow relative z-10 font-script"
          style={{ fontSize: "var(--step-2)" }}
        >
          ❤️ {FINALE.thanks} ❤️
        </motion.p>

        <motion.p
          variants={riseIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-8 max-w-xl font-body leading-relaxed text-white/95"
          style={{ fontSize: "var(--step-0)" }}
        >
          {FINALE.wish}
        </motion.p>

        <motion.button
          type="button"
          onClick={onReplay}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="glass relative z-10 mt-12 flex items-center gap-2 rounded-full px-8 py-4 font-body font-medium text-white shadow-glow"
          style={{ fontSize: "var(--step-0)" }}
        >
          <RotateCcw className="h-5 w-5 text-rose-pastel" />
          <span className="text-glow">✨ {FINALE.replay} ✨</span>
        </motion.button>

        <p
          className="relative z-10 mt-16 font-script text-white/50"
          style={{ fontSize: "var(--step-1)" }}
        >
          {PERSON.signature}
        </p>
      </div>
    </motion.section>
  );
}
