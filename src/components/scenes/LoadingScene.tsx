import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LOADING_MESSAGES } from "../../config/content";
import { sceneVariants } from "../../animations/variants";

/**
 * A TikTok/Apple-style loader — no progress bar. Concentric glowing rings and
 * morphing orbs breathe while the messages cycle. When the last message has
 * shown, it calls onComplete to trigger the cinematic reveal.
 */
const STEP_MS = 1500;

export function LoadingScene({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= LOADING_MESSAGES.length - 1) {
      const id = window.setTimeout(onComplete, STEP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [index, onComplete]);

  return (
    <motion.section
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-14 bg-black/60 px-6 text-center"
    >
      {/* Morphing orb cluster */}
      <div className="relative h-40 w-40">
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid",
              borderColor: ["#ff9fc4", "#f6c667", "#c9b6ff"][ring],
              filter: "blur(0.4px)",
            }}
            animate={{
              scale: [1 - ring * 0.18, 1.15 - ring * 0.18, 1 - ring * 0.18],
              rotate: ring % 2 ? -360 : 360,
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{
              scale: { duration: 2.2 + ring * 0.4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6 + ring * 2, repeat: Infinity, ease: "linear" },
              opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ))}
        {/* Glowing morphing core */}
        <motion.span
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "radial-gradient(circle,#ffe9b8,#ff9fc4 60%,transparent 75%)",
            boxShadow: "0 0 60px 10px rgba(255,159,196,0.6)",
          }}
          animate={{
            borderRadius: ["42% 58% 63% 37%", "58% 42% 37% 63%", "42% 58% 63% 37%"],
            scale: [1, 1.12, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          transition={{ duration: 0.6 }}
          className="font-body text-glow"
          style={{ fontSize: "var(--step-1)" }}
        >
          {LOADING_MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </motion.section>
  );
}
