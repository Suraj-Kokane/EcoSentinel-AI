/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // surface stack — deep navy black ops-console
        abyss: '#04070E',
        deep: '#060D1A',
        panel: '#0A1526',
        raised: '#0E2038',
        hover: '#122742',
        hairline: '#16304F',
        edge: '#1E3A5F',
        // brand
        electric: '#2C8CFF',
        cyanx: '#22D3EE',
        // risk scale (single source family — see lib/risk.js)
        safe: '#22C55E',
        moderate: '#EAB308',
        high: '#F97316',
        critical: '#EF4444',
        // text
        ink: '#E6F0FF',
        sub: '#8AA6C8',
        faint: '#54719B',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', '"Inter Variable"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(44, 140, 255, 0.18)',
        'glow-crit': '0 0 24px rgba(239, 68, 68, 0.22)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        sweep: 'sweep 2.4s linear infinite',
        'fade-up': 'fadeUp .45s cubic-bezier(.16,1,.3,1) both',
        blink: 'blink 1.1s steps(2,start) infinite',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.35, transform: 'scale(0.75)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        blink: { '50%': { opacity: 0 } },
      },
    },
  },
  plugins: [],
}
