/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#030712',
          panel: '#0B1120',
          cyan: '#00D4FF',
          blue: '#38BDF8',
          amber: '#F59E0B',
          text: '#F8FAFC',
        }
      },
      animation: {
        'scan': 'scan 6s linear infinite',
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'rotate-slow': 'spin 20s linear infinite',
        'rotate-reverse': 'spin 15s linear infinite reverse',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'marquee': 'marquee 30s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'power-on': 'power-on 1.5s ease-out forwards',
        'beam': 'beam 3s linear infinite',
        'data-flow': 'data-flow 2s linear infinite',
      },
      keyframes: {
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.3)', opacity: '0.8' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.6)', opacity: '1' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(1deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-1deg)' }
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'flicker': {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' }
        },
        'power-on': {
          '0%': { opacity: '0', filter: 'blur(20px)', transform: 'scale(0.95)' },
          '100%': { opacity: '1', filter: 'blur(0px)', transform: 'scale(1)' }
        },
        'beam': {
          '0%': { transform: 'translateX(-100%) rotate(45deg)' },
          '100%': { transform: 'translateX(300%) rotate(45deg)' }
        },
        'data-flow': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 -40px' }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundSize: { '300%': '300%' },
    },
  },
  plugins: [],
}
