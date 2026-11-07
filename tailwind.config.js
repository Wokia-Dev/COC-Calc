/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coc: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          gold: '#f59e0b',
          goldLight: '#fbbf24',
          elixir: '#ec4899',
          darkElixir: '#8b5cf6',
          builder: '#f97316',
          pet: '#10b981',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
};
