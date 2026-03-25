import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0D2B4E',
        blue: '#1B4F8C',
        mid: '#2E75B6',
        steel: '#4A90C4',
        light: '#D6E4F0',
        pale: '#F0F6FB',
        gold: '#C8972A',
        'gold-lt': '#FDF3DC',
        dark: '#1A1A2E',
        gray: '#595959',
        'lt-gray': '#F4F6F9',
        teal: '#0F6E56',
        'teal-lt': '#E1F5EE',
        coral: '#993C1D',
        'coral-lt': '#FAECE7',
        purple: '#3C3489',
        'purp-lt': '#EEEDFE',
        amber: '#854F0B',
        'amber-lt': '#FAEEDA',
        'score-high': '#0F6E56',
        'score-med': '#854F0B',
        'score-low': '#993C1D',
        'score-bg-high': '#E1F5EE',
        'score-bg-med': '#FAEEDA',
        'score-bg-low': '#FAECE7',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      maxWidth: {
        'readable': '68ch',
      },
      letterSpacing: {
        heading: '-0.02em',
      },
    },
  },
  plugins: [],
};
export default config;
