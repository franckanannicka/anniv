import type { Variants } from "framer-motion";

/** A smooth, premium easing curve reused across the app (cubic-bezier). */
export const EASE_LUXE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Full-screen scene cross-fade with a gentle scale. */
export const sceneVariants: Variants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: EASE_LUXE },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.7, ease: EASE_LUXE },
  },
};

/** Stagger container for revealing children (e.g. title letters) in sequence. */
export const staggerContainer = (stagger = 0.05, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** A single item that rises softly into place with a glow-in feel. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_LUXE },
  },
};

/** Per-letter reveal used by the animated title. */
export const letterReveal: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: -90, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_LUXE },
  },
};
