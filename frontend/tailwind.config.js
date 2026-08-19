/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#E8601C', light: '#FEF0E8', mid: '#F97C3C', dark: '#D04F0F' },
        secondary: { DEFAULT: '#0A6B3C', light: '#E8F5EE' },
        accent:    { DEFAULT: '#1A2A6C', light: '#EEF1FB' },
        warm: {
          50:  '#FAFAF8',
          100: '#F5F4F1',
          200: '#E5E2DC',
          300: '#C5C1BB',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        'input-focus': '0 0 0 3px rgba(232,96,28,0.12)',
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
        'fade-in':  'fade-in 0.15s ease-out',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
