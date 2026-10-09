import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        surface: '#181818',
        raised: '#202020',
        gold: { DEFAULT: '#D4B05C', soft: '#E8D9A0', deep: '#9c803a' },
        ivory: { DEFAULT: '#F5F0E6', dim: '#b9b3a6' },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
