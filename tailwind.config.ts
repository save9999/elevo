import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        elevo: {
          purple: "#7C3AED", violet: "#8B5CF6", pink: "#EC4899",
          orange: "#F97316", yellow: "#FBBF24", green: "#10B981",
          blue: "#3B82F6", teal: "#14B8A6", red: "#EF4444",
          indigo: "#6366F1",
        },
      },
      fontFamily: { round: ["var(--font-round)", "system-ui"] },
      animation: {
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out",
        "bounce-slow": "bounce 2s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "map-pulse": "map-node-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        wiggle: { "0%,100%": { transform: "rotate(0deg)" }, "25%": { transform: "rotate(-5deg)" }, "75%": { transform: "rotate(5deg)" } },
        "pulse-glow": { "0%,100%": { boxShadow: "0 0 10px rgba(124,58,237,0.3)" }, "50%": { boxShadow: "0 0 30px rgba(124,58,237,0.7)" } },
      },
    },
  },
  plugins: [],
} satisfies Config;
