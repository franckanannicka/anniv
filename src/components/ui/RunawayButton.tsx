import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import { PRANK } from "../../config/content";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { rand, randInt } from "../../utils/random";

/**
 * The 10 000 FCFA "deposit" button — impossible to click, and very nervous.
 *
 * Cycle (repeats forever):
 *   1. It rests exactly at the centre of its playground.
 *   2. The instant a cursor or finger gets close, it bolts away almost
 *      instantly (~55 ms) to the farthest safe spot.
 *   3. After a very short pause (~0.1 s) it snaps back to the centre (~0.16 s).
 *   4. Ready immediately — it can even re-dodge mid-flight.
 *
 * Touch-first (Android/iOS): there is no hover, so the very first event is a
 * `touchstart` right on the target. Three things make it untouchable anyway:
 *   • `pointer-events: none` — a tap or click can never land on it, ever.
 *   • a large detection radius, so it is already gone before contact matters.
 *   • proximity is measured on the button's *live* rect, so it keeps dodging
 *     even while it is animating.
 * It never leaves its playground, so it always stays fully on screen.
 */

// px — how close a pointer may get before it bolts. Generous on touch: a
// fingertip is ~40-50 px wide and lands without any warning.
const FLEE_RADIUS_BASE = 170;
const EDGE_PAD = 6; // px kept from the playground edges, so it is never clipped
const FLEE_DURATION = 0.055; // s — near-instant escape
const RETURN_DURATION = 0.16; // s — snappy comeback
const PAUSE_MIN = 90; // ms before heading back to the centre
const PAUSE_MAX = 170;
const COOLDOWN = 45; // ms — min gap between two target picks (avoids thrashing)
const POINTER_MEMORY = 1200; // ms — how long a pointer position stays "active"

const PHASES = { IDLE: "idle", FLEE: "flee", RETURN: "return" } as const;
type Phase = (typeof PHASES)[keyof typeof PHASES];

const COLORS = [
  "linear-gradient(135deg,#ff9fc4,#ff5f9e)",
  "linear-gradient(135deg,#f6c667,#e7b7a3)",
  "linear-gradient(135deg,#c9b6ff,#a78bfa)",
  "linear-gradient(135deg,#ff5f9e,#c9b6ff)",
];

