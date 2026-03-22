import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Starbucks Reserve / Espresso & Cream — referans paleti */
        espresso: {
          DEFAULT: "#1A120B",
          /** Kart / iç yüzey (surface ile aynı kullanım) */
          bg: "#1A120B",
          surface: "#23160E",
          sidebar: "#150E09",
          border: "#362706",
          cream: "#F5E8C7",
          muted: "#D6C7A1",
          latte: "#8D6E63",
          "latte-dark": "#6D4C41",
        },
      },
    },
  },
  plugins: [],
};

export default config;
