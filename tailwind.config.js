module.exports = {
  content: [
    './index.html',
    './404.html',
    './src/**/*.{html,js,css}',
    './assets/**/*.{html,js}'
  ],
  theme: {
    extend: {
      fontFamily: {
        'baloo-2': ['"Baloo 2"', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'burni-orange': '#EA580C',
      },
      height: {
        chart: '300px',
      },
    },
  },
  plugins: [],
};
