import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0A1F1C',
          light: '#1B4332',
        },
        emerald: {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
        },
        sage: {
          DEFAULT: '#95D5B2',
          light: '#D8EDE6',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F0E6C8',
        },
        ice: '#F0F7F4',
        snow: '#FAFCFB',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(10, 31, 28, 0.06), 0 1px 2px rgba(10, 31, 28, 0.04)',
        elevated: '0 10px 25px rgba(10, 31, 28, 0.08), 0 4px 10px rgba(10, 31, 28, 0.04)',
        sidebar: '4px 0 20px rgba(10, 31, 28, 0.08)',
        glow: '0 0 0 1px rgba(45, 106, 79, 0.05)',
        'glow-hover': '0 8px 30px rgba(45, 106, 79, 0.12), 0 0 0 1px rgba(45, 106, 79, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(45, 106, 79, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(45, 106, 79, 0)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;