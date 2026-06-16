/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0a0e17',
        card: 'rgba(255,255,255,0.04)',
        accent: '#03dac6',
        accent2: '#bb86fc',
        muted: '#8892a4',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(3, 218, 198, 0.15)',
      },
    },
  },
  plugins: [],
};
