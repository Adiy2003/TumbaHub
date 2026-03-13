import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#2d2d2d',
          600: '#3d3d3d',
          500: '#4d4d4d',
        },
        coins: '#fcd34d',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config
