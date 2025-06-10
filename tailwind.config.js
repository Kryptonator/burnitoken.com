module.exports = {
  content: [
    './index.html',
    './main.js',
    './src/**/*.css'
  ],
  theme: {
    extend: {
      fontFamily: {
        'baloo-2': ['"Baloo 2"', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
// Configures Tailwind CSS: specifies content files, extends the theme, and adds plugins.

// "build:css": "postcss src/styles.css -o assets/styles.min.css --env production"