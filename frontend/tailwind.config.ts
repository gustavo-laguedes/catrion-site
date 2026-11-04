import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '40rem',
      md: '48rem',
      lg: '64rem',
      xl: '80rem',
      '2xl': '96rem'
    },
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        muted: 'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'accent-foreground': 'var(--color-accent-foreground)'
      },
      fontFamily: { sans: ['var(--font-interface)'] },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)' },
      zIndex: { header: 'var(--z-header)', overlay: 'var(--z-overlay)' }
    }
  },
  plugins: []
} satisfies Config;
