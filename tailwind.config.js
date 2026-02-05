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
                sans: ['Assistant', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                }
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out',
                'fade-in_modal': 'fade-in 0.2s ease-out', // Alias for modal usage
                'fade-in-up': 'fade-in-up 0.5s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
