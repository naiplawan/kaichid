/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        green: {
          oracle: '#10b981',
          light: '#6ee7b7',
          dark: '#047857',
        },
        yellow: {
          oracle: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        red: {
          oracle: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        mystical: {
          purple: '#8b5cf6',
          gold: '#D4AF37',
          silver: '#6b7280',
          dark: '#0F0F23',
          'dark-lighter': '#1A1B3A',
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'card-appear': 'cardAppear 0.5s ease-out',
        'swipe-left': 'swipeLeft 0.3s ease-out',
        'swipe-right': 'swipeRight 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
        cardAppear: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(50px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0deg)' },
          '100%': { transform: 'translateX(-300px) rotate(-30deg)' },
        },
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0deg)' },
          '100%': { transform: 'translateX(300px) rotate(30deg)' },
        },
      },
      fontFamily: {
        mystical: ['Roboto Condensed', 'sans-serif'],
        oracle: ['Roboto Condensed', 'sans-serif'],
        sans: ['Roboto Condensed', 'sans-serif'],
        serif: ['Roboto Condensed', 'sans-serif'],
        mono: ['Roboto Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
