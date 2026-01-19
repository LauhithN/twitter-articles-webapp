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
        background: '#ffffff',
        foreground: '#000000',
        accent: '#00ff00',
        muted: '#666666',
        'hover-bg': '#f5f5f5',
        border: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        title: ['18px', { lineHeight: '1.4', fontWeight: '700' }],
        body: ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        meta: ['13px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
}
export default config
