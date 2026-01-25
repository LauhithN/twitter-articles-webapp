import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          elevated: 'var(--background-elevated)',
        },
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
        },
        viral: {
          explosive: 'var(--viral-explosive)',
          hot: 'var(--viral-hot)',
          rising: 'var(--viral-rising)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          emphasis: 'var(--border-emphasis)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Display - for hero numbers, viral rankings
        'display-xl': ['72px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        display: ['32px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],

        // Headlines
        headline: ['24px', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        title: ['20px', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],

        // Body
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],

        // Metrics - tabular mono
        'metric-xl': ['32px', { lineHeight: '1.0', letterSpacing: '-0.02em', fontWeight: '600' }],
        'metric-lg': ['20px', { lineHeight: '1.2', letterSpacing: '0em', fontWeight: '500' }],
        metric: ['14px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '500' }],

        // Labels and meta
        label: ['11px', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
        meta: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        none: '0px',
      },
      boxShadow: {
        'glow-accent': '0 0 20px -5px rgba(0, 212, 255, 0.3)',
        'glow-viral': '0 0 20px -5px rgba(255, 51, 102, 0.3)',
        'card-hover': '0 8px 30px -12px rgba(0, 212, 255, 0.15)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'card-enter': 'fadeSlideUp 400ms ease-out backwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
