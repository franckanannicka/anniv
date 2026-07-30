import { useMemo } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { rand, randInt, pick } from "../../utils/random";

/**
 * Ambient DOM layer that keeps the world alive from the very first frame:
 *  - dozens of teddy bears drifting slowly down from the sky
 *  - colourful balloons rising continuously from the bottom
 *  - rose petals falling gently
 *  - glowing hearts floating upward
 *  - luminous butterflies crossing now and then
 *  - a field of glowing particles
 *
 * Everything runs on pure CSS keyframe animations (transform + opacity only),
 * which the browser offloads to the compositor — so ~100 elements on desktop
 * (and a scaled-down set on phones) hold a smooth 60fps and never stop.
 * Negative animation delays mean the screen is already full of life at t=0.
 * Disabled entirely under prefers-reduced-motion.
 */

type Kind = "balloon" | "teddy" | "butterfly" | "petal" | "heart" | "particle";

interface FloatItem {
  id: number;
  kind: Kind;
  left: number; // vw
  size: number; // px
  duration: number; // s
  delay: number; // s (negative = already mid-flight)
  drift: number; // px horizontal sway
  rot: number; // deg end rotation
  top?: number; // vh (for crossing items)
  emoji?: string;
  hue?: number; // for coloured SVG balloons/particles
  color?: string; // for glowing hearts
}

const TEDDIES = ["\ud83e\uddf8", "\ud83d\udc3b", "\ud83e\udde1"]; // 🧸 🐻 🧡-ish
const BUTTERFLIES = ["\ud83e\udd8b"]; // 🦋
const PETALS = ["\ud83c\udf38", "\ud83c\udf37", "\ud83c\udf39"]; // 🌸 🌷 🌹
const HEART_COLORS = ["#ff9fc4", "#ff5f9e", "#ffd6e8", "#c9b6ff", "#f6c667"];
const PARTICLE_HUES = [45, 330, 350, 265, 200];

/** Density factor by viewport width — protects low-end phones. */
function densityFactor(): number {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w < 640) return 0.7;
  if (w < 1024) return 0.9;
  return 1;
}

function makeItems(): FloatItem[] {
  const f = densityFactor();
  let id = 0;
  const items: FloatItem[] = [];

  const add = (n: number, factory: () => Omit<FloatItem, "id">) => {
    const count = Math.max(1, Math.round(n * f));
    for (let i = 0; i < count; i++) items.push({ id: id++, ...factory() });
  };

  // 🧸 Dozens of teddies drifting slowly DOWN from the sky
  add(34, () => {
    const duration = rand(26, 46);
    return {
      kind: "teddy",
      left: rand(0, 98),
      size: rand(30, 68),
      duration,
      delay: -rand(0, duration),
      drift: rand(-70, 70),
      rot: randInt(-40, 40),
      emoji: pick(TEDDIES),
    };
  });

  // 🎈 Colourful balloons rising continuously
  add(28, () => {
    const duration = rand(15, 27);
    return {
      kind: "balloon",
      left: rand(1, 96),
      size: rand(34, 62),
      duration,
      delay: -rand(0, duration),
      drift: rand(-60, 60),
      rot: randInt(-12, 12),
      hue: randInt(0, 360),
    };
  });

  // 🌸 Rose petals falling gently
  add(32, () => {
    const duration = rand(9, 18);
    return {
      kind: "petal",
      left: rand(0, 100),
      size: rand(18, 34),
      duration,
      delay: -rand(0, duration),
      drift: rand(-80, 80),
      rot: randInt(-360, 360),
      emoji: pick(PETALS),
    };
  });

  // 💖 Glowing hearts floating up
  add(24, () => {
    const duration = rand(14, 24);
    return {
      kind: "heart",
      left: rand(0, 100),
      size: rand(20, 38),
      duration,
      delay: -rand(0, duration),
      drift: rand(-50, 50),
      rot: randInt(-20, 20),
      color: pick(HEART_COLORS),
    };
  });

  // 🦋 Luminous butterflies crossing now and then
  add(11, () => {
    const duration = rand(16, 28);
    return {
      kind: "butterfly",
      left: 0,
      size: rand(28, 46),
      duration,
      delay: -rand(0, duration),
      drift: rand(-140, 140),
      rot: randInt(-20, 20),
      top: rand(8, 82),
      emoji: pick(BUTTERFLIES),
    };
  });

  // ✨ Glowing particles rising
  add(42, () => {
    const duration = rand(8, 18);
    return {
      kind: "particle",
      left: rand(0, 100),
      size: rand(4, 9),
      duration,
      delay: -rand(0, duration),
      drift: rand(-40, 40),
      rot: 0,
      hue: pick(PARTICLE_HUES),
    };
  });

  return items;
}

