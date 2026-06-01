/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f6f7fb',
          100: '#eceef5',
          200: '#d8dbe7',
          300: '#b6bbcf',
          400: '#8b91ad',
          500: '#666c8a',
          600: '#4d536f',
          700: '#3b405a',
          800: '#262a42',
          900: '#171933',
          950: '#0b0a18',
        },
        brand: {
          50: '#f1efff',
          100: '#e6e1ff',
          200: '#cfc4ff',
          300: '#b09bff',
          400: '#9171ff',
          500: '#7a4bff',
          600: '#6730f0',
          700: '#5520cc',
          800: '#421b9e',
          900: '#311678',
          950: '#1f0d4f',
        },
        accent: {
          rose: '#ff5d8f',
          amber: '#ffb454',
          mint: '#34d4a6',
          sky: '#5bb5ff',
        },
      },
      boxShadow: {
        glow: '0 10px 40px -10px rgba(122, 75, 255, 0.45)',
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        ring: '0 0 0 1px rgba(122, 75, 255, 0.15), 0 10px 30px -10px rgba(122, 75, 255, 0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7a4bff 0%, #ff5d8f 100%)',
        'mesh-light':
          'radial-gradient(at 0% 0%, rgba(122,75,255,0.18) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(255,93,143,0.18) 0px, transparent 55%), radial-gradient(at 100% 100%, rgba(91,181,255,0.18) 0px, transparent 55%), radial-gradient(at 0% 100%, rgba(52,212,166,0.16) 0px, transparent 55%)',
        'mesh-dark':
          'radial-gradient(at 0% 0%, rgba(122,75,255,0.30) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(255,93,143,0.20) 0px, transparent 55%), radial-gradient(at 100% 100%, rgba(91,181,255,0.18) 0px, transparent 55%), radial-gradient(at 0% 100%, rgba(52,212,166,0.18) 0px, transparent 55%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'pop-in': 'pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
};
