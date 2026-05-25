import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        slate: {
          350: "#aab4c2",
          450: "#7b8797",
          550: "#596579",
          555: "#566176",
          850: "#172033",
        },
        indigo: {
          850: "#262e81",
        },
        rose: {
          450: "#fb5f85",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
