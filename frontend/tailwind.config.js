/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './src/styles/**/*.css'],
  theme: {
    extend: {
      colors: {
        primary: '#10b77f',
        'primary-dark': '#0d9668',
        'primary-light': '#d1fae5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
