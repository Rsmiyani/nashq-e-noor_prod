/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        'warm-ivory': '#F7F0E2',
        'champagne': '#E8D9BD',
        'champagne-light': '#F4ECE0',
        'gold': '#9D7B3F',
        'gold-dark': '#846733',
        'gold-light': '#BCA065',
        'espresso': '#403323',
        'espresso-dark': '#2A2117',
        'sage': '#68715B',
        'sage-light': '#848E75',
        'cream': '#FBF8F1',
        'muted-brown': '#756956',
        'charcoal': '#1F1A14',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(64, 51, 35, 0.08)',
        'luxury-hover': '0 20px 40px -15px rgba(64, 51, 35, 0.15)',
        'modal': '0 25px 60px -15px rgba(42, 33, 23, 0.35)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}

