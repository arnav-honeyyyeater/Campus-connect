import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          50: "#171C24", 100: "#252C37", 200: "#333C49", 300: "#7D899D",
          400: "#8D98A9", 500: "#9DA6B5", 600: "#B6BECA", 700: "#CFD5DF",
          800: "#E1E5ED", 900: "#F3F5F8",
        },
        violet: {
          50: "#171F2D", 100: "#22334E", 200: "#304A70", 300: "#779CD4",
          400: "#91B2E6", 500: "#8BAFF1", 600: "#3768B9", 700: "#A8C9FF", 800: "#C3D9FF",
        },
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        campus: {
          bg: "var(--background)",
          dark: "var(--foreground)",
          surface: "var(--surface)",
          "surface-elevated": "var(--surface-elevated)",
          elevated: "var(--surface-elevated)",
          muted: "var(--foreground-secondary)",
          secondary: "var(--foreground-secondary)",
          subtle: "var(--foreground-muted)",
          border: "var(--border)",
          lime: {
            DEFAULT: "#D9F36B",
            hover: "#CEE85E",
            light: "#EEFBC0",
          },
          coral: {
            DEFAULT: "#F26457",
            hover: "#E45649",
            light: "#FDE8E6",
          },
          error: "#DC2626",
          success: "#15803D",
          warning: "#B45309",
          darkmode: {
            bg: "#121511",
            surface: "#1A1E18",
            elevated: "#242922",
            text: "#F5F6F3",
            muted: "#A7B0A2",
            border: "#2D342B",
            lime: "#E2F87D",
            coral: "#FF7A6E",
          },
        },
      },
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(32, 36, 30, 0.05)",
        subtle: "0 1px 2px 0 rgba(32, 36, 30, 0.04)",
        card: "0 2px 4px 0 rgba(32, 36, 30, 0.04), 0 1px 2px 0 rgba(32, 36, 30, 0.02)",
        sheet: "0 10px 15px -3px rgba(32, 36, 30, 0.08), 0 4px 6px -4px rgba(32, 36, 30, 0.04)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fadeIn 150ms ease-out",
        "fade-out": "fadeOut 150ms ease-in",
        "scale-in": "scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
