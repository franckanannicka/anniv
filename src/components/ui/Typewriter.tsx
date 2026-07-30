import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface TypewriterProps {
  text: string;
  /** ms per character */
  speed?: number;
  /** starts typing only when true (so it can wait for its reveal) */
  start?: boolean;
  className?: string;
  onDone?: () => void;
}

/**
 * Types text out one character at a time with a soft blinking caret.
 * Under prefers-reduced-motion the full text is shown immediately.
 */
export function Typewriter({
  text,
  speed = 32,
  start = true,
  className = "",
  onDone,
}: TypewriterProps) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!start) return;

    if (reduced) {
      setCount(text.length);
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        window.clearInterval(id);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      }
    }, speed);

    return () => window.clearInterval(id);
  }, [text, speed, start, reduced, onDone]);

  const done = count >= text.length;

  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {!done && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block w-[2px] animate-pulse bg-rose-pastel align-middle"
          style={{ height: "1em" }}
        />
      )}
    </p>
  );
}
