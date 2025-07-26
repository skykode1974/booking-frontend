/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Enables class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // optional if using App Router
  ],
  theme: {
    extend: {
      animation: {
        'border-spin': 'border-spin 5s linear infinite',
        'zoom-in': 'zoomIn 0.4s ease-out forwards',
        'gradient': 'gradient 5s ease infinite',
      },
      keyframes: {
        'border-spin': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        zoomIn: {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    // add other plugins if needed
  ],
};
