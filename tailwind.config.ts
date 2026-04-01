import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        navy: {
          950: "#020810",
          900: "#040d1a",
          800: "#071629",
          700: "#0d2040",
          600: "#132a52",
          500: "#1a3366",
        },
        clinical: {
          green: "#00c896",
          "green-dim": "#00956f",
          "green-glow": "rgba(0,200,150,0.15)",
        },
        alert: {
          red: "#ff3366",
          "red-dim": "#cc1a44",
          "red-glow": "rgba(255,51,102,0.15)",
          amber: "#f59e0b",
          "amber-dim": "#d97706",
          "amber-glow": "rgba(245,158,11,0.15)",
        },
        text: {
          primary: "#e8f4ff",
          secondary: "#a8c4e0",
          muted: "#5a7a9a",
          inverse: "#040d1a",
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(26,51,102,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(26,51,102,0.3) 1px, transparent 1px)",
        "noise-texture": "url('/noise.svg')",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        "green-glow": "0 0 20px rgba(0,200,150,0.2), 0 0 40px rgba(0,200,150,0.1)",
        "red-glow": "0 0 20px rgba(255,51,102,0.2), 0 0 40px rgba(255,51,102,0.1)",
        "amber-glow": "0 0 20px rgba(245,158,11,0.2)",
        panel: "0 1px 0 rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(0,0,0,0.3) inset",
      },
      animation: {
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        "pulse-red": "pulseRed 1.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,200,150,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(0,200,150,0.15)" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,51,102,0)" },
          "50%": { boxShadow: "0 0 0 6px rgba(255,51,102,0.2)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
