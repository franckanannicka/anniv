import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split the heaviest libs into their own chunks for better caching / faster first paint.
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["framer-motion"],
          confetti: ["canvas-confetti"],
        },
      },
    },
  },
});
