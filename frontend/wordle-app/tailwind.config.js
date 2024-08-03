/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "section-bg-color": "var(--tg-theme-section-bg-color)",
        "secondary-bg-color": "var(--tg-theme-secondary-bg-color)",
        "theme-bg-color": "var(--tg-theme-bg-color)",
        "button-color": "var(--tg-theme-button-color)",
        "button-text-color": "var(--tg-theme-button-text-color)",
        "text-color": "var(--tg-theme-text-color)",
        "hint-color": "var(--tg-theme-hint-color)",
        "section-header-text-color": "var(--tg-theme-section-header-text-color)",
        "section-separator-color": "var(--tg-theme-section-separator-color)",
        "correct-letter-color": "#538D4E",
        "misplaced-letter-color": "#B59F3B",
        "incorrect-letter-color": "#374151",
        "default-light-letter-color": "#E5E7EB",
        "clicked-default-light-letter-color": "#D1D5DB",
        "default-dark-letter-color": "#6B7280",
        "clicked-default-dark-letter-color": "#4B5563",
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
  darkMode: 'class',
}