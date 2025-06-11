/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          400: 'var(--primary)',
          500: 'var(--primary)',
          600: 'var(--primary)',
          700: 'var(--primary-dark)',
        },
        dark: {
          100: '#2a2a2a',
          200: '#1e1e1e',
          300: '#323232',
          800: '#121212',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};