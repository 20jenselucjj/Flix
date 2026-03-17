/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#EE1A31', // Brand Red
        background: '#090B11',
        surface: '#11141C',
        'surface-hover': '#1A1F2B',
        'surface-2': '#171C27',
        'surface-3': '#202736',
        text: '#FFFFFF',
        'text-secondary': '#A8B0C3',
        'text-muted': '#6F7A92',
        accent: '#7C8CFF',
        success: '#2DD4BF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 60px rgba(14, 18, 30, 0.45)',
        panel: '0 12px 40px rgba(0, 0, 0, 0.28)',
      },
      backgroundImage: {
        'app-radial': 'radial-gradient(circle at top, rgba(124, 140, 255, 0.2), transparent 35%), radial-gradient(circle at 80% 20%, rgba(238, 26, 49, 0.18), transparent 28%)',
        'panel-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
