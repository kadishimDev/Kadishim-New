/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FFA500', // Orange (User Request)
                accent: '#FF4500', // Deep Orange/Red
                dark: '#0a0500', // Deep Warm Black
                light: '#FFFaf0', // Warm White
            },
            fontFamily: {
                sans: ['Rubik', 'Assistant', 'system-ui', 'sans-serif'],
                serif: ['Frank Ruhl Libre', 'Cardo', 'serif'],
                display: ['Secular One', 'Rubik', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 15px rgba(255, 165, 0, 0.5)',
            },
            keyframes: {
                'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                'slide-up': { '0%': { transform: 'translateY(100%)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
                'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
                'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
                'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
                'glow': { '0%, 100%': { boxShadow: '0 0 5px rgba(234, 88, 12, 0.5)' }, '50%': { boxShadow: '0 0 20px rgba(234, 88, 12, 0.8)' } },
                'scroll-left': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
            },
            animation: {
                'fade-in': 'fade-in 0.6s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
                'scale-in': 'scale-in 0.4s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 3s linear infinite',
                'glow': 'glow 3s ease-in-out infinite',
                'scroll-left': 'scroll-left 30s linear infinite',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
