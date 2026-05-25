/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#C9A227', dark: '#A9861F', light: '#F5E6B8' },
        navy:      { DEFAULT: '#0B1F3A', light: '#132C52' },
        surface:   '#F8FAFC',
        border:    '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 20px rgba(0,0,0,0.10)',
        modal: '0 20px 60px rgba(0,0,0,0.30)',
      }
    },
  },
  plugins: [],
}
