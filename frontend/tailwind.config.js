/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3478E8',
          pale: '#EFF6FF',
          bg: '#F7F9FC',
          text: '#202833',
          muted: '#737B86',
          divider: '#E9EDF2',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'float': '0 8px 24px -4px rgba(52, 120, 232, 0.18)',
      }
    },
  },
  plugins: [],
}
