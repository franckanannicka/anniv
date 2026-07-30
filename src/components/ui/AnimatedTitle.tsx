import { motion } from "framer-motion";
import { letterReveal, staggerContainer } from "../../animations/variants";

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

/**
 * Reveals a title one letter at a time with a soft 3D flip and glow.
 * Words never break across lines (spaces keep whole words together), so the
 * title wraps cleanly on narrow phones without orphan letters.
 *
 * Why each letter carries its own solid colour instead of a CSS gradient:
 * `background-clip: text` + `-webkit-text-fill-color: transparent` only paints
 * glyphs that live in the *same* paint layer as the element carrying the
 * background. Each letter here is animated (3D flip), so Chrome — Android in
 * particular — promotes it to its own compositing layer: the gradient can no
 * longer reach it and the letters render fully transparent, i.e. invisible.
 * Sampling the very same palette per letter gives the identical multicolour
 * look with a real, opaque `color` that every browser can draw.
 */

/** The title palette — light, high-contrast tints that read on a dark sky. */
const TITLE_STOPS = [
  "#ffd6e8", // rose pastel
  "#ffe9b8", // gold light
  "#ff9fc4", // rose soft
  "#c9b6ff", // violet pastel
  "#ffb3d1", // rose, kept light enough to stay legible
] as const;

const hexToRgb = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/** Colour at position `t` (0..1) along the palette. */
function sampleGradient(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const span = clamped * (TITLE_STOPS.length - 1);
  const i = Math.min(TITLE_STOPS.length - 2, Math.floor(span));
  const f = span - i;
  const a = hexToRgb(TITLE_STOPS[i]);
  const b = hexToRgb(TITLE_STOPS[i + 1]);
  const mix = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${mix[0]},${mix[1]},${mix[2]})`;
}

export function AnimatedTitle({ text, className = "" }: AnimatedTitleProps) {
  const words = text.split(" ");
  const totalLetters = Math.max(1, text.replace(/\s/g, "").length - 1);
  let letterIndex = 0;

  return (
    <motion.h1
      variants={staggerContainer(0.045, 0.15)}
      initial="hidden"
      animate="visible"
      aria-label={text}
      className={`title-legible flex flex-wrap justify-center gap-x-[0.28em] font-display font-bold leading-tight ${className}`}
      style={{ fontSize: "var(--step-3)", perspective: 800 }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex whitespace-nowrap" aria-hidden="true">
          {Array.from(word).map((char, ci) => {
            const color = sampleGradient(letterIndex / totalLetters);
            letterIndex += 1;
            return (
              <motion.span
                key={ci}
                variants={letterReveal}
                className="inline-block"
                style={{ color, transformStyle: "preserve-3d" }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </motion.h1>
  );
}
