import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useIsTouch } from "../../hooks/useIsTouch";
import { rand } from "../../utils/random";

/**
 * Pointer-driven micro-magic:
 *  - Desktop: the cursor leaves a trail of tiny sparkling stars.
 *  - Touch:   each tap spawns a little heart that floats up and fades.
 *
 * Particles auto-remove when their animation ends, so the array never grows
 * unbounded (no memory leak). Throttled on desktop to protect frame budget.
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  hue: string;
  scale: number;
}

const STAR_COLORS = ["#ffd6e8", "#ffe9b8", "#c9b6ff", "#ff9fc4"];
const MAX_PARTICLES = 40;
const THROTTLE_MS = 45;

export function PointerFX() {
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);
  const lastRef = useRef(0);

  const remove = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const spawn = useCallback((x: number, y: number) => {
    setParticles((prev) => {
      const next: Particle = {
        id: idRef.current++,
        x,
        y,
        hue: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        scale: rand(0.6, 1.2),
      };
      const trimmed =
        prev.length >= MAX_PARTICLES ? prev.slice(prev.length - MAX_PARTICLES + 1) : prev;
      return [...trimmed, next];
    });
  }, []);

  useEffect(() => {
    if (reduced) return;

    if (isTouch) {
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0] ?? e.changedTouches[0];
        if (t) spawn(t.clientX, t.clientY);
      };
      window.addEventListener("touchstart", onTouch, { passive: true });
      return () => window.removeEventListener("touchstart", onTouch);
    }

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastRef.current < THROTTLE_MS) return;
      lastRef.current = now;
      spawn(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [isTouch, reduced, spawn]);

  if (reduced) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <AnimatePresence>
        {particles.map((p) =>
          isTouch ? (
            // Touch: floating heart
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0.4, x: p.x - 12, y: p.y - 12 }}
              animate={{ opacity: 0, scale: p.scale + 0.6, y: p.y - 90 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              onAnimationComplete={() => remove(p.id)}
              className="absolute text-2xl"
              style={{ left: 0, top: 0 }}
            >
              {"\ud83d\udc96"}
            </motion.span>
          ) : (
            // Desktop: sparkling star
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: p.scale, x: p.x - 6, y: p.y - 6 }}
              animate={{ opacity: 0, scale: 0, rotate: 90 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onAnimationComplete={() => remove(p.id)}
              className="absolute"
              style={{
                left: 0,
                top: 0,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: p.hue,
                boxShadow: `0 0 10px 2px ${p.hue}`,
              }}
            />
          ),
        )}
      </AnimatePresence>
    </div>
  );
}
