import { motion } from "framer-motion";
import { Music, VolumeX } from "lucide-react";
import type { AudioController } from "../../hooks/useAudio";

/**
 * The 🎵 Musique ON/OFF control. Fixed to the top-right, glassmorphic, with a
 * soft pulsing ring while the music plays. Fully keyboard-accessible.
 */
export function MusicToggle({ audio }: { audio: AudioController }) {
  const { isPlaying, toggle } = audio;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? "Couper la musique" : "Activer la musique"}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      className="glass fixed right-4 top-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full text-white shadow-glass sm:right-6 sm:top-6"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Pulsing ring while playing */}
      {isPlaying && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(255,159,196,0.6)" }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {isPlaying ? (
        <Music className="h-5 w-5 text-rose-pastel" />
      ) : (
        <VolumeX className="h-5 w-5 text-white/80" />
      )}
    </motion.button>
  );
}
