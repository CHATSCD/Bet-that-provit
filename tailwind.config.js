/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green:  '#00FF88',
        blue:   '#00CFFF',
        red:    '#FF003C',
        dark:   '#000000',
        dark2:  '#060606',
        dark3:  '#0a0a0a',
        dark4:  '#0f0f0f',
        border: '#1a1a1a',
        muted:  '#333333',
      },
      fontFamily: {
        ops:  ['Black Ops One', 'cursive'],
        oswald: ['Oswald', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glitch':    'glitch 0.3s ease-in-out',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'scanline':  'scanline 8s linear infinite',
        'float':     'float 3s ease-in-out infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)', filter: 'none' },
          '20%': { transform: 'translate(-2px, 1px)', filter: 'hue-rotate(90deg)' },
          '40%': { transform: 'translate(2px, -1px)', filter: 'hue-rotate(180deg)' },
          '60%': { transform: 'translate(-1px, 2px)', filter: 'hue-rotate(270deg)' },
          '80%': { transform: 'translate(1px, -2px)', filter: 'none' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px #00FF88' },
          '50%': { opacity: '0.7', boxShadow: '0 0 40px #00FF88' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'green': '0 0 20px rgba(0,255,136,0.4)',
        'green-lg': '0 0 40px rgba(0,255,136,0.6)',
        'blue': '0 0 20px rgba(0,207,255,0.4)',
        'red': '0 0 20px rgba(255,0,60,0.4)',
      },
    },
  },
  plugins: [],
}
