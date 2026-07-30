/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium palette (also mirrored as CSS variables in index.css)
        night: {
          900: "#070512",
          800: "#0d0a24",
          700: "#161038",
        },
        rose: {
          pastel: "#ffd6e8",
          soft: "#ff9fc4",
          deep: "#ff5f9e",
        },
        gold: {
          light: "#ffe9b8",
          DEFAULT: "#f6c667",
          rose: "#e7b7a3",
        },
        violet: {
          pastel: "#c9b6ff",
          soft: "#a78bfa",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        script: ["'Great Vibes'", "cursive"],
        body: ["'Poppins'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(255, 159, 196, 0.45)",
        "glow-gold": "0 0 50px rgba(246, 198, 103, 0.5)",
        glass: "0 8px 40px rgba(0, 0, 0, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 30px rgba(255,159,196,0.4)" },
          "50%": { boxShadow: "0 0 70px rgba(255,159,196,0.85)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-8px)" },
        },
        heartbeat: {
          "0%, 40%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "20%": { transform: "scale(1.25)", opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        heartbeat: "heartbeat 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
