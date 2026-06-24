/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#E84DB2',
          gold: '#d4a853',
          dark: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
};