/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paw: {
          background: '#FDFAF4',
          card: '#FFFFFF',
          border: '#DDD3C4',
          primary: '#2C1810',
          secondary: '#5C3D2E',
          healthy: '#4A7C59',
          warning: '#E8A020',
          danger: '#D95F5F',
          muted: '#9E8E82',
        },
      },
      fontFamily: {
        title: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      maxWidth: {
        app: '480px',
      },
      borderRadius: {
        card: '18px',
        control: '10px',
      },
    },
  },
  plugins: [],
};
