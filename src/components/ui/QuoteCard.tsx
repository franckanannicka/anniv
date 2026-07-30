import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MESSAGE, PERSON } from "../../config/content";
import { Typewriter } from "./Typewriter";
import { rand, randInt } from "../../utils/random";

/**
 * The complete birthday message, in an elegant glassmorphic card that appears
 * as the user scrolls just past the video. The text writes itself out letter by
 * letter — smooth, fairly quick, with a soft glow and a blinking caret — while
 * tiny luminous particles drift around it. The signature then signs off in
 * script. An emotional, premium moment that invites reading to the very end.
 */

const PARTICLE_HUES = [45, 330, 350, 265, 200];

function makeParticles(n: number) {
  return Array.from({ length: n }, (_, id) => {
    const duration = rand(5, 11);
    return {
      id,
      left: rand(2, 96),
      top: rand(4, 92),
      size: rand(4, 9),
      duration,
      delay: -rand(0, duration),
      hue: PARTICLE_HUES[randInt(0, PARTICLE_HUES.length - 1)],
    };
  });
}

export function QuoteCard() {
  const particles = useMemo(() => makeParticles(16), []);
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const [done, setDone] = useState(false);

  // Peel the signature off the end so we can sign it in script.
  const body = MESSAGE.trim().endsWith(PERSON.signature)
    ? MESSAGE.trim().slice(0, -PERSON.signature.length).trim()
    : MESSAGE.trim();

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-2xl">
      {/* Discreet glow behind the card */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[2.2rem] blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(255,159,196,0.30), transparent 70%)",
        }}
      />

      {/* Luminous particles drifting around the text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.8rem]"
      >
        <style>{`
          @keyframes quote-float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
            50%      { transform: translateY(-16px) scale(1.3); opacity: 1; }
          }
        `}</style>
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `radial-gradient(circle, hsl(${p.hue} 100% 88%) 0%, hsla(${p.hue},100%,72%,0) 70%)`,
              boxShadow: `0 0 12px 3px hsla(${p.hue}, 100%, 78%, 0.8)`,
              animation: `quote-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="glass relative z-10 flex w-full flex-col rounded-[1.8rem] px-6 py-9 shadow-glass sm:px-10 sm:py-12">
        {/* Decorative opening quote */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1 select-none font-display leading-none text-rose-soft/30"
          style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
        >
          &ldquo;
        </span>

        <Typewriter
          text={body}
          start={inView}
          speed={14}
          onDone={() => setDone(true)}
          className="text-glow relative z-10 font-body text-[length:var(--step-0)] leading-relaxed text-white/95"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-glow relative z-10 mt-7 text-right font-script text-rose-pastel"
          style={{ fontSize: "var(--step-1)" }}
        >
          {PERSON.signature}
        </motion.p>
      </div>
    </div>
  );
}
