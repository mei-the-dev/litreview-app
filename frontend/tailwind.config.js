/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#CC8844',
        'primary-light': '#E6A966',
        'primary-dark': '#AA6622',
        accent: '#F5EDD6',
        'accent-muted': '#FAF3E0',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
