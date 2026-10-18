/** @type {import('tailwindcss').Config} */
const v = (name, fallback) => `rgb(var(--${name}, ${fallback}) / <alpha-value>)`
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: v('canvas', '250 250 249'),
        surface: v('surface', '255 255 255'),
        ink: v('ink', '17 17 19'),
        muted: v('muted', '100 100 110'),
        line: v('line', '228 228 231'),
        accent: v('accent', '37 99 235'),
        'on-accent': v('on-accent', '255 255 255'),
      },
      fontFamily: {
        display: ['var(--font-display, ui-serif)', 'Georgia', 'serif'],
        body: ['var(--font-body, ui-sans-serif)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body, ui-sans-serif)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}