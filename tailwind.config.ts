import type { Config } from "tailwindcss";

// ── DESIGN TOKENS ELEVO v2 — Niveau pro ──────────────────────────────────
// Philosophie:
// - Palette limitée (1 primary + 1 accent + neutrals)
// - Typographie sobre avec poids variés
// - Shadow system à 5 niveaux
// - Border radius cohérent
// - Motion tokens

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── PRIMARY: Indigo profond (sophistiqué, mature) ──
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",   // brand main
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // ── ACCENT: Ambre chaleureux (pour highlights/CTA secondaires) ──
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        // ── NEUTRAL: Warm gray (meilleur que pure gray) ──
        neutral: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
          950: "#0c0a09",
        },
        // ── SEMANTIC ──
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#e11d48",
        // ── Ancien namespace elevo gardé pour compat ──
        elevo: {
          purple: "#4f46e5",
          violet: "#6366f1",
          pink: "#e11d48",
          orange: "#f59e0b",
          yellow: "#fbbf24",
          green: "#10b981",
          blue: "#4f46e5",
          teal: "#10b981",
          red: "#e11d48",
          indigo: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-display)", "Nunito", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
        round: ["var(--font-display)", "Nunito", "system-ui"],  // legacy alias
      },
      // ── TYPOGRAPHY SCALE (modular, 1.25 ratio) ──
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0" }],
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0" }],
        sm: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "-0.005em" }],
        lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.015em" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.03em" }],
        "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.035em" }],
        "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.04em" }],
      },
      // ── SHADOW SYSTEM — 5 niveaux d'élévation ──
      boxShadow: {
        "xs": "0 1px 2px 0 rgba(23, 23, 23, 0.04)",
        "sm": "0 1px 3px 0 rgba(23, 23, 23, 0.08), 0 1px 2px -1px rgba(23, 23, 23, 0.05)",
        "DEFAULT": "0 4px 6px -1px rgba(23, 23, 23, 0.08), 0 2px 4px -2px rgba(23, 23, 23, 0.05)",
        "md": "0 10px 15px -3px rgba(23, 23, 23, 0.08), 0 4px 6px -4px rgba(23, 23, 23, 0.04)",
        "lg": "0 20px 25px -5px rgba(23, 23, 23, 0.08), 0 8px 10px -6px rgba(23, 23, 23, 0.05)",
        "xl": "0 25px 50px -12px rgba(23, 23, 23, 0.20)",
        "2xl": "0 35px 60px -15px rgba(23, 23, 23, 0.25)",
        "inner": "inset 0 2px 4px 0 rgba(23, 23, 23, 0.04)",
        // Glow effects pour moments spéciaux
        "glow-primary": "0 0 40px -8px rgba(99, 102, 241, 0.4)",
        "glow-accent": "0 0 40px -8px rgba(245, 158, 11, 0.5)",
      },
      // ── BORDER RADIUS ──
      borderRadius: {
        "none": "0",
        "xs": "0.25rem",   // 4px - subtle
        "sm": "0.375rem",  // 6px - buttons/inputs
        "DEFAULT": "0.5rem",  // 8px - default
        "md": "0.625rem",  // 10px
        "lg": "0.75rem",   // 12px - cards
        "xl": "1rem",      // 16px - large cards
        "2xl": "1.25rem",  // 20px - modals
        "3xl": "1.5rem",   // 24px - hero
        "full": "9999px",
      },
      // ── ANIMATIONS ──
      animation: {
        "float": "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        // Legacy
        wiggle: "wiggle 0.5s ease-in-out",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-in": {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        "fade-in-up": {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "from": { opacity: "0", transform: "scale(0.96)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-4deg)" },
          "75%": { transform: "rotate(4deg)" },
        },
      },
      // ── SPACING EXTENSION ──
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },
      // ── BACKDROP BLUR ──
      backdropBlur: {
        "xs": "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
