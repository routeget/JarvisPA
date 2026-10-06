/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jarvis: {
          dark: '#080c14',
          card: '#0f172a',
          cardHover: '#1e293b',
          border: '#1e293b',
          accent: '#06b6d4',      // Futuristic cyan
          accentHover: '#0891b2',
          purple: '#6366f1',      // Deep indigo
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          muted: '#64748b',
          light: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
