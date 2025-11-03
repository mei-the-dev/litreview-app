/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary golden accent
        primary: '#C18F32',
        'primary-light': '#D4A449',
        'primary-dark': '#A67828',
        'primary-glow': 'rgba(193, 143, 50, 0.3)',
        
        // Secondary light pastel gold
        secondary: '#F4E7C3',
        'secondary-light': '#FAF3DC',
        'secondary-dark': '#E8D9A8',
        'secondary-glow': 'rgba(244, 231, 195, 0.4)',
        
        // Supporting colors
        accent: '#F5EDD6',
        'accent-muted': '#FAF3E0',
        
        // Dark theme colors with artistic depth
        'navy-deep': '#0F1419',
        'navy-medium': '#1A1F3A',
        'navy-light': '#252B48',
        'midnight': '#0A0E1A',
        
        'gray-warm': '#4A4A4A',
        'gray-dark': '#2C2C2C',
        
        // Status colors with golden harmony
        success: '#8BC34A',
        warning: '#FFB74D',
        danger: '#FF7043',
        info: '#64B5F6',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(193, 143, 50, 0.3)',
        'glow-lg': '0 0 30px rgba(193, 143, 50, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(193, 143, 50, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(193, 143, 50, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}