/** A crisp, colourful SVG balloon (any hue) with highlight, knot and string. */
function Balloon({ hue, size, id }: { hue: number; size: number; id: number }) {
  const gid = `balloon-grad-${id}`;
  const light = `hsl(${hue} 90% 74%)`;
  const dark = `hsl(${hue} 78% 52%)`;
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 40 60"
      aria-hidden="true"
      style={{ display: "block", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))" }}
    >
      <defs>
        <radialGradient id={gid} cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="20" rx="16" ry="19" fill={`url(#${gid})`} />
      <path d="M20 38 l-3.2 4.5 h6.4 z" fill={dark} />
      <path
        d="M20 43 q5 5 0 10 q-5 5 0 6"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1"
        fill="none"
      />
      <ellipse cx="13.5" cy="13" rx="3.5" ry="6" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

/** A small glowing heart. */
function GlowHeart({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "block", filter: `drop-shadow(0 0 6px ${color})` }}
    >
      <path
        d="M12 21s-7-4.35-9.5-8.5C1 9.4 2.6 5.6 6.2 5.6c2 0 3.2 1.2 3.8 2.3.6-1.1 1.8-2.3 3.8-2.3 3.6 0 5.2 3.8 3.7 6.9C19 16.65 12 21 12 21z"
        fill={color}
      />
    </svg>
  );
}

function FloatSprite({ item }: { item: FloatItem }) {
  const rises =
    item.kind === "balloon" || item.kind === "particle" || item.kind === "heart";
  const crosses = item.kind === "butterfly";
  const animName = crosses ? "fx-cross" : rises ? "fx-rise" : "fx-fall";

  const style: React.CSSProperties = {
    left: `${item.left}vw`,
    top: crosses ? `${item.top}vh` : undefined,
    animationName: animName,
    animationDuration: `${item.duration}s`,
    animationDelay: `${item.delay}s`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    ["--drift" as string]: `${item.drift}px`,
    ["--rot" as string]: `${item.rot}deg`,
  };

  if (item.kind === "particle") {
    return (
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          ...style,
          width: `${item.size}px`,
          height: `${item.size}px`,
          background: `radial-gradient(circle, hsl(${item.hue} 100% 85%) 0%, hsla(${item.hue},100%,70%,0) 70%)`,
          boxShadow: `0 0 12px 3px hsla(${item.hue}, 100%, 75%, 0.7)`,
        }}
      />
    );
  }

  if (item.kind === "balloon") {
    return (
      <span aria-hidden="true" className="absolute" style={style}>
        <Balloon hue={item.hue!} size={item.size} id={item.id} />
      </span>
    );
  }

  if (item.kind === "heart") {
    return (
      <span aria-hidden="true" className="absolute" style={style}>
        <GlowHeart color={item.color!} size={item.size} />
      </span>
    );
  }

  // Emoji sprites: teddy / petal / butterfly
  return (
    <span
      aria-hidden="true"
      className={`absolute select-none ${item.kind === "butterfly" ? "fx-flutter-wrap" : ""}`}
      style={{
        ...style,
        fontSize: `${item.size}px`,
        lineHeight: 1,
        filter:
          item.kind === "butterfly"
            ? "drop-shadow(0 0 10px rgba(201,182,255,0.9))"
            : "drop-shadow(0 3px 8px rgba(0,0,0,0.45)) drop-shadow(0 0 6px rgba(255,214,232,0.35))",
      }}
    >
      <span className={item.kind === "butterfly" ? "fx-flutter" : undefined}>
        {item.emoji}
      </span>
    </span>
  );
}

export function FloatingElements() {
  const reduced = useReducedMotion();
  const items = useMemo(makeItems, []);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      <style>{`
        @keyframes fx-rise {
          0%   { transform: translateY(108vh) translateX(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-18vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes fx-fall {
          0%   { transform: translateY(-18vh) translateX(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(112vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes fx-cross {
          0%   { transform: translateX(-16vw) translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(116vw) translateY(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes fx-flutter {
          0%, 100% { transform: scaleX(1); }
          50%      { transform: scaleX(0.55); }
        }
        .fx-flutter {
          display: inline-block;
          animation: fx-flutter 0.4s ease-in-out infinite;
        }
      `}</style>
      {items.map((item) => (
        <FloatSprite key={item.id} item={item} />
      ))}
    </div>
  );
}
