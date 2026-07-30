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
 */
export function AnimatedTitle({ text, className = "" }: AnimatedTitleProps) {
  const words = text.split(" ");

  return (
    <motion.h1
      variants={staggerContainer(0.045, 0.15)}
      initial="hidden"
      animate="visible"
      aria-label={text}
      className={`gradient-title text-glow flex flex-wrap justify-center gap-x-[0.28em] font-display font-bold leading-tight ${className}`}
      style={{ fontSize: "var(--step-3)", perspective: 800 }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex whitespace-nowrap" aria-hidden="true">
          {Array.from(word).map((char, ci) => (
            <motion.span
              key={ci}
              variants={letterReveal}
              className="inline-block"
              style={{ transformStyle: "preserve-3d" }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
}
