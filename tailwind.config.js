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
        gh: {
          'canvas-default': '#0d1117',
          'canvas-subtle': '#161b22',
          'canvas-inset': '#010409',
          'border-default': '#30363d',
          'border-muted': '#21262d',
          'fg-default': '#f0f6fc',
          'fg-muted': '#8b949e',
          'fg-subtle': '#6e7681',
          'accent-fg': '#58a6ff',
          'accent-emphasis': '#1f6feb',
          'accent-subtle': 'rgba(56, 139, 253, 0.15)',
          'success-fg': '#3fb950',
          'success-emphasis': '#238636',
          'success-subtle': 'rgba(46, 160, 67, 0.15)',
          'danger-fg': '#f85149',
          'danger-emphasis': '#da3633',
          'danger-subtle': 'rgba(248, 81, 73, 0.15)',
          'severe-fg': '#db6d28',
          'severe-subtle': 'rgba(219, 109, 40, 0.15)',
          'warning-fg': '#d29922',
          'warning-subtle': 'rgba(187, 128, 9, 0.15)',
          'purple-fg': '#a371f7',
          'purple-subtle': 'rgba(163, 113, 247, 0.15)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Consolas', '"Liberation Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
