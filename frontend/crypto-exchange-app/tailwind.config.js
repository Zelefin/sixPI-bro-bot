/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        "theme-bg-color": "var(--tg-theme-bg-color)",
      },
      boxShadow: {
        'custom-top': '0 -1px 0 var(--tgui--divider)',
        'custom-bottom': '0 1px 0 var(--tgui--divider)',
      },
      keyframes: {
        grow: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        shrink: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' },
        },
      },
      animation: {
        grow: 'grow 0.5s ease-out',
        shrink: 'shrink 0.5s ease-in',
      },
    },
  },
  plugins: [],
}

