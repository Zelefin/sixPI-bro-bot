/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        "tg-text-color": "var(--tg-theme-text-color)",
      },
    },
  },
  plugins: [],
}

