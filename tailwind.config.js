const defaultTheme = require('tailwindcss/defaultTheme')

const FONT_FAMILY = process.env.NEXT_PUBLIC_FONT_FAMILY || 'Inter'
const PRIMARY_COLOR = process.env.NEXT_PUBLIC_PRIMARY_COLOR || 'default'

const primaryColors = {
  red: {
    100: '#fee2e2',
    300: '#fca5a5',
    500: '#ef4444',
    700: '#b91c1c',
    900: '#7f1d1d',
  },
  orange: {
    100: '#ffedd5',
    300: '#fdba74',
    500: '#f97316',
    700: '#c2410c',
    900: '#7c2d12',
  },
  lime: {
    100: '#ecfccb',
    300: '#bef264',
    500: '#84cc16',
    700: '#4d7c0f',
    900: '#365314',
  },
  green: {
    100: '#dcfce7',
    300: '#86efac',
    500: '#22c55e',
    700: '#15803d',
    900: '#14532d',
  },
  blue: {
    100: '#dbeafe',
    300: '#93c5fd',
    500: '#3b82f6',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  purple: {
    100: '#EBDCFF',
    300: '#D9BCFF',
    500: '#B47AFF',
    700: '#8221FE',
    900: '#48138F',
  },
  toxic: {
    100: '#f5f6db',
    300: '#ecedbd',
    500: '#d9dc82',
    700: '#C0C53F',
    900: '#adb139',
  },
  pink: {
    100: '#FFE8F5',
    300: '#FFD0EB',
    500: '#FDA2D5',
    700: '#FC96D0',
    900: '#975B7D',
  },
  babyblue: {
    100: '#F8FEFF',
    300: '#E5FAFF',
    500: '#9DEBFF',
    700: '#5CDEFF',
    900: '#337D8F',
  },
  ocean: {
    100: '#9395FE',
    300: '#6D6FFD',
    500: '#5255FD',
    700: '#3F42FC',
    900: '#262897',
  },
  lavender: {
    100: '#F7F7FE',
    300: '#C7C4F7',
    500: '#625BE9',
    700: '#6366F1',
    900: '#2c2881',
  },
  cherry: {
    100: '#FCF5F6',
    300: '#ECB9BD',
    500: '#D97B83',
    700: '#C03540',
    900: '#6B1E24',
  },
  dirt: {
    100: '#FEFCFA',
    300: '#F6E6D8',
    500: '#EDCEB2',
    700: '#E0AF84',
    900: '#7E624A',
  },
    redpink: {
    100: '#f3beca',
    300: '#e78399',
    500: '#db506e',
    700: '#d63c5e',
    900: '#c13654',
  },
    darkpink: {
    100: '#f6c4d4',
    300: '#ed8cab',
    500: '#e45c87',
    700: '#e04778',
    900: '#ca416c',
  },
    redred: {
    100: '#faafaf',
    300: '#f46262',
    500: '#ef1d1d',
    700: '#e00',
    900: '#d50000',
  },
    creepzpurple: {
    100: '#decaf4',
    300: '#c098ea',
    500: '#a56de0',
    700: '#9b5ddc',
    900: '#8a53c5',
  },
    darkpurple: {
    100: '#cdcbfc',
    300: '#9d98f9',
    500: '#7069f6',
    700: '#5F57F6',
    900: '#544ddc',
  },
  default: {
    100: '#F1E5FF',
    300: '#E2CCFF',
    500: '#A966FF',
    700: '#7000FF',
    900: '#430099',
  },
}

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
        21: 'repeat(21, minmax(0, 1fr))',
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        headings: [`"${FONT_FAMILY}"`, ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'slide-down': {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'spin-loading': 'spin 1s cubic-bezier(0.76, 0.35, 0.2, 0.7) infinite',
        'slide-down': 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-reverse': 'spin 1s reverse linear infinite',
      },

      colors: {
        primary: primaryColors[PRIMARY_COLOR],
        'dark-backdrop': 'rgba(0, 0, 0, 0.8)',
        backdrop: 'rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [
    require('tailwindcss-radix')(),
    require('@ramosdiego/reservoir')({
      buttons: {
        animate: true,
      },
    }),
  ],
}
