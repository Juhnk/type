import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Use CSS custom properties for all color values
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--primary-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
          soft: 'var(--color-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          soft: 'var(--color-warning-soft)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
          soft: 'var(--color-error-soft)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
          soft: 'var(--color-info-soft)',
        },
      },
      // Standardized border radius using CSS variables
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: '9999px',
      },
      // Typography scale from design tokens
      fontSize: {
        xxs: ['var(--text-xxs)', { lineHeight: 'var(--text-xxs-lh)' }],
        xs: ['var(--text-xs)', { lineHeight: 'var(--text-xs-lh)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--text-sm-lh)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--text-base-lh)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--text-lg-lh)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--text-xl-lh)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--text-2xl-lh)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--text-3xl-lh)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--text-4xl-lh)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--text-5xl-lh)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--text-6xl-lh)' }],
      },
      // Spacing scale from design tokens
      spacing: {
        '0': 'var(--space-0)',
        '0.5': 'var(--space-0_5)',
        '1': 'var(--space-1)',
        '1.5': 'var(--space-1_5)',
        '2': 'var(--space-2)',
        '2.5': 'var(--space-2_5)',
        '3': 'var(--space-3)',
        '3.5': 'var(--space-3_5)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)',
        '9': 'var(--space-9)',
        '10': 'var(--space-10)',
        '11': 'var(--space-11)',
        '12': 'var(--space-12)',
      },
      // Shadow scale from design tokens
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        none: 'var(--shadow-none)',
      },
      // Animation durations
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        slowest: 'var(--duration-slowest)',
      },
      // Animation timing functions
      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        bounce: 'var(--ease-bounce)',
        smooth: 'var(--ease-smooth)',
      },
      // Z-index scale
      zIndex: {
        auto: 'auto',
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        modal: '100',
        popover: '200',
        dropdown: '300',
        tooltip: '400',
        notification: '500',
      },
      // Component-specific heights
      height: {
        'input-sm': 'var(--input-height-sm)',
        input: 'var(--input-height-default)',
        'input-lg': 'var(--input-height-lg)',
      },
      // Ring width for focus states
      ringWidth: {
        DEFAULT: 'var(--ring-width)',
      },
      ringOffsetWidth: {
        DEFAULT: 'var(--ring-offset)',
      },
      // Font families
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
      },
      // Keyframes for custom animations
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
        'pulse-subtle': 'var(--animate-pulse-subtle)',
        'spin-slow': 'var(--animate-spin-slow)',
        'fade-in': 'var(--animate-fade-in)',
        'slide-up': 'var(--animate-slide-up)',
        'scale-in': 'var(--animate-scale-in)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for design system utilities
    function ({ addUtilities }: any) {
      addUtilities({
        // Consistent focus states
        '.focus-ring': {
          outline: 'none',
          '&:focus-visible': {
            '--tw-ring-offset-shadow':
              'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
            '--tw-ring-shadow':
              'var(--tw-ring-inset) 0 0 0 calc(var(--ring-width) + var(--tw-ring-offset-width)) var(--tw-ring-color)',
            'box-shadow':
              'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)',
            'border-color': 'var(--ring)',
          },
        },
        // Disabled states
        '.disabled-state': {
          '&:disabled': {
            'pointer-events': 'none',
            opacity: 'var(--opacity-disabled)',
          },
        },
        // Smooth transitions
        '.transition-base': {
          'transition-property':
            'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
          'transition-timing-function': 'var(--ease-in-out)',
          'transition-duration': 'var(--duration-normal)',
        },
        // Typography utilities
        '.text-body-xs': {
          fontSize: 'var(--text-body-xs)',
          lineHeight: 'var(--text-body-xs-lh)',
        },
        '.text-body-sm': {
          fontSize: 'var(--text-body-sm)',
          lineHeight: 'var(--text-body-sm-lh)',
        },
        '.text-body-base': {
          fontSize: 'var(--text-body-base)',
          lineHeight: 'var(--text-body-base-lh)',
        },
        '.text-body-lg': {
          fontSize: 'var(--text-body-lg)',
          lineHeight: 'var(--text-body-lg-lh)',
        },
        '.text-heading-sm': {
          fontSize: 'var(--text-heading-sm)',
          lineHeight: 'var(--text-heading-sm-lh)',
          fontWeight: 'var(--font-semibold)',
        },
        '.text-heading-base': {
          fontSize: 'var(--text-heading-base)',
          lineHeight: 'var(--text-heading-base-lh)',
          fontWeight: 'var(--font-semibold)',
        },
        '.text-heading-lg': {
          fontSize: 'var(--text-heading-lg)',
          lineHeight: 'var(--text-heading-lg-lh)',
          fontWeight: 'var(--font-bold)',
        },
        '.text-heading-xl': {
          fontSize: 'var(--text-heading-xl)',
          lineHeight: 'var(--text-heading-xl-lh)',
          fontWeight: 'var(--font-bold)',
        },
      });
    },
  ],
};

export default config;
