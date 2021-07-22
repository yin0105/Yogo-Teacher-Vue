module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
    './*.js',
    ],
  theme: {
    fontFamily: {
      'sans': ['Muli', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        blue: {
          default: '#0097a7',
          medium: '#02b8cc'
        },
      },
      maxHeight: {
        '20': '5rem'
      },
       spacing: {
        '60': '30rem'
       },
       height: {
        'workspace': '35rem'
       }
    },
  },
  variants: {},
  plugins: [],
}
