import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wayyak: {
          green: '#1B6B3A',
          deep: '#123621',
          mint: '#EAF5EE',
          sand: '#FAF7F0',
          gold: '#F5A623',
        },
      },
      fontFamily: {
        arabic: ['var(--font-tajawal)', 'var(--font-cairo)', 'sans-serif'],
        english: ['var(--font-dm-sans)', 'var(--font-syne)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 60px rgba(18, 54, 33, 0.10)',
        card: '0 14px 36px rgba(18, 54, 33, 0.08)',
      },
    },
  },
  plugins: [],
}
export default config
