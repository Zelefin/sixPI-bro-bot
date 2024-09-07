/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "tg-bg-color": "var(--tg-theme-bg-color)",
        "tg-text-color": "var(--tg-theme-text-color)",
        "tg-button-color": "var(--tg-theme-button-color)",
        "tg-button-text-color": "var(--tg-theme-button-text-color)",
        "tg-accent-text-color": "var(--tg-theme-accent-text-color)",
        "tg-hint-color": "var(--tg-theme-hint-color)",
        "tg-section-separator-color": "var(--tg-theme-section-separator-color)",
        "tg-section-bg-color": "var(--tg-theme-section-bg-color)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-in-top': 'slideInTop 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};