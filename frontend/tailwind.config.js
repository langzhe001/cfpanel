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
      boxShadow: {
        'glow': '0 0 20px rgba(244, 113, 32, 0.5)',
        'glow-sm': '0 0 10px rgba(244, 113, 32, 0.3)',
        'glow-lg': '0 0 40px rgba(244, 113, 32, 0.6)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
