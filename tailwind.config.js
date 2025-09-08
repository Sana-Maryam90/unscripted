/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New theme colors: #262c34, #1b1f22, #fdf0e9, #495696
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#f0f2ff',
          100: '#e6e9ff',
          200: '#d1d7ff',
          300: '#b3bdff',
          400: '#8f9aff',
          500: '#495696',
          600: '#3d4a82',
          700: '#333e6e',
          800: '#2a335a',
          900: '#242b4a',
        },
        secondary: {
          50: '#fefefe',
          100: '#fdf0e9',
          200: '#fbe5d3',
          300: '#f8d5b8',
          400: '#f4c19d',
          500: '#f0ad82',
          600: '#e89967',
          700: '#d4844c',
          800: '#b86f31',
          900: '#9c5a16',
        },
        dark: {
          50: '#f7f8f9',
          100: '#eef0f2',
          200: '#d9dde2',
          300: '#b8c0c8',
          400: '#929da8',
          500: '#74808c',
          600: '#5d6873',
          700: '#4c555e',
          800: '#414950',
          900: '#262c34',
          950: '#1b1f22',
        },
        cream: '#fdf0e9',
        slate: {
          dark: '#262c34',
          darker: '#1b1f22',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}