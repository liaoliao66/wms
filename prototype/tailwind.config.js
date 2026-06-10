/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './pages/**/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: { brand: '#0f172a' },
    },
  },
  plugins: [],
};
