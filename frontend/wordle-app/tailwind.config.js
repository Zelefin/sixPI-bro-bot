/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "section-bg-color": "var(--tg-theme-section-bg-color)",
        "secondary-bg-color": "var(--tg-theme-secondary-bg-color)",
        "text-color": "var(--tg-theme-text-color)",
      }
    },
  },
  plugins: [],
}