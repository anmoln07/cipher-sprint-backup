import type { Config } from "tailwindcss";

const config: Config = {
  future: { hoverOnlyWhenSupported: true },
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#ECE9E2",
        card: "#FBFAF6",
        ink: { DEFAULT: "#463D35", soft: "#7D746A" },
        line: "#DAD5CB",
        wash: "#E4ECCB",
        leaf: { DEFAULT: "#7FA81E", deep: "#4D6B0E" },
        warn: "#B45309",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: { spring: "cubic-bezier(.2,.8,.2,1)" },
    },
  },
  plugins: [],
};
export default config;
