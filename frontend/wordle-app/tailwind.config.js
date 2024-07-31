/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "section-bg-color": "var(--tg-theme-section-bg-color)",
        "secondary-bg-color": "var(--tg-theme-secondary-bg-color)",
        "theme-bg-color": "var(--tg-theme-bg-color)",
        "text-color": "var(--tg-theme-text-color)",
        "correct-letter-color": "#528D4D",
        "misplaced-letter-color": "#B59F3A",
        "incorrect-letter-color": "#384152",
        "default-letter-color": "#E7E8ED",
        "clicked-default-letter-color": "#D1D4DB",
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'row-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        }
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'row-shake': 'row-shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      }
    },
  },
  plugins: [],
}