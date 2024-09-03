/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        "tg-text-color": "var(--tg-theme-text-color)",
        "tg-button-color": "var(--tg-theme-button-color)",
        "tg-hint-color": "var(--tg-theme-hint-color)",
        "tg-section-separator-color": "var(--tg-theme-section-separator-color)",
        "tg-section-bg-color": "var(--tg-theme-section-bg-color)",
      },
    },
  },
  plugins: [],
}

