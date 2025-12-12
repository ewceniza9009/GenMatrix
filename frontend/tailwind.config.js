/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'], // Optional for very premium headers
      },
      colors: {
        // Premium Dark Palette
        midnight: {
          950: '#020617', // Deepest background
          900: '#0f172a', // Card background
          800: '#1e293b', // Lighter card
        },
        // Accents
        gold: {
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          glow: 'rgba(245, 158, 11, 0.5)',
        },
        emerald: {
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        premium: {
          gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)' },
          'to': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
