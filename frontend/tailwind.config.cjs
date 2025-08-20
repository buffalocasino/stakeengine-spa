const typography = require('@tailwindcss/typography')
const forms = require('@tailwindcss/forms')

module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9e6',
          100: '#fff3cc',
          200: '#ffe799',
          300: '#ffdb66',
          400: '#ffcf33',
          500: '#d4af37', // Old gold
          600: '#b8941f',
          700: '#9c7a17',
          800: '#805f0f',
          900: '#644507',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#2d2d2d', // Dark charcoal
          950: '#1a1a1a',
        }
      }
    }
  },
  plugins: [
    typography, 
    forms,
    require('flowbite/plugin')
  ],
}