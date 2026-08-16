import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'var(--border)',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: 'var(--card)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--primary-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--foreground)',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    hover: '#fafafa',
                    border: '#e5e5e5',
                },
                peach: 'var(--peach)',
                sky: 'var(--sky)',
                cream: 'var(--cream)',
            },
            fontFamily: {
                serif: ['var(--font-instrument-serif)', 'Georgia', '"Times New Roman"', 'serif'],
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-instrument-serif)', 'Georgia', '"Times New Roman"', 'serif'],
                body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                '4xl': 'var(--radius-4xl)',
                '3xl': 'var(--radius-3xl)',
                '2xl': 'var(--radius-2xl)',
                xl: 'var(--radius-xl)',
                lg: 'var(--radius-lg)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'slide-down': 'slideDown 0.6s ease-out',
                'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'marquee': 'marquee 30s linear infinite',
                'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0,0,0,0.1)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 0 10px rgba(0,0,0,0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
