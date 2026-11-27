import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
    },
  },
  plugins: [],
};
export default config;
