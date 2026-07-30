import confetti from "canvas-confetti";

/**
 * Reusable celebration bursts built on canvas-confetti.
 * A shared palette keeps every burst on-brand.
 */
const PALETTE = ["#ffd6e8", "#ff9fc4", "#ff5f9e", "#f6c667", "#ffe9b8", "#c9b6ff"];

/** A single confetti pop from a point (x, y are 0..1 of the viewport). */
export function popConfetti(x = 0.5, y = 0.5, count = 120): void {
  confetti({
    particleCount: count,
    spread: 90,
    origin: { x, y },
    colors: PALETTE,
    scalar: 1.05,
    ticks: 220,
    disableForReducedMotion: true,
  });
}

/** Two cannons firing inward — great for the reveal moment. */
export function cannons(): void {
  const base = { colors: PALETTE, ticks: 260, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
}

/**
 * A timed fireworks show. Returns a stop() function so callers can cancel it
 * (e.g. on unmount) and avoid leaking the interval.
 */
export function fireworks(durationMs = 4000): () => void {
  const animationEnd = Date.now() + durationMs;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 60,
    colors: PALETTE,
    disableForReducedMotion: true,
  };

  const timer = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(timer);
      return;
    }
    const particleCount = 60 * (timeLeft / durationMs);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.1 + Math.random() * 0.3, y: Math.random() * 0.5 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.6 + Math.random() * 0.3, y: Math.random() * 0.5 },
    });
  }, 280);

  return () => window.clearInterval(timer);
}

/** A soft, slow rain of hearts and petals for the finale. */
export function heartRain(durationMs = 5000): () => void {
  const heart = confetti.shapeFromText({ text: "\u2764\ufe0f", scalar: 2 });
  const petal = confetti.shapeFromText({ text: "\ud83c\udf38", scalar: 2 });
  const end = Date.now() + durationMs;

  const timer = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(timer);
      return;
    }
    confetti({
      particleCount: 4,
      startVelocity: 0,
      gravity: 0.5,
      ticks: 260,
      spread: 360,
      shapes: [heart, petal],
      scalar: 2,
      origin: { x: Math.random(), y: -0.1 },
      disableForReducedMotion: true,
    });
  }, 180);

  return () => window.clearInterval(timer);
}
