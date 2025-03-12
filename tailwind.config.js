/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4a6741', // Een rustig groen dat goed werkt met kunst
          light: '#6b8c61',
          dark: '#2e4128',
        },
        secondary: {
          DEFAULT: '#d9c5b2', // Warm beige voor een galerij-gevoel
          light: '#f0e6d9',
          dark: '#b29980',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
