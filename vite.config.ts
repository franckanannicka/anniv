import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Modern baseline: every browser that can run this card supports es2020, and
    // skipping the legacy transforms/polyfills makes the bundle noticeably lighter.
    target: "es2020",
    cssCodeSplit: true,
    // Split the heaviest libs into their own chunks for better caching / faster
    // first paint. canvas-confetti is intentionally left out: it is imported
    // dynamically (see animations/celebrations.ts) so Rollup emits it as an
    // on-demand chunk that never blocks the initial load.
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["framer-motion"],
        },
      },
    },
  },
});
