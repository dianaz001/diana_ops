/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Notion-like colors
        'notion-bg': '#ffffff',
        'notion-bg-secondary': '#f7f6f3',
        'notion-text': '#37352f',
        'notion-text-secondary': '#787774',
        'notion-border': '#e3e2de',
        'notion-hover': '#efefef',
        'notion-blue': '#2383e2',
        'notion-red': '#eb5757',
        'notion-green': '#0f7b6c',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
