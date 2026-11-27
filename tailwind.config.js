/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        deepobsidian: '#0A0D14',
        deepobsidianPanel: '#0F131C',
        cyberemerald: '#10B981',
        cyberemeraldHover: '#F3F4F6',
        subtleborder: '#2D313A',
        onyx: '#0A0D14',
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}