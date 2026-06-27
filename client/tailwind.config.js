/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          light: '#f0fdf4',
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          dark: '#062c14'
        },
        surface: {
          DEFAULT: '#0B132B',
          50:  '#0d1630',
          100: '#0B132B',
          200: '#091026',
          300: '#060c1e',
        },
        border: {
          DEFAULT: '#1E293B',
          light: '#243447',
          glow: 'rgba(34,197,94,0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'app-bg': "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(22,163,74,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(11,19,43,0.8) 0%, transparent 70%)",
        'card-glow': "linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(11,19,43,0) 60%)",
        'green-glow': "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        'card': '0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 8px 32px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.15)',
        'green': '0 0 20px rgba(34,197,94,0.15)',
        'green-md': '0 0 30px rgba(34,197,94,0.2)',
        'modal': '0 24px 80px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
        'btn': '0 4px 14px rgba(22,163,74,0.25)',
        'btn-hover': '0 6px 20px rgba(22,163,74,0.4)',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
