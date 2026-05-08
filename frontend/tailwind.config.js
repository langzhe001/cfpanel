/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fedfbd',
          200: '#fcc98b',
          300: '#f9a858',
          400: '#f68d30',
          500: '#f47120',
          600: '#e85418',
          700: '#c03b15',
          800: '#9a3118',
          900: '#7d2b16',
        },
      },
    },
  },
  plugins: [],
}
