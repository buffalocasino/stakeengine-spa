const typography = require('@tailwindcss/typography')
const forms = require('@tailwindcss/forms')

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: [typography, forms],
}