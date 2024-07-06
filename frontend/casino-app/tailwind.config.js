/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        }
      },
      animation: {
        'spin-reverse': 'spin-reverse 1s linear infinite',
      }
    },
  },
  plugins: [],
}

