/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink:  { DEFAULT: '#0d0f14', 50: '#f5f5f7', 100: '#e8e9ee', 200: '#c9cad4', 300: '#9496a8', 400: '#6366f1', 500: '#4f46e5', 600: '#3b32d4', 700: '#2d26b0', 800: '#201a8f', 900: '#141060' },
        neon: { DEFAULT: '#22d3ee', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
        pop:  { pink: '#f472b6', orange: '#fb923c', green: '#4ade80', amber: '#fbbf24' },
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease-out both',
        'fade-in':   'fadeIn 0.25s ease-out both',
        'scale-in':  'scaleIn 0.2s ease-out both',
        'slide-in':  'slideIn 0.35s ease-out both',
        shimmer:     'shimmer 1.8s linear infinite',
        'ping-once': 'ping 0.4s ease-out 1',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(.94)' }, to: { opacity: 1, transform: 'none' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, #4f46e5 0%, #22d3ee 100%)',
        'grad-dark':  'linear-gradient(135deg, #0d0f14 0%, #1e1f2e 100%)',
      },
    },
  },
  plugins: [],
};
