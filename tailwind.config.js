/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          copper: '#8C5523',
          sienna: '#B97832',
          bronze: '#B97832',
          gold: '#D9A441',
          champagne: '#F6D58A',
          cream: '#F7F2E8',
          black: '#0D0D0D',
          dark: '#0D0D0D',
          pink: '#E84DB2',
        },
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%':      { opacity: 0.7, transform: 'scale(1.05)' },
        },
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        ripple: {
          '0%':   { transform: 'scale(0.95)', opacity: 0.6 },
          '100%': { transform: 'scale(2.4)', opacity: 0 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'ripple': 'ripple 1.6s ease-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};