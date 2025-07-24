import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Your custom color palette
        cream: '#FEFAE0', // Color cream definido
        green: {
          50: '#F5F8F2', // Muy claro
          100: '#E8F0E0', // Claro
          200: '#D1E2C2', // Medio claro
          300: '#B8D3A0', // Medio
          400: '#9BC482', // Medio oscuro
          500: '#88AC6F', // Base
          600: '#819067', // Medium green (referencia)
          700: '#6B7855', // Oscuro intermedio
          800: '#4A5239', // Muy oscuro
          900: '#0A400C', // Dark green (referencia movida)
        },
        blue: {
          50: '#F9F3EF', // Light cream/beige
          100: '#D2C1B6', // Light blue-grey
          500: '#456882', // Medium blue
          600: '#1B3C53', // Dark blue
          700: '#0F2D40', // Darker blue for hover states
        },
        // UI color system using CSS variables for better integration
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card, 0 0% 100%))',
          foreground: 'hsl(var(--card-foreground, var(--foreground)))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover, var(--card)))',
          foreground: 'hsl(var(--popover-foreground, var(--card-foreground)))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))', // Dark blue
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary, var(--green-600)))', // Medium green
          foreground: 'hsl(var(--secondary-foreground, var(--green-700)))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted, var(--green-50)))',
          foreground: 'hsl(var(--muted-foreground, var(--green-600)))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent, var(--blue-100)))',
          foreground: 'hsl(var(--accent-foreground, var(--blue-600)))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive, 0 84% 60%))',
          foreground: 'hsl(var(--destructive-foreground, 0 0% 98%))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input, var(--border)))',
        ring: 'hsl(var(--ring, var(--primary)))',

        // Standard grays using your palette
        gray: {
          50: '#FEFAE0',
          100: '#F9F3EF',
          200: '#D2C1B6',
          300: '#B1AB86',
          400: '#819067',
          500: '#456882',
          600: '#1B3C53',
          700: '#0A400C',
          800: '#083308',
          900: '#062606',
        },
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #1B3C53 0%, #456882 100%)',
        'gradient-green': 'linear-gradient(135deg, #0A400C 0%, #819067 100%)',
        'gradient-natural': 'linear-gradient(135deg, #FEFAE0 0%, #F9F3EF 100%)',
        'circular-gradient':
          'radial-gradient(circle at 20% 50%, rgba(27, 60, 83, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(69, 104, 130, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(129, 144, 103, 0.2) 0%, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        float: 'float 6s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      boxShadow: {
        card: '0 4px 20px rgba(27, 60, 83, 0.15)',
        'card-hover': '0 8px 30px rgba(27, 60, 83, 0.25)',
        glow: '0 0 20px rgba(27, 60, 83, 0.3)',
        soft: '0 2px 15px rgba(69, 104, 130, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
