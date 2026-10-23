/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Angkor Sandstone & Bas-Relief Tokens
        stone: {
          50: 'var(--stone-50, #FAFAF9)',
          100: 'var(--stone-100, #FFFFFF)',
          200: 'var(--stone-200, #E7E5E4)',
          300: 'var(--stone-300, #D6D3D1)',
          400: 'var(--stone-400, #78716C)',
          500: 'var(--stone-500, #57534E)',
          600: 'var(--stone-600, #3F3F46)',
          700: 'var(--stone-700, #27272A)',
          800: 'var(--stone-800, #18181B)',
          850: 'var(--stone-850, #111827)',
          900: 'var(--stone-900, #0A0A0A)',
          950: 'var(--stone-950, #1e1e1e)',
        },
        laterite: {
          600: 'var(--laterite-600, #A8442A)',
          700: 'var(--laterite-700, #8A3520)',
        },
        moss: {
          600: 'var(--moss-600, #4F6B3A)',
        },
        gold: {
          500: 'var(--gold-500, #C9972B)',
        },
        river: {
          600: 'var(--river-600, #2F6F8F)',
        },
        danger: {
          600: 'var(--danger-600, #B3261E)',
        },

        // Legacy & Fallback Palettes
        angkor: {
          50: '#FDF9EC',
          100: '#FBF0CF',
          200: '#F6E19E',
          300: '#F0CD6D',
          400: '#E4B634',
          500: '#D4A017', // Angkor Gold Primary
          600: '#B88210',
          700: '#92610F',
          800: '#774C13',
          900: '#633F14',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E', // Deep Teal Primary
          800: '#115E59',
          900: '#134E4A',
        },
        temple: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A8A', // Temple Blue
          900: '#172554',
        },
        lotus: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#E11D74', // Lotus Pink Accent
          800: '#9D174D',
          900: '#831843',
        },
        darkbg: '#1e1e1e',
      },
      borderRadius: {
        card: 'var(--radius-card, 16px)',
        control: 'var(--radius-control, 12px)',
      },
      boxShadow: {
        raise: 'var(--relief-raise)',
        sink: 'var(--relief-sink)',
      },
      fontFamily: {
        km: ['"Kantumruy Pro"', '"Noto Sans Khmer"', '"Khmer OS"', 'system-ui', 'sans-serif'],
        'km-display': ['"Moul"', '"Kantumruy Pro"', 'serif'],
        en: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        'en-display': ['Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-family-body)', 'Inter', '"Kantumruy Pro"', 'sans-serif'],
        serif: ['var(--font-family-display)', 'Fraunces', '"Kantumruy Pro"', 'serif'],
        // Legacy fallbacks mapped strictly to allowed fonts:
        khmer: ['"Kantumruy Pro"', 'sans-serif'],
        moul: ['"Moul"', 'serif'],
        chenla: ['"Kantumruy Pro"', 'sans-serif'],
        taprom: ['"Kantumruy Pro"', 'sans-serif'],
        koulen: ['"Kantumruy Pro"', 'sans-serif'],
        editorial: ['Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        // Core 4 Mobile-First Tokens (+ optional hero)
        hero: ['clamp(1.75rem, 1.5rem + 1vw, 2rem)', { lineHeight: 'var(--lh-display, 1.5)', fontWeight: '700' }], // 28px - 32px
        heading: ['1.5rem', { lineHeight: 'var(--lh-h1, 1.5)', fontWeight: '700' }], // 24px (Khmer 1.5, English 1.25)
        subheading: ['1.125rem', { lineHeight: 'var(--lh-h3, 1.5)', fontWeight: '600' }], // 18px (Khmer 1.5, English 1.3)
        body: ['1rem', { lineHeight: 'var(--lh-body, 1.8)', fontWeight: '400' }], // 16px (Khmer 1.8, English 1.6)
        small: ['0.875rem', { lineHeight: 'var(--lh-small, 1.7)', fontWeight: '400' }], // 14px (Khmer 1.7, English 1.5)

        // Compatibility aliases mapped strictly to allowed scale:
        display: ['clamp(1.75rem, 1.5rem + 1vw, 2rem)', { lineHeight: 'var(--lh-display, 1.5)', fontWeight: '700' }],
        h1: ['1.5rem', { lineHeight: 'var(--lh-h1, 1.5)', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: 'var(--lh-h2, 1.5)', fontWeight: '700' }],
        h3: ['1.125rem', { lineHeight: 'var(--lh-h3, 1.5)', fontWeight: '600' }],
        base: ['1rem', { lineHeight: 'var(--lh-body, 1.8)', fontWeight: '400' }],
        sm: ['0.875rem', { lineHeight: 'var(--lh-small, 1.7)', fontWeight: '400' }],
        xs: ['0.875rem', { lineHeight: 'var(--lh-small, 1.7)', fontWeight: '400' }], // Never below 14px
      },
      screens: {
        xs: '360px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      height: {
        '100dvh': '100dvh',
        '85dvh': '85dvh',
        '60dvh': '60dvh',
      },
      minHeight: {
        '100dvh': '100dvh',
        'screen-dvh': '100dvh',
      },
      maxHeight: {
        '85dvh': '85dvh',
        '90dvh': '90dvh',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
    },
  },
  plugins: [],
}
