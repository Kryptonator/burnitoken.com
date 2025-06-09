module.exports = {
  content: [
    './index.html',
    './main.js',
    './src/**/*.css'
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'baloo-2': ['"Baloo 2"', 'cursive'],
      },
    },
  },
  plugins: [],
};
// Configures Tailwind CSS: specifies content files, extends the theme, and adds plugins.

// "build:css": "postcss src/styles.css -o assets/styles.min.css --env production"