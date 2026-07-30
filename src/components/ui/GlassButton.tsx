import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { rand } from "../../utils/random";

interface GlassButtonProps {
  label: string;
  onClick: () => void;
}

/**
 * The hero call-to-action: a large glass pill with a rose-gold glow, a slow
 * breathing pulse, and a scatter of sparkles that bloom on hover. Bouncy tap.
 */
export function GlassButton({ label, onClick }: GlassButtonProps) {
  const [hovered, setHovered] = useState(false);

  // Fixed sparkle offsets around the button (generated once).
  const [sparkles] = useState(() =>
    Array.from({ length: 7 }, () => ({
      x: rand(-70, 70),
      y: rand(-40, 40),
      delay: rand(0, 0.3),
    })),
  );

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Hover sparkles */}
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-gold-light"
          initial={{ opacity: 0, scale: 0 }}
          animate={
            hovered
              ? { opacity: [0, 1, 0], scale: [0, 1.2, 0], x: s.x, y: s.y }
              : { opacity: 0, scale: 0 }
          }
          transition={{ duration: 1.1, delay: s.delay, repeat: hovered ? Infinity : 0 }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.span>
      ))}

      <motion.button
        type="button"
        onClick={onClick}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          boxShadow: [
            "0 0 30px rgba(255,159,196,0.4)",
            "0 0 70px rgba(246,198,103,0.75)",
            "0 0 30px rgba(255,159,196,0.4)",
          ],
        }}
        transition={{ boxShadow: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }}
        className="glass relative flex max-w-[86vw] items-center gap-3 rounded-full px-7 py-4 text-center font-body font-medium text-white sm:px-10 sm:py-5"
        style={{ fontSize: "var(--step-0)" }}
      >
        <span aria-hidden="true">💖</span>
        <span className="text-glow">{label}</span>
      </motion.button>
    </div>
  );
}
