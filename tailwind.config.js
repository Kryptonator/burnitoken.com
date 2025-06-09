tailwind.config.js

module.exports = {
  content: [
    './*.html',
    './assets/**/*.js',
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
```javascript