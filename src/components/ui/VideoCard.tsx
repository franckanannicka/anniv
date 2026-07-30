import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { MEDIA } from "../../config/content";
import type { AudioController } from "../../hooks/useAudio";

/**
 * The centrepiece video — the first thing the eye lands on, right under the
 * title. Large, centred, wrapped in a glassmorphic frame with an animated
 * rainbow halo and a soft drop shadow. It loops silently (muted autoplay is
 * always allowed); an unmute button lets her hear it, ducking the background
 * music while it plays and restoring it when muted again.
 *
 * Sizing is Android-first: width follows the viewport (min of 88vw and a cap)
 * and height is bounded so a tall portrait clip never overflows the screen.
 */
export function VideoCard({ audio }: { audio: AudioController }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      /* If autoplay is refused, controls remain usable. */
    });
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (next) audio.restore();
    else {
      audio.duck();
      v.play().catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-[min(88vw,420px)] sm:w-[440px] lg:w-[480px]"
    >
      {/* Animated rainbow halo behind the frame */}
      <motion.div
        aria-hidden="true"
        className="absolute -inset-4 rounded-[2.4rem] blur-2xl"
        style={{
          background:
            "conic-gradient(from 0deg, #ff9fc4, #f6c667, #c9b6ff, #ff5f9e, #ff9fc4)",
        }}
        animate={{ rotate: 360, opacity: [0.55, 0.85, 0.55] }}
        transition={{
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
          opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Soft static glow underneath for depth */}
      <div
        aria-hidden="true"
        className="absolute -inset-2 rounded-[2.2rem] blur-xl"
        style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(255,159,196,0.35), transparent 70%)" }}
      />

      {/* Glassmorphic frame with a gentle padding ring around the video */}
      <div
        className="glass relative rounded-[2rem] p-2 shadow-glow"
        style={{ boxShadow: "0 24px 70px rgba(0,0,0,0.5), 0 0 44px rgba(255,159,196,0.35)" }}
      >
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/25 bg-black/50">
          <video
            ref={videoRef}
            src={MEDIA.video}
            muted={muted}
            loop
            playsInline
            autoPlay
            controls={false}
            className="block h-auto max-h-[66vh] w-full object-contain"
          />

          {/* Unmute / mute control */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Activer le son de la vidéo" : "Couper le son de la vidéo"}
            className="glass absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full text-white"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-rose-pastel" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
