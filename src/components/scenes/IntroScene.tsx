import { motion } from "framer-motion";
import { GlassButton } from "../ui/GlassButton";
import { INTRO } from "../../config/content";
import { sceneVariants } from "../../animations/variants";

/**
 * The opening beat: the screen begins black, a heartbeat pulses, then the
 * darkness lifts to unveil the night sky. The teaser fades in, followed by the
 * hero button. Clicking it hands control back to the App to start the show.
 */
export function IntroScene({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.section
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 text-center"
    >
      {/* Black veil that lifts to "illuminate" the sky. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1.6, duration: 2.6, ease: "easeInOut" }}
      />

      {/* Heartbeat glow, visible mostly during the dark opening. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-1/2 z-[1] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,#ff5f9e,transparent 70%)" }}
        initial={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: [1, 1.3, 1, 1.3, 1], opacity: [0.7, 1, 0.6, 1, 0] }}
        transition={{ duration: 3.2, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassButton label={INTRO.buttonLabel} onClick={onEnter} />
        </motion.div>
      </div>
    </motion.section>
  );
}