export function RunawayButton() {
  const reduced = useReducedMotion();
  const playgroundRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState<Phase>(PHASES.IDLE);
  const [colorIdx, setColorIdx] = useState(0);

  const lastFleeAt = useRef(0);
  const pointerRef = useRef<{ x: number; y: number; at: number } | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const bounds = useCallback(() => {
    const pg = playgroundRef.current;
    const btn = btnRef.current;
    if (!pg || !btn) return null;
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    // The travel box is inset by EDGE_PAD, so the button always stays whole.
    const maxX = Math.max(0, pg.clientWidth - bw - EDGE_PAD * 2);
    const maxY = Math.max(0, pg.clientHeight - bh - EDGE_PAD * 2);
    return {
      pg,
      minX: EDGE_PAD,
      minY: EDGE_PAD,
      maxX: maxX + EDGE_PAD,
      maxY: maxY + EDGE_PAD,
      bw,
      bh,
      // A finger needs more room than a cursor, and a small playground needs
      // a proportionally smaller radius to stay playable.
      radius: Math.max(
        110,
        Math.min(FLEE_RADIUS_BASE, Math.min(pg.clientWidth, pg.clientHeight) * 0.55),
      ),
    };
  }, []);

  const centerPos = useCallback(() => {
    const b = bounds();
    if (!b) return { x: 0, y: 0 };
    return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
  }, [bounds]);

  const recenter = useCallback(() => {
    clearTimers();
    setPhase(PHASES.IDLE);
    setPos(centerPos());
  }, [centerPos, clearTimers]);

  useEffect(() => {
    recenter();
    window.addEventListener("resize", recenter);
    const t = timers;
    return () => {
      window.removeEventListener("resize", recenter);
      t.current.forEach(clearTimeout);
    };
  }, [recenter]);

  /** Farthest-from-the-pointer safe spot, always inside the padded box. */
  const pickTarget = useCallback(
    (b: NonNullable<ReturnType<typeof bounds>>, px: number, py: number) => {
      const candidates: Array<{ x: number; y: number }> = [
        { x: b.minX, y: b.minY },
        { x: b.maxX, y: b.minY },
        { x: b.minX, y: b.maxY },
        { x: b.maxX, y: b.maxY },
      ];
      for (let i = 0; i < 12; i++) {
        candidates.push({ x: rand(b.minX, b.maxX), y: rand(b.minY, b.maxY) });
      }
      const scored = candidates
        .map((c) => ({
          ...c,
          d: Math.hypot(c.x + b.bw / 2 - px, c.y + b.bh / 2 - py),
        }))
        .sort((a, z) => z.d - a.d);
      // Only among the very farthest ones, so it never lands under the finger.
      const t = scored[randInt(0, Math.min(2, scored.length - 1))];
      return {
        x: Math.min(b.maxX, Math.max(b.minX, t.x)),
        y: Math.min(b.maxY, Math.max(b.minY, t.y)),
      };
    },
    [],
  );

  /**
   * Heads back to the centre after `delay` ms — unless a finger is still parked
   * there, in which case it dodges once more and tries again shortly after.
   */
  const scheduleReturnRef = useRef<(delay: number) => void>(() => {});
  const scheduleReturn = useCallback(
    (delay: number) => {
      const t = window.setTimeout(() => {
        const b = bounds();
        if (!b) return;
        const home = centerPos();
        const p = pointerRef.current;
        const blocked =
          p !== null &&
          performance.now() - p.at < POINTER_MEMORY &&
          Math.hypot(home.x + b.bw / 2 - p.x, home.y + b.bh / 2 - p.y) < b.radius;

        if (blocked && p) {
          lastFleeAt.current = performance.now();
          setPhase(PHASES.FLEE);
          setPos(pickTarget(b, p.x, p.y));
          scheduleReturnRef.current(rand(PAUSE_MIN, PAUSE_MAX));
          return;
        }

        setPhase(PHASES.RETURN);
        setPos(home);
        const done = window.setTimeout(
          () => setPhase(PHASES.IDLE),
          RETURN_DURATION * 1000,
        );
        timers.current.push(done);
      }, delay);
      timers.current.push(t);
    },
    [bounds, centerPos, pickTarget],
  );
  scheduleReturnRef.current = scheduleReturn;

  // Escape → very short pause → snap back. Interruptible at any moment.
  const maybeFlee = useCallback(
    (clientX: number, clientY: number) => {
      const b = bounds();
      const btn = btnRef.current;
      if (!b || !btn) return;
      const rect = b.pg.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      pointerRef.current = { x: px, y: py, at: performance.now() };

      // Ignore pointers outside the playground (plus one radius of margin).
      if (
        px < -b.radius ||
        py < -b.radius ||
        px > rect.width + b.radius ||
        py > rect.height + b.radius
      )
        return;

      // Measure against the *live* rect: it dodges even mid-animation.
      const live = btn.getBoundingClientRect();
      const cx = live.left + live.width / 2 - rect.left;
      const cy = live.top + live.height / 2 - rect.top;
      if (Math.hypot(cx - px, cy - py) > b.radius) return;

      const now = performance.now();
      if (now - lastFleeAt.current < COOLDOWN) return;
      lastFleeAt.current = now;

      clearTimers();
      setColorIdx((c) => (c + 1) % COLORS.length);
      setPhase(PHASES.FLEE);
      setPos(pickTarget(b, px, py));

      scheduleReturn(rand(PAUSE_MIN, PAUSE_MAX));
    },
    [bounds, clearTimers, pickTarget, scheduleReturn],
  );

  // Global listeners so it reacts to any cursor or finger, hover or not.
  useEffect(() => {
    const onPointer = (e: PointerEvent) => maybeFlee(e.clientX, e.clientY);
    const onMouse = (e: MouseEvent) => maybeFlee(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0] ?? e.changedTouches[0];
      if (t) maybeFlee(t.clientX, t.clientY);
    };
    // `capture: true` fires before anything can swallow the event — on Android
    // the very first `touchstart` already makes it run.
    const opts = { passive: true, capture: true } as const;
    window.addEventListener("pointermove", onPointer, opts);
    window.addEventListener("pointerdown", onPointer, opts);
    window.addEventListener("pointerover", onPointer, opts);
    window.addEventListener("mousemove", onMouse, opts);
    window.addEventListener("touchstart", onTouch, opts);
    window.addEventListener("touchmove", onTouch, opts);
    return () => {
      window.removeEventListener("pointermove", onPointer, opts);
      window.removeEventListener("pointerdown", onPointer, opts);
      window.removeEventListener("pointerover", onPointer, opts);
      window.removeEventListener("mousemove", onMouse, opts);
      window.removeEventListener("touchstart", onTouch, opts);
      window.removeEventListener("touchmove", onTouch, opts);
    };
  }, [maybeFlee]);

  // Near-instant escape, snappy return.
  const transition = reduced
    ? { duration: 0 }
    : phase === PHASES.FLEE
      ? { type: "tween" as const, duration: FLEE_DURATION, ease: "linear" as const }
      : phase === PHASES.RETURN
        ? { type: "tween" as const, duration: RETURN_DURATION, ease: "easeOut" as const }
        : { duration: 0 };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p
        className="mx-auto mb-4 max-w-md text-center font-body text-white/80"
        style={{ fontSize: "var(--step-0)" }}
      >
        {PRANK.label} 👇
      </p>

      <div
        ref={playgroundRef}
        className="glass relative mx-auto w-full overflow-hidden rounded-3xl"
        style={{ height: "clamp(340px, 52vh, 520px)" }}
      >
        <motion.button
          ref={btnRef}
          type="button"
          tabIndex={-1}
          aria-label={PRANK.label}
          animate={{ x: pos.x, y: pos.y }}
          transition={transition}
          disabled
          // pointer-events:none is the hard guarantee — it can never be clicked.
          // Set twice (class + inline) so no stylesheet can ever re-enable it.
          className="pointer-events-none absolute left-0 top-0 flex select-none items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 font-body font-semibold text-night-900 shadow-glow"
          style={{
            background: COLORS[colorIdx],
            fontSize: "var(--step--1)",
            pointerEvents: "none",
            touchAction: "none",
            WebkitTapHighlightColor: "transparent",
            WebkitUserSelect: "none",
            willChange: "transform",
          }}
        >
          <PartyPopper className="h-5 w-5 shrink-0" />
          <span>💸 10 000 FCFA</span>
        </motion.button>
      </div>
    </div>
  );
}
