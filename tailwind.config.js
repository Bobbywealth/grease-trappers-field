/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          copper: '#8A4F2A',
          sienna: '#A85E32',
          bronze: '#B67842',
          gold: '#D6A04D',
          champagne: '#F1D28A',
          cream: '#F7F2E8',
          black: '#0a0a0a',
          dark: '#111111',
          pink: '#E84DB2', // legacy
        },
      },
    },
  },
  plugins: [],
};