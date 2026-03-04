import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1D3A", light: "#1A2F52" },
        forest: { DEFAULT: "#1B5E3B", light: "#2D8C5A", accent: "#3AA06B" },
        warm: {
          50: "#F7F6F3",
          100: "#EEEDEA",
          200: "#E8E6E1",
          300: "#9A9A90",
          400: "#5A5A52",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
